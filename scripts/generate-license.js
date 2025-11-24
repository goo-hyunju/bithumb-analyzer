/**
 * 라이선스 키 생성 스크립트
 * 크몽 판매용 라이선스 키를 생성합니다.
 * 
 * 사용법:
 *   node scripts/generate-license.js [개수]
 * 
 * 예시:
 *   node scripts/generate-license.js 10  // 10개 생성
 *   node scripts/generate-license.js     // 1개 생성
 */

function generateLicenseKey() {
  const prefix = "CAPAS-";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  
  function randomSegment() {
    let segment = "";
    for (let i = 0; i < 4; i++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return segment;
  }
  
  return prefix + randomSegment() + "-" + randomSegment() + "-" + randomSegment() + "-" + randomSegment();
}

// 커맨드 라인 인자에서 개수 가져오기
const count = process.argv[2] ? parseInt(process.argv[2]) : 1;

if (isNaN(count) || count < 1) {
  console.error('❌ 올바른 숫자를 입력해주세요.');
  process.exit(1);
}

console.log('\n' + '='.repeat(60));
console.log(`🔑 라이선스 키 ${count}개 생성`);
console.log('='.repeat(60) + '\n');

const keys = [];
for (let i = 0; i < count; i++) {
  const key = generateLicenseKey();
  keys.push(key);
  console.log(`${i + 1}. ${key}`);
}

console.log('\n' + '='.repeat(60));
console.log('📋 백엔드에 등록할 형식:');
console.log('='.repeat(60) + '\n');

console.log('const VALID_LICENSE_KEYS = new Set([');
keys.forEach(key => {
  console.log(`  '${key}',`);
});
console.log(']);\n');

console.log('✅ 완료!\n');

