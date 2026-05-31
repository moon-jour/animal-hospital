import Link from "next/link";

import { listPublishedReviews } from "../../lib/server/reviews.js";
import ReviewsBoard from "./ReviewsBoard.jsx";

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
        <ReviewsBoard reviews={reviews} />
      </section>
    </main>
  );
}
