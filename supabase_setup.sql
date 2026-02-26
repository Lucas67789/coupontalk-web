-- 1. Create Categories table
CREATE TABLE categories (
    id text PRIMARY KEY,
    name text NOT NULL,
    icon text,
    description text
);

-- 2. Create Stores table
CREATE TABLE stores (
    id text PRIMARY KEY,
    name text NOT NULL,
    description text,
    logo text,
    rating numeric,
    tags text[],
    events jsonb DEFAULT '[]'::jsonb,
    faqs jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- 3. Create Coupons table
CREATE TABLE coupons (
    id text PRIMARY KEY,
    store_id text REFERENCES stores(id) ON DELETE CASCADE,
    title text NOT NULL,
    code text,
    discount text,
    condition text,
    expiry text,
    affiliate_url text,
    created_at timestamp with time zone DEFAULT now()
);

-- 4. Enable Row Level Security (RLS) but allow public read access
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on categories" ON categories FOR SELECT USING (true);

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on stores" ON stores FOR SELECT USING (true);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on coupons" ON coupons FOR SELECT USING (true);


-- ==========================================
-- INSERT INITIAL MOCK DATA
-- ==========================================

-- Insert Categories
INSERT INTO categories (id, name, icon, description) VALUES
('travel', '호텔·항공권', 'Plane', '알뜰한 여행을 위한 예약 할인'),
('fashion', '명품·패션', 'ShoppingBag', '트렌디한 아이템 할인 정보'),
('electronics', '전자제품', 'Laptop', '최신 가전/IT기기 할인 모음'),
('health', '건강식품', 'Heart', '내 몸을 위한 영양제 특가'),
('lifestyle', '라이프스타일', 'Coffee', '일상의 소소한 행복, 리빙/홈 카테고리');

-- Insert Stores
INSERT INTO stores (id, name, description, logo, rating, tags, events, faqs) VALUES
('aliexpress', '알리익스프레스', '전 세계의 다양한 상품을 저렴하게 직구하세요.', 'https://img.alicdn.com/tfs/TB1V2eKwwDqK1RjSZSyXXaxEVXa-340-100.png', 4.8, ARRAY['electronics', 'fashion', 'lifestyle'], '[{"date": "2026.02.09 ~ 02.24", "title": "[설레는 특가전]"}, {"date": "2026.02.15 ~ 02.23", "title": "[미리 만나는 봄]"}]'::jsonb, '[{"answer": "결제 시 프로모션 코드 입력란에 발급받은 코드를 입력하고 적용 버튼을 누르시면 됩니다.", "question": "알리익스프레스 할인코드는 어떻게 사용하나요?"}]'::jsonb),
('agoda', '아고다', '전 세계 호텔 예약 최저가 보장, 시크릿 특가 혜택', 'https://cdn6.agoda.net/images/agodavip/logo-agoda-vip.png', 4.9, ARRAY['travel'], '[]'::jsonb, '[]'::jsonb),
('coupang', '쿠팡', '로켓배송으로 내일 당장 받아보세요.', 'https://image9.coupangcdn.com/image/coupang/common/logo_coupang_w350.png', 4.9, ARRAY['lifestyle', 'electronics', 'fashion'], '[]'::jsonb, '[]'::jsonb);

-- Insert Coupons
INSERT INTO coupons (id, store_id, title, code, discount, condition, expiry, affiliate_url) VALUES
('ali-1', 'aliexpress', '$50 이상 구매 시 $6 할인', 'ALI6', '$6', '$50 이상 구매 시', '2026.12.31', 'https://s.click.aliexpress.com/e/_example1'),
('ali-2', 'aliexpress', '$100 이상 구매 시 $15 할인', 'ALI15', '$15', '$100 이상 구매 시', '2026.12.31', 'https://s.click.aliexpress.com/e/_example2'),
('agoda-1', 'agoda', '전 세계 숙소 7% 추가 할인', 'AGODA7', '7%', '앱으로 첫 예약 시', '2026.06.30', 'https://agoda.com/example'),
('coupang-1', 'coupang', '로켓와우 첫 달 무료체험', 'NO_CODE_REQUIRED', '무료체험', '신규 와우 회원 한정', '상시진행', 'https://m.coupang.com/example');
