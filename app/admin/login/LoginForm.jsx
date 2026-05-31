"use client";

import { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [magicLink, setMagicLink] = useState("");
  const [isPending, setIsPending] = useState(false);

  const requestLogin = async (event) => {
    event.preventDefault();
    setIsPending(true);
    setMessage("");
    setMagicLink("");

    const response = await fetch("/api/admin/auth/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const result = await response.json().catch(() => ({}));

    setIsPending(false);
    setMessage("등록된 관리자 이메일이라면 로그인 링크가 발송됩니다.");

    if (result.devMagicLink) {
      setMagicLink(result.devMagicLink);
    }
  };

  return (
    <form className="admin-login" onSubmit={requestLogin}>
      <h1>관리자 로그인</h1>
      <p>관리자 이메일로만 수술 후기 작성 화면에 접근할 수 있습니다.</p>
      <label>
        관리자 이메일
        <input
          autoComplete="email"
          inputMode="email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </label>
      <div className="admin-actions" style={{ marginTop: 18 }}>
        <button className="admin-button" disabled={isPending} type="submit">
          로그인 링크 받기
        </button>
        <a className="admin-button is-secondary" href="/">
          홈페이지로
        </a>
      </div>
      {message ? <p className="admin-message">{message}</p> : null}
      {magicLink ? (
        <p className="admin-message">
          로컬 테스트 링크: <a href={magicLink}>관리자로 로그인</a>
        </p>
      ) : null}
    </form>
  );
}
