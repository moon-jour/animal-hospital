import { NextResponse } from "next/server";

import { createSessionResponse } from "../../../../../lib/server/auth.js";
import { isAdminEmail } from "../../../../../lib/server/config.js";
import { verifySignedPayload } from "../../../../../lib/server/signing.js";

export async function GET(request) {
  const url = new URL(request.url);
  const payload = verifySignedPayload(url.searchParams.get("token"), "admin-login");

  if (!payload?.email || !isAdminEmail(payload.email)) {
    return NextResponse.redirect(new URL("/admin/login?error=invalid", request.url));
  }

  return createSessionResponse(payload.email, request);
}
