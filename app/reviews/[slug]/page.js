import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublishedReview } from "../../../lib/server/reviews.js";
import ReviewsHeader from "../ReviewsHeader.jsx";

export const dynamic = "force-dynamic";

function formatDate(value) {
  if (!value) {
    return "";
  }

  return value.replaceAll("-", ".");
}

function reviewImages(review) {
  return Array.isArray(review.imageUrls) && review.imageUrls.length > 0 ? review.imageUrls : [review.coverImageUrl].filter(Boolean);
}

export default async function ReviewDetailPage({ params }) {
  const { slug } = await params;
  const review = await getPublishedReview(slug);

  if (!review) {
    notFound();
  }

  return (
    <main className="reviews-page">
      <ReviewsHeader />
      <article className="reviews-main review-detail">
        <Link className="review-detail__back" href="/reviews">수술 후기 목록</Link>
        <div className="review-detail__meta">
          <span>{review.category}</span>
          {review.breed ? <span>{review.breed}</span> : null}
          {review.admissionDate ? <span>입원 {formatDate(review.admissionDate)}</span> : null}
          {review.dischargeDate ? <span>퇴원 {formatDate(review.dischargeDate)}</span> : null}
        </div>
        <h1>{review.title}</h1>
        {reviewImages(review).length > 0 ? (
          <div className="review-detail__gallery" aria-label="수술 후기 이미지">
            {reviewImages(review).map((imageUrl, index) => (
              <img key={imageUrl} alt={`${review.title} 이미지 ${index + 1}`} src={imageUrl} />
            ))}
          </div>
        ) : null}
        <div className="review-detail__content">
          {review.body.split("\n").map((line, index) => (
            <p key={`${review.id}-${index}`}>{line}</p>
          ))}
        </div>
      </article>
    </main>
  );
}
