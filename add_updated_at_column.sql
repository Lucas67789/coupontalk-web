-- coupons, stores 테이블에 updated_at 컬럼 추가 + 자동 갱신 트리거

ALTER TABLE coupons ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE stores ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE coupons SET updated_at = created_at WHERE updated_at IS NULL;
UPDATE stores SET updated_at = created_at WHERE updated_at IS NULL;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_coupons_updated_at ON coupons;
CREATE TRIGGER trg_coupons_updated_at
    BEFORE UPDATE ON coupons
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_stores_updated_at ON stores;
CREATE TRIGGER trg_stores_updated_at
    BEFORE UPDATE ON stores
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
