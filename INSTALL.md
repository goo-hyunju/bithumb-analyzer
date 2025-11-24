# CAPAS 프로젝트 설치 및 실행 가이드

## 📂 프로젝트 폴더 구조

```
bithumb-analyzer/
├── backend/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

---

## 🚀 빠른 시작 (Windows PowerShell)

### 1단계: 백엔드 설치 및 실행

```powershell
# 백엔드 폴더로 이동
cd C:\hyunju\bithumb-analyzer\backend

# 의존성 설치 (처음 한 번만)
npm install

# 서버 실행
npm start
```

**성공 메시지:**

```
🚀 CAPAS 백엔드 서버 실행 중
📍 서버 주소: http://localhost:5000
```

---

### 2단계: 프론트엔드 설치 및 실행

**새 PowerShell 창 열기** (Ctrl + Shift + T)

```powershell
# 프론트엔드 폴더로 이동
cd C:\hyunju\bithumb-analyzer\frontend

# 의존성 설치 (처음 한 번만)
npm install

# 개발 서버 실행
npm run dev
```

**성공 메시지:**

```
  VITE v5.0.8  ready in 500 ms
  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

### 3단계: 브라우저에서 열기

브라우저에서 http://localhost:5173 접속

---

## 📋 필수 파일 체크리스트

### 백엔드 파일들
- [ ] `backend/package.json`
- [ ] `backend/server.js`

### 프론트엔드 파일들
- [ ] `frontend/package.json`
- [ ] `frontend/vite.config.js`
- [ ] `frontend/tailwind.config.js`
- [ ] `frontend/postcss.config.js`
- [ ] `frontend/index.html`
- [ ] `frontend/src/main.jsx`
- [ ] `frontend/src/App.jsx`
- [ ] `frontend/src/index.css`

---

## 🔧 문제 해결

### 문제 1: "npm을 찾을 수 없습니다"

**해결:**
Node.js를 설치하세요
https://nodejs.org/ (LTS 버전 다운로드)

### 문제 2: 백엔드 포트 5000이 이미 사용 중

**해결:**

```powershell
# 포트 사용 프로세스 확인
netstat -ano | findstr :5000

# 프로세스 종료
taskkill /PID [프로세스ID] /F
```

### 문제 3: 프론트엔드에서 "서버 미연결" 표시

**해결:**
1. 백엔드 서버가 실행 중인지 확인
2. http://localhost:5000/health 접속 테스트
3. 방화벽 설정 확인

### 문제 4: CORS 에러

**해결:**
`vite.config.js` 프록시 설정 확인

```javascript
server: {
  proxy: {
    '/api': 'http://localhost:5000'
  }
}
```

---

## 💻 개발 명령어

### 백엔드

```bash
npm start          # 서버 시작
npm install        # 의존성 설치
```

### 프론트엔드

```bash
npm run dev        # 개발 서버 시작
npm run build      # 프로덕션 빌드
npm run preview    # 빌드 결과 미리보기
npm install        # 의존성 설치
```

---

## 🎯 다음 단계

1. ✅ 백엔드 서버 실행 확인
2. ✅ 프론트엔드 앱 실행 확인
3. ✅ KRW-BTC 코인 분석 테스트
4. 📊 여러 코인 백테스팅
5. 📈 성공률 높은 코인 발견
6. 🚀 실전 전략 수립

---

## 📞 참고

- Bithumb API: https://apidocs.bithumb.com/
- React: https://react.dev/
- Vite: https://vitejs.dev/
- TailwindCSS: https://tailwindcss.com/

---

