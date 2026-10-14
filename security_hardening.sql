-- Run as database owner in Supabase SQL Editor. Atomic and safe to re-run.
BEGIN;
-- Keep the original access rules in a non-exposed schema before changing them.
CREATE SCHEMA IF NOT EXISTS maintenance_backup;
REVOKE ALL ON SCHEMA maintenance_backup FROM PUBLIC, anon, authenticated;
DO $$ BEGIN
 IF to_regclass('maintenance_backup.access_before_20261014') IS NULL THEN
  CREATE TABLE maintenance_backup.access_before_20261014 AS
  SELECT now() AS saved_at,
   (SELECT jsonb_agg(to_jsonb(p)) FROM pg_policies p WHERE schemaname IN ('public','storage')) AS policies,
   (SELECT jsonb_agg(to_jsonb(g)) FROM information_schema.role_table_grants g WHERE grantee IN ('anon','authenticated') AND table_schema IN ('public','storage')) AS grants,
   (SELECT jsonb_agg(jsonb_build_object('name',p.oid::regprocedure::text,'definition',pg_get_functiondef(p.oid))) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.prokind='f') AS functions,
   pg_get_viewdef('public.public_coupons'::regclass,true) AS public_coupons_view;
 END IF;
END $$;
CREATE TABLE IF NOT EXISTS public.admin_users (user_id uuid PRIMARY KEY REFERENCES auth.users(id));
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_users FROM anon, authenticated;
-- Existing confirmed operator account, verified on 2026-10-02.
INSERT INTO public.admin_users(user_id) VALUES ('5e8e611c-839d-4df4-be84-1f7701db9006') ON CONFLICT DO NOTHING;
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = (SELECT auth.uid()));
$$;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;
DO $$ DECLARE p record; t text; BEGIN
 FOR p IN SELECT tablename,policyname FROM pg_policies WHERE schemaname='public' AND tablename IN ('stores','categories','coupons','products')
 LOOP EXECUTE format('DROP POLICY %I ON public.%I', p.policyname,p.tablename); END LOOP;
 FOREACH t IN ARRAY ARRAY['stores','categories','coupons','products'] LOOP
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated',t);
  EXECUTE format('GRANT SELECT ON public.%I TO anon',t);
  EXECUTE format('GRANT SELECT,INSERT,UPDATE,DELETE ON public.%I TO authenticated',t);
  EXECUTE format('CREATE POLICY admin_manage ON public.%I FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())',t);
  IF t IN ('coupons','products') THEN
   EXECUTE format('CREATE POLICY published_read ON public.%I FOR SELECT TO anon, authenticated USING (status = ''published'' AND published_at <= now())',t);
  ELSE
   EXECUTE format('CREATE POLICY public_read ON public.%I FOR SELECT TO anon, authenticated USING (true)',t);
  END IF;
 END LOOP;
END $$;
ALTER VIEW public.public_coupons SET (security_invoker = true);
REVOKE ALL ON public.public_coupons FROM anon, authenticated;
GRANT SELECT ON public.public_coupons TO anon, authenticated;
DO $$ DECLARE p record; t text; BEGIN
 FOR p IN SELECT tablename,policyname FROM pg_policies WHERE schemaname='public' AND tablename IN ('page_views','click_events')
 LOOP EXECUTE format('DROP POLICY %I ON public.%I',p.policyname,p.tablename); END LOOP;
 FOREACH t IN ARRAY ARRAY['page_views','click_events'] LOOP
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated',t);
  EXECUTE format('GRANT INSERT ON public.%I TO anon, authenticated',t);
  EXECUTE format('GRANT SELECT,UPDATE,DELETE ON public.%I TO authenticated',t);
  EXECUTE format('CREATE POLICY analytics_insert ON public.%I FOR INSERT TO anon, authenticated WITH CHECK (true)',t);
  EXECUTE format('CREATE POLICY admin_manage ON public.%I FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())',t);
 END LOOP;
END $$;
-- Restrictive rules constrain existing broad image storage policies too.
DROP POLICY IF EXISTS images_admin_insert ON storage.objects;
CREATE POLICY images_admin_insert ON storage.objects AS RESTRICTIVE FOR INSERT TO anon, authenticated WITH CHECK (bucket_id <> 'images' OR public.is_admin());
DROP POLICY IF EXISTS images_admin_update ON storage.objects;
CREATE POLICY images_admin_update ON storage.objects AS RESTRICTIVE FOR UPDATE TO anon, authenticated USING (bucket_id <> 'images' OR public.is_admin()) WITH CHECK (bucket_id <> 'images' OR public.is_admin());
DROP POLICY IF EXISTS images_admin_delete ON storage.objects;
CREATE POLICY images_admin_delete ON storage.objects AS RESTRICTIVE FOR DELETE TO anon, authenticated USING (bucket_id <> 'images' OR public.is_admin());
DROP POLICY IF EXISTS images_admin_manage ON storage.objects;
CREATE POLICY images_admin_manage ON storage.objects FOR ALL TO authenticated USING (bucket_id='images' AND public.is_admin()) WITH CHECK (bucket_id='images' AND public.is_admin());
CREATE OR REPLACE FUNCTION public.increment_coupon_click(coupon_id text) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
 UPDATE public.coupons SET click_count=COALESCE(click_count,0)+1 WHERE id=coupon_id AND status='published' AND published_at<=now();
$$;
REVOKE ALL ON FUNCTION public.increment_coupon_click(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_coupon_click(text) TO anon, authenticated;
CREATE TABLE IF NOT EXISTS public.content_change_log (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, changed_at timestamptz NOT NULL DEFAULT now(), actor uuid,
 table_name text NOT NULL, row_id text NOT NULL, operation text NOT NULL, before_value jsonb, after_value jsonb
);
ALTER TABLE public.content_change_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.content_change_log FROM anon, authenticated;
GRANT SELECT ON public.content_change_log TO authenticated;
DROP POLICY IF EXISTS admin_audit_read ON public.content_change_log;
CREATE POLICY admin_audit_read ON public.content_change_log FOR SELECT TO authenticated USING (public.is_admin());
CREATE OR REPLACE FUNCTION public.audit_content_change() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE before_data jsonb; after_data jsonb;
BEGIN
 IF TG_OP <> 'INSERT' THEN before_data:=to_jsonb(OLD)-'click_count'-'updated_at'; END IF;
 IF TG_OP <> 'DELETE' THEN after_data:=to_jsonb(NEW)-'click_count'-'updated_at'; END IF;
 IF before_data IS DISTINCT FROM after_data THEN
  INSERT INTO public.content_change_log(actor,table_name,row_id,operation,before_value,after_value)
  VALUES(auth.uid(),TG_TABLE_NAME,COALESCE(after_data->>'id',before_data->>'id'),TG_OP,before_data,after_data);
 END IF;
 RETURN COALESCE(NEW,OLD);
END $$;
REVOKE ALL ON FUNCTION public.audit_content_change() FROM PUBLIC;
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['stores','coupons','products'] LOOP
  EXECUTE format('DROP TRIGGER IF EXISTS audit_content_change ON public.%I',t);
  EXECUTE format('CREATE TRIGGER audit_content_change AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.audit_content_change()',t);
 END LOOP;
END $$;
NOTIFY pgrst, 'reload schema';
COMMIT;
