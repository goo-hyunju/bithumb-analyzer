# Supabase 패키지 설치 가이드

## 문제 해결

`Cannot find module '@supabase/supabase-js'` 에러가 발생하면:

### 해결 방법

1. **backend 디렉토리로 이동**:
   ```bash
   cd C:\hyunju\bithumb-analyzer\backend
   ```

2. **패키지 재설치**:
   ```bash
   npm install
   ```
   
   또는 특정 패키지만 설치:
   ```bash
   npm install @supabase/supabase-js dotenv
   ```

3. **설치 확인**:
   ```bash
   npm list @supabase/supabase-js
   ```

4. **서버 재시작**:
   ```bash
   npm start
   ```

### 확인 사항

- `backend/package.json`에 패키지가 포함되어 있는지 확인
- `backend/node_modules` 폴더가 존재하는지 확인
- 현재 디렉토리가 `backend`인지 확인

