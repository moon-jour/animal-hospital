"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginForm({ error }) {
  const [isPending, setIsPending] = useState(false);

  const startGoogleLogin = async () => {
    setIsPending(true);
    await signIn("google", { callbackUrl: "/admin/reviews" });
  };

  return (
    <div className="admin-login">
      <h1>관리자 로그인</h1>
      <p>등록된 관리자 Google 계정으로만 수술 후기 작성 화면에 접근할 수 있습니다.</p>
      {error ? (
        <p className="admin-message is-error">
          등록된 관리자 메일이 아니거나 Google 계정의 이메일 인증을 확인할 수 없습니다.
        </p>
      ) : null}
      <div className="admin-actions" style={{ marginTop: 18 }}>
        <button className="admin-button" disabled={isPending} onClick={startGoogleLogin} type="button">
          Google로 로그인
        </button>
        <a className="admin-button is-secondary" href="/">
          홈페이지로
        </a>
      </div>
    </div>
  );
}
