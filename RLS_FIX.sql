-- 1. stores 테이블에 website_url 컬럼 추가 (없으면 생성)
ALTER TABLE stores ADD COLUMN IF NOT EXISTS website_url text;

-- 2. 관리자가 데이터를 추가, 수정, 삭제할 수 있도록 RLS 권한 전면 개방
CREATE POLICY "Allow all actions for authenticated users on stores" ON stores FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all actions for authenticated users on coupons" ON coupons FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all actions for authenticated users on categories" ON categories FOR ALL TO authenticated USING (true);
