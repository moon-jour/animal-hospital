import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublishedReview } from "../../../lib/server/reviews.js";

export const dynamic = "force-dynamic";

export default async function ReviewDetailPage({ params }) {
  const { slug } = await params;
  const review = await getPublishedReview(slug);

  if (!review) {
    notFound();
  }

  return (
    <main className="reviews-page">
      <header className="reviews-header">
        <Link className="reviews-brand" href="/">
          <img alt="" src="/images/hospital-symbol.jpeg" />
          <span>24시수영동물의료센터</span>
        </Link>
        <Link href="/reviews">수술 후기 목록</Link>
      </header>
      <article className="reviews-main review-detail">
        <span className="review-detail__meta">{review.category}</span>
        <h1>{review.title}</h1>
        {review.coverImageUrl ? (
          <img className="review-detail__hero" alt={review.coverImageAlt || review.title} src={review.coverImageUrl} />
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
