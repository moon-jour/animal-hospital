import { NextResponse } from "next/server";

import { listPublishedReviews } from "../../../lib/server/reviews.js";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ reviews: await listPublishedReviews() });
}
