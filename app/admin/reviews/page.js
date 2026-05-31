import { listAdminReviews } from "../../../lib/server/reviews.js";
import { requireAdminPage } from "../../../lib/server/auth.js";
import ReviewAdmin from "./ReviewAdmin.jsx";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const session = await requireAdminPage();
  const reviews = await listAdminReviews();

  return <ReviewAdmin adminEmail={session.email} initialReviews={reviews} />;
}
