ALTER TABLE coupons ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT true;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS affiliate_url text;

-- 새로고침(schema 캐시 갱신)을 위해 권한 재부여 (선택적)
GRANT ALL PRIVILEGES ON TABLE coupons TO authenticated;
GRANT ALL PRIVILEGES ON TABLE coupons TO anon;
