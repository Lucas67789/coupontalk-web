-- 1. 쿠폰 테이블에 click_count 컬럼 추가
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS click_count integer DEFAULT 0;

-- 2. 클릭수를 1씩 증가시키는 안전한 함수(RPC) 생성
CREATE OR REPLACE FUNCTION increment_coupon_click(coupon_id text)
RETURNS void AS $$
BEGIN
  UPDATE coupons 
  SET click_count = COALESCE(click_count, 0) + 1 
  WHERE id = coupon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
