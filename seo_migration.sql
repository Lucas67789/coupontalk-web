-- ==========================================
-- SEO 강화를 위한 DB 마이그레이션
-- Supabase SQL Editor에서 실행하세요
-- ==========================================

-- 1. coupons 테이블에 SEO 전용 컬럼 추가
-- 기존 컬럼은 변경하지 않습니다.

-- SEO 제목 (title 태그 + H1 + 검색결과 제목)
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS seo_title text;

-- SEO 설명 (meta description + 검색결과 설명문)
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS seo_description text;

-- 상세 콘텐츠 본문 (마크다운 형식, H2/H3 구조)
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS content_body text;


-- 2. RLS 정책은 이미 coupons 테이블에 적용되어 있으므로 추가 불필요
-- (기존 "Allow public read access on coupons" 정책이 모든 SELECT를 허용)


-- ==========================================
-- 확인용 쿼리 (실행 후 결과 확인)
-- ==========================================
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'coupons' 
-- ORDER BY ordinal_position;
