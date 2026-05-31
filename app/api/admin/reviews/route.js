import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { requireAdminApi } from "../../../../lib/server/auth.js";
import { clientIpFromHeaders, rateLimit } from "../../../../lib/server/rate-limit.js";
import { createReview, listAdminReviews, reviewValidationError } from "../../../../lib/server/reviews.js";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdminApi();

  if (admin.response) {
    return admin.response;
  }

  return NextResponse.json({ reviews: await listAdminReviews() });
}

export async function POST(request) {
  const admin = await requireAdminApi({ requireCsrf: true });

  if (admin.response) {
    return admin.response;
  }

  const headersList = await headers();
  const limiter = rateLimit({
    key: `admin-review-create:${admin.session.email}:${clientIpFromHeaders(headersList)}`,
    limit: 20,
    windowMs: 60 * 1000,
  });

  if (!limiter.ok) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  try {
    const review = await createReview(await request.json(), admin.session.email);

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: reviewValidationError(error) }, { status: 400 });
  }
}
