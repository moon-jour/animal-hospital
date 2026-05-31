"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

function uniqueValues(reviews, key) {
  return Array.from(new Set(reviews.map((review) => review[key]?.trim()).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, "ko"),
  );
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  return value.replaceAll("-", ".");
}

function dateRangeText(review) {
  if (review.admissionDate && review.dischargeDate) {
    return `${formatDate(review.admissionDate)} - ${formatDate(review.dischargeDate)}`;
  }

  if (review.admissionDate) {
    return `입원 ${formatDate(review.admissionDate)}`;
  }

  if (review.dischargeDate) {
    return `퇴원 ${formatDate(review.dischargeDate)}`;
  }

  return "";
}

function reviewThumbnail(review) {
  return review.coverImageUrl || (Array.isArray(review.imageUrls) && review.imageUrls.length > 0 ? review.imageUrls[0] : "");
}

export default function ReviewsBoard({ reviews }) {
  const [titleQuery, setTitleQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBreed, setSelectedBreed] = useState("");

  const categories = useMemo(() => uniqueValues(reviews, "category"), [reviews]);
  const breeds = useMemo(() => uniqueValues(reviews, "breed"), [reviews]);
  const filteredReviews = useMemo(() => {
    const query = titleQuery.trim().toLowerCase();

    return reviews.filter((review) => {
      const matchesTitle = !query || review.title.toLowerCase().includes(query);
      const matchesCategory = !selectedCategory || review.category === selectedCategory;
      const matchesBreed = !selectedBreed || review.breed === selectedBreed;

      return matchesTitle && matchesCategory && matchesBreed;
    });
  }, [reviews, selectedBreed, selectedCategory, titleQuery]);

  const resetFilters = () => {
    setTitleQuery("");
    setSelectedCategory("");
    setSelectedBreed("");
  };

  return (
    <div className="reviews-board">
      <div className="reviews-toolbar" aria-label="수술 후기 검색 및 필터">
        <label>
          제목 검색
          <input
            maxLength={80}
            onChange={(event) => setTitleQuery(event.target.value)}
            placeholder="후기 제목을 검색하세요"
            type="search"
            value={titleQuery}
          />
        </label>
        <label>
          수술 종류
          <select onChange={(event) => setSelectedCategory(event.target.value)} value={selectedCategory}>
            <option value="">전체 수술 종류</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label>
          견종
          <select onChange={(event) => setSelectedBreed(event.target.value)} value={selectedBreed}>
            <option value="">전체 견종</option>
            {breeds.map((breed) => (
              <option key={breed} value={breed}>
                {breed}
              </option>
            ))}
          </select>
        </label>
        <button className="reviews-reset" onClick={resetFilters} type="button">
          초기화
        </button>
      </div>

      <div className="reviews-board__summary" aria-live="polite">
        총 {filteredReviews.length}개의 수술 후기
      </div>

      {filteredReviews.length > 0 ? (
        <div className="reviews-grid">
          {filteredReviews.map((review) => (
            <Link className="review-card" href={`/reviews/${review.slug}`} key={review.id}>
              <div className="review-card__thumb">
                {reviewThumbnail(review) ? (
                  <img alt={`${review.title} 썸네일`} src={reviewThumbnail(review)} />
                ) : (
                  <span>24S</span>
                )}
              </div>
              <div className="review-card__body">
                <div className="review-card__meta">
                  <span>{review.category}</span>
                  {review.breed ? <span>{review.breed}</span> : null}
                  {dateRangeText(review) ? <span>{dateRangeText(review)}</span> : null}
                </div>
                <h2>{review.title}</h2>
                <p>{review.body.slice(0, 90)}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="review-empty">조건에 맞는 수술 후기가 없습니다.</div>
      )}
    </div>
  );
}
