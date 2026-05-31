"use client";

import { useMemo, useState } from "react";

const emptyForm = {
  id: "",
  title: "",
  category: "수술 후기",
  excerpt: "",
  body: "",
  coverImageUrl: "",
  coverImageAlt: "",
  published: false,
};

function getCsrfToken() {
  return document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith("sams_admin_csrf="))
    ?.split("=")[1];
}

export default function ReviewAdmin({ initialReviews, adminEmail }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  const sortedReviews = useMemo(
    () =>
      [...reviews].sort(
        (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime(),
      ),
    [reviews],
  );

  const updateField = (field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const uploadImage = async () => {
    if (!file) {
      return form.coverImageUrl;
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/admin/uploads", {
      method: "POST",
      headers: { "x-csrf-token": getCsrfToken() || "" },
      body: formData,
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.error || "이미지 업로드에 실패했습니다.");
    }

    return result.url;
  };

  const saveReview = async (event) => {
    event.preventDefault();
    setIsPending(true);
    setMessage("");

    try {
      const coverImageUrl = await uploadImage();
      const payload = {
        title: form.title,
        category: form.category,
        excerpt: form.excerpt,
        body: form.body,
        coverImageUrl,
        coverImageAlt: form.coverImageAlt,
        published: form.published,
      };
      const isEditing = Boolean(form.id);
      const response = await fetch(isEditing ? `/api/admin/reviews/${form.id}` : "/api/admin/reviews", {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCsrfToken() || "",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "저장에 실패했습니다.");
      }

      setReviews((current) =>
        isEditing
          ? current.map((review) => (review.id === result.review.id ? result.review : review))
          : [result.review, ...current],
      );
      setForm(emptyForm);
      setFile(null);
      setMessage(isEditing ? "수술 후기를 수정했습니다." : "수술 후기를 저장했습니다.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsPending(false);
    }
  };

  const editReview = (review) => {
    setForm({
      id: review.id,
      title: review.title,
      category: review.category,
      excerpt: review.excerpt,
      body: review.body,
      coverImageUrl: review.coverImageUrl,
      coverImageAlt: review.coverImageAlt,
      published: review.published,
    });
    setFile(null);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteReviewById = async (id) => {
    setIsPending(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
        headers: { "x-csrf-token": getCsrfToken() || "" },
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "삭제에 실패했습니다.");
      }

      setReviews((current) => current.filter((review) => review.id !== id));
      setMessage("수술 후기를 삭제했습니다.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsPending(false);
    }
  };

  const logout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    window.location.assign("/admin/login");
  };

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <div className="admin-topbar">
          <div>
            <h1>수술 후기 관리</h1>
            <p>{adminEmail}</p>
          </div>
          <div className="admin-actions">
            <a className="admin-button is-secondary" href="/reviews">
              공개 화면
            </a>
            <button className="admin-button is-secondary" onClick={logout} type="button">
              로그아웃
            </button>
          </div>
        </div>

        <form className="admin-review-form" onSubmit={saveReview}>
          <label>
            제목
            <input maxLength={120} onChange={updateField("title")} required value={form.title} />
          </label>
          <label>
            분류
            <input maxLength={40} onChange={updateField("category")} required value={form.category} />
          </label>
          <label className="is-wide">
            목록 요약
            <input maxLength={240} onChange={updateField("excerpt")} value={form.excerpt} />
          </label>
          <label className="is-wide">
            본문
            <textarea maxLength={5000} onChange={updateField("body")} required value={form.body} />
          </label>
          <label>
            대표 이미지 URL
            <input onChange={updateField("coverImageUrl")} value={form.coverImageUrl} />
          </label>
          <label>
            대표 이미지 설명
            <input maxLength={120} onChange={updateField("coverImageAlt")} value={form.coverImageAlt} />
          </label>
          <label>
            이미지 업로드
            <input accept="image/jpeg,image/png,image/webp" onChange={(event) => setFile(event.target.files?.[0] || null)} type="file" />
          </label>
          <label>
            공개 상태
            <select onChange={(event) => setForm((current) => ({ ...current, published: event.target.value === "true" }))} value={String(form.published)}>
              <option value="false">임시저장</option>
              <option value="true">공개</option>
            </select>
          </label>
          <div className="admin-actions">
            <button className="admin-button" disabled={isPending} type="submit">
              {form.id ? "수정 저장" : "새 후기 저장"}
            </button>
            <button className="admin-button is-secondary" onClick={() => setForm(emptyForm)} type="button">
              새 글 작성
            </button>
          </div>
        </form>

        {message ? <p className="admin-message">{message}</p> : null}

        <section className="admin-list" aria-label="저장된 수술 후기">
          {sortedReviews.map((review) => (
            <article key={review.id}>
              <div>
                <h2>{review.title}</h2>
                <p>
                  {review.category} · {review.published ? "공개" : "임시저장"}
                </p>
              </div>
              <div className="admin-actions">
                <button className="admin-button is-secondary" onClick={() => editReview(review)} type="button">
                  수정
                </button>
                <button className="admin-button is-secondary" disabled={isPending} onClick={() => deleteReviewById(review.id)} type="button">
                  삭제
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
