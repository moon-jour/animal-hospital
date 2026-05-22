# 24시수영동물의료센터 홈페이지

최근 개업한 동물병원을 위한 간단한 랜딩형 홈페이지입니다. Vite 기반 정적 사이트라 Vercel에 바로 배포할 수 있습니다.

## 실행

```bash
npm install
npm run dev
```

## 테스트

```bash
npm test
```

## 배포

Vercel에서 이 폴더를 프로젝트로 연결하면 `npm run build` 후 `dist`가 배포됩니다.

GitHub Pages로 테스트 링크를 만들려면 이 폴더를 GitHub 저장소로 push한 뒤, 저장소의
`Settings > Pages > Build and deployment`에서 `GitHub Actions`를 선택하세요.
이후 `main` 브랜치에 push할 때마다 `.github/workflows/deploy-pages.yml`이 `dist`를 배포합니다.

## 수정할 곳

- 병원명, 전화번호, 주소: `src/main.js`의 `hospital` 객체
- 메인 사진: `public/images/main-reception.jpg`
- 운영시간 및 의료진 소개 문구: `src/main.js`
