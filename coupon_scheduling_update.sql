-- 1. 쿠폰 테이블에 상태 및 발행일 컬럼 추가
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ DEFAULT NOW();

-- 2. 기존 쿠폰들은 모두 즉시 발행 상태로 업데이트 (기존 생성일을 발행일로 지정)
UPDATE coupons 
SET status = 'published', published_at = created_at 
WHERE status = 'draft'; 
-- 초기 생성 시 디폴트가 draft로 들어갔을 수 있으므로 전체 업데이트
UPDATE coupons SET status = 'published' WHERE status IS NULL;
UPDATE coupons SET published_at = created_at WHERE published_at IS NULL;

-- 3. 퍼블릭 화면을 위한 View 생성 (발행됨 + 시간이 현재보다 과거인 것만)
CREATE OR REPLACE VIEW public_coupons AS 
SELECT * FROM coupons 
WHERE status = 'published' AND published_at <= NOW();

-- 4. 권한 부여 (익명 사용자 읽기 권한)
GRANT SELECT ON public_coupons TO anon, authenticated;
