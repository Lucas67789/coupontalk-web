-- Append validated events and update the existing popularity counter atomically.
-- No public table reads, direct updates or deletes.
CREATE OR REPLACE FUNCTION public.record_analytics_event(payload jsonb)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE sid uuid := (payload->>'session_id')::uuid; event_id uuid := (payload->>'id')::uuid; inserted_count integer; test_event boolean := coalesce((payload->>'is_test')::boolean,false) OR coalesce(public.is_admin(),false);
BEGIN
 IF octet_length(payload::text)>5000 OR payload->>'event_name' NOT IN ('page_view','affiliate_click','code_copy') OR (coalesce(payload->>'path','') !~ '^/[^/]' AND payload->>'path' IS DISTINCT FROM '/') OR payload->>'path' LIKE '/admin%' OR position('?' in payload->>'path')>0 OR length(payload->>'path')>600 THEN
  RAISE EXCEPTION 'Invalid event';
 END IF;
 IF EXISTS(SELECT 1 FROM analytics_events WHERE id=event_id) THEN RETURN true; END IF;
 IF (SELECT count(*) FROM analytics_events WHERE session_id=sid AND created_at>now()-interval '5 minutes')>=300 THEN RETURN false; END IF;
 INSERT INTO analytics_events(id,event_name,session_id,visitor_id,path,landing_path,source,keyword,store_id,coupon_id,product_id,subscription_slug,target_host,button_label,device,is_test)
 VALUES(event_id,payload->>'event_name',sid,(payload->>'visitor_id')::uuid,payload->>'path',left(coalesce(payload->>'landing_path',payload->>'path'),600),left(coalesce(payload->>'source','직접/출처 불명'),150),left(payload->>'keyword',150),left(payload->>'store_id',150),left(payload->>'coupon_id',150),left(payload->>'product_id',150),left(payload->>'subscription_slug',150),left(payload->>'target_host',150),left(payload->>'button_label',100),CASE WHEN payload->>'device'='mobile' THEN 'mobile' ELSE 'desktop' END,test_event)
 ON CONFLICT(id) DO NOTHING;
 GET DIAGNOSTICS inserted_count = ROW_COUNT;
 IF inserted_count=1 AND NOT test_event AND payload->>'event_name'='affiliate_click' AND payload->>'coupon_id' IS NOT NULL THEN
  UPDATE public.coupons SET click_count=coalesce(click_count,0)+1 WHERE id::text=payload->>'coupon_id';
 END IF;
 RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.record_analytics_event(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_analytics_event(jsonb) TO anon,authenticated;
NOTIFY pgrst,'reload schema';
