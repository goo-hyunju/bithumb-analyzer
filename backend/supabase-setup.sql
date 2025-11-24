-- ============================================
-- CAPAS 라이선스 시스템 - Supabase 테이블 생성
-- ============================================

-- 1. 라이선스 테이블 생성
CREATE TABLE IF NOT EXISTS licenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  license_key TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  activated_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  kmong_order_id TEXT, -- 크몽 주문 ID (선택사항)
  notes TEXT -- 메모 (선택사항)
);

-- 2. 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_licenses_key ON licenses(license_key);
CREATE INDEX IF NOT EXISTS idx_licenses_active ON licenses(is_active);

-- 3. Row Level Security (RLS) 설정
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;

-- 4. 정책 설정 (읽기만 가능하도록)
-- 서비스 키를 사용하는 경우 RLS를 우회하므로 이 정책은 선택사항입니다.
CREATE POLICY "Allow service role to read licenses"
  ON licenses FOR SELECT
  USING (true);

-- 5. 예시 데이터 삽입 (테스트용)
-- INSERT INTO licenses (license_key, is_active) 
-- VALUES ('CAPAS-DEMO-0000-TEST-0000', true);

-- 6. 확인 쿼리
-- SELECT * FROM licenses WHERE license_key = 'CAPAS-DEMO-0000-TEST-0000';

