import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { requireAdminApi } from "../../../../../lib/server/auth.js";
import { clientIpFromHeaders, rateLimit } from "../../../../../lib/server/rate-limit.js";
import { deleteReview, reviewValidationError, updateReview } from "../../../../../lib/server/reviews.js";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  const admin = await requireAdminApi({ requireCsrf: true });

  if (admin.response) {
    return admin.response;
  }

  const headersList = await headers();
  const limiter = rateLimit({
    key: `admin-review-update:${admin.session.email}:${clientIpFromHeaders(headersList)}`,
    limit: 30,
    windowMs: 60 * 1000,
  });

  if (!limiter.ok) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  try {
    const { id } = await params;
    const review = await updateReview(id, await request.json(), admin.session.email);

    if (!review) {
      return NextResponse.json({ error: "Review not found." }, { status: 404 });
    }

    return NextResponse.json({ review });
  } catch (error) {
    return NextResponse.json({ error: reviewValidationError(error) }, { status: 400 });
  }
}

export async function DELETE(_request, { params }) {
  const admin = await requireAdminApi({ requireCsrf: true });

  if (admin.response) {
    return admin.response;
  }

  const { id } = await params;
  const deleted = await deleteReview(id);

  if (!deleted) {
    return NextResponse.json({ error: "Review not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
