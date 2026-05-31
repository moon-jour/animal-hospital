import { NextResponse } from "next/server";

import { getPublishedReview } from "../../../../lib/server/reviews.js";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { slug } = await params;
  const review = await getPublishedReview(slug);

  if (!review) {
    return NextResponse.json({ error: "Review not found." }, { status: 404 });
  }

  return NextResponse.json({ review });
}
