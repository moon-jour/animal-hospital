# 24시수영동물의료센터 홈페이지

Next.js 기반 병원 홈페이지입니다. 메인 홈페이지는 공개 페이지로 제공하고, 수술 후기는 관리자 화면에서 작성/수정/삭제할 수 있습니다.

## 실행

```bash
npm install
npm run dev -- -p 5173
```

로컬 확인 주소는 `http://localhost:5173`입니다.

## 주요 경로

- `/`: 병원 홈페이지
- `/reviews`: 공개된 수술 후기 목록
- `/reviews/[slug]`: 공개된 수술 후기 상세
- `/admin/login`: 관리자 로그인
- `/admin/reviews`: 관리자 수술 후기 관리

현재 테스트 편의를 위해 관리자 인증은 `ADMIN_AUTH_DISABLED=1`로 꺼둔 상태입니다. Google 로그인 설정이 준비되면 `ADMIN_AUTH_DISABLED=0`으로 바꿔 등록된 관리자 Google 계정만 접근하도록 되돌릴 수 있습니다.

## 환경변수

Vercel Project Settings에서 Production/Preview/Development 범위를 분리해 설정하세요. 서버 비밀값은 `NEXT_PUBLIC_*` 이름으로 만들지 않습니다.

```bash
ADMIN_AUTH_DISABLED=1
ADMIN_EMAILS=admin@example.com
AUTH_SECRET=replace-with-at-least-32-random-characters
AUTH_GOOGLE_ID=google-oauth-client-id
AUTH_GOOGLE_SECRET=google-oauth-client-secret
NEXT_PUBLIC_SITE_URL=https://example.com
DATABASE_URL=postgres://user:password@host/database?sslmode=require
BLOB_READ_WRITE_TOKEN=vercel-blob-server-token
```

`DATABASE_URL`이 없으면 로컬 개발용으로 `.data/reviews.json`을 사용합니다. 운영 환경에서는 Neon Postgres 연결을 설정하세요.
Google OAuth 콘솔의 승인된 리디렉션 URI에는 `https://배포도메인/api/auth/callback/google`을 등록하세요. Google 로그인을 다시 켤 때는 `ADMIN_AUTH_DISABLED=0`으로 변경합니다.

## 보안 검증

```bash
npm run audit:prod
npm run build
npm run scan:secrets
npm test
```

검증에는 관리자 401/403, CSRF, XSS 입력 차단, 공개/비공개 후기 노출 분리, 이미지 MIME/시그니처 검증, 스크롤/캐러셀 회귀 테스트가 포함됩니다.
