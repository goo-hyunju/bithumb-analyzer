// Supabase 클라이언트 설정 (선택적)
let supabase = null;
let supabaseAvailable = false;

try {
  const { createClient } = require('@supabase/supabase-js');
  require('dotenv').config();

  // 환경 변수 또는 config 파일에서 가져오기
  let supabaseUrl, supabaseAnonKey;

  // 1순위: 환경 변수 (.env 파일)
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    supabaseUrl = process.env.SUPABASE_URL;
    supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  } 
  // 2순위: config 파일 (로컬 개발용)
  else {
    try {
      const config = require('../config.js');
      if (config && config.supabase) {
        supabaseUrl = config.supabase.url;
        supabaseAnonKey = config.supabase.anonKey;
      }
    } catch (err) {
      // config.js 파일이 없으면 무시
    }
  }

  // 설정 확인
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    supabaseAvailable = true;
    console.log('✓ Supabase 클라이언트 초기화 완료');
    console.log(`  URL: ${supabaseUrl}`);
  } else {
    console.warn('\n⚠️  Supabase 설정이 없습니다. 라이선스 검증 기능이 비활성화됩니다.');
    console.warn('⚠️  라이선스 키 검증을 사용하려면:');
    console.warn('⚠️  1. backend/.env 파일 생성 또는');
    console.warn('⚠️  2. backend/config.js 파일 생성');
    console.warn('⚠️  3. npm install @supabase/supabase-js dotenv\n');
  }
} catch (err) {
  // @supabase/supabase-js 패키지가 설치되지 않은 경우
  console.warn('\n⚠️  @supabase/supabase-js 패키지가 설치되지 않았습니다.');
  console.warn('⚠️  라이선스 검증 기능을 사용하려면:');
  console.warn('⚠️  cd backend && npm install @supabase/supabase-js dotenv\n');
}

module.exports = { supabase, supabaseAvailable };

