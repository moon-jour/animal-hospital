import Link from "next/link";

import { listPublishedReviews } from "../../lib/server/reviews.js";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const reviews = await listPublishedReviews();

  return (
    <main className="reviews-page">
      <header className="reviews-header">
        <Link className="reviews-brand" href="/">
          <img alt="" src="/images/hospital-symbol.jpeg" />
          <span>24시수영동물의료센터</span>
        </Link>
        <Link href="/">홈으로</Link>
      </header>
      <section className="reviews-main">
        <h1>수술 후기</h1>
        <p>관리자가 직접 정리한 수술 사례와 회복 과정을 공개된 후기만 모아 보여드립니다.</p>

        {reviews.length > 0 ? (
          <div className="reviews-grid">
            {reviews.map((review) => (
              <Link className="review-card" href={`/reviews/${review.slug}`} key={review.id}>
                {review.coverImageUrl ? (
                  <img alt={review.coverImageAlt || review.title} src={review.coverImageUrl} />
                ) : null}
                <div className="review-card__body">
                  <span>{review.category}</span>
                  <h2>{review.title}</h2>
                  <p>{review.excerpt || review.body.slice(0, 90)}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="review-empty">아직 공개된 수술 후기가 없습니다.</div>
        )}
      </section>
    </main>
  );
}
