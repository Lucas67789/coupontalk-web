BEGIN;
CREATE TABLE IF NOT EXISTS public.analytics_events (
 id uuid PRIMARY KEY,
 created_at timestamptz NOT NULL DEFAULT now(),
 event_name text NOT NULL CHECK (event_name IN ('page_view','affiliate_click','code_copy')),
 session_id uuid NOT NULL, visitor_id uuid NOT NULL,
 path text NOT NULL, landing_path text NOT NULL,
 source text NOT NULL DEFAULT '직접/출처 불명', keyword text,
 store_id text, coupon_id text, product_id text, subscription_slug text,
 target_host text, button_label text,
 device text NOT NULL DEFAULT 'desktop', is_test boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS analytics_events_created ON public.analytics_events(created_at,id);
CREATE INDEX IF NOT EXISTS analytics_events_session ON public.analytics_events(session_id,created_at);
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.analytics_events FROM anon, authenticated;
GRANT SELECT ON public.analytics_events TO authenticated;
CREATE POLICY analytics_admin_read ON public.analytics_events FOR SELECT TO authenticated USING (public.is_admin());
COMMIT;
NOTIFY pgrst, 'reload schema';
