# 24시수영동물의료센터 홈페이지

Next.js 기반 병원 홈페이지입니다. 메인 홈페이지는 공개 페이지로 제공하고, 수술 후기는 관리자만 작성/수정/삭제할 수 있도록 서버 인증과 권한 검사를 적용했습니다.

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

관리자 경로는 내비게이션에 노출하지 않지만, URL을 알아도 서버 세션과 관리자 이메일 allowlist를 통과해야 접근할 수 있습니다.

## 환경변수

Vercel Project Settings에서 Production/Preview/Development 범위를 분리해 설정하세요. 서버 비밀값은 `NEXT_PUBLIC_*` 이름으로 만들지 않습니다.

```bash
ADMIN_EMAILS=admin@example.com
AUTH_SECRET=replace-with-at-least-32-random-characters
NEXT_PUBLIC_SITE_URL=https://example.com
DATABASE_URL=postgres://user:password@host/database?sslmode=require
BLOB_READ_WRITE_TOKEN=vercel-blob-server-token
RESEND_API_KEY=resend-api-key-for-admin-login-email
ADMIN_EMAIL_FROM="24시수영동물의료센터 <admin@example.com>"
```

`DATABASE_URL`이 없으면 로컬 개발용으로 `.data/reviews.json`을 사용합니다. 운영 환경에서는 Neon Postgres 연결을 설정하세요.

## 보안 검증

```bash
npm run audit:prod
npm run build
npm run scan:secrets
npm test
```

검증에는 관리자 401/403, CSRF, XSS 입력 차단, 공개/비공개 후기 노출 분리, 이미지 MIME/시그니처 검증, 스크롤/캐러셀 회귀 테스트가 포함됩니다.
