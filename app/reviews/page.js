import { listPublishedReviews } from "../../lib/server/reviews.js";
import ReviewsBoard from "./ReviewsBoard.jsx";
import ReviewsHeader from "./ReviewsHeader.jsx";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const reviews = await listPublishedReviews();

  return (
    <main className="reviews-page">
      <ReviewsHeader />
      <section className="reviews-main">
        <h1>수술 후기</h1>
        <ReviewsBoard reviews={reviews} />
      </section>
    </main>
  );
}
