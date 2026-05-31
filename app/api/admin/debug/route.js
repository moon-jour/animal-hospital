import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";

import { requireAdminApi, verifyCsrfToken } from "../../../../lib/server/auth.js";
import { CSRF_COOKIE, isAdminAuthDisabled, isProduction } from "../../../../lib/server/config.js";
import { listAdminReviews } from "../../../../lib/server/reviews.js";

export const dynamic = "force-dynamic";

function tokenSummary(token, email) {
  return {
    present: Boolean(token),
    length: token?.length || 0,
    prefix: token ? token.slice(0, 10) : "",
    valid: token ? verifyCsrfToken(token, email) : false,
  };
}

function safeError(error) {
  return error?.message ? error.message.slice(0, 180) : "Unknown error.";
}

function cookieNames(cookieHeader) {
  return cookieHeader
    .split(";")
    .map((entry) => entry.trim().split("=")[0])
    .filter(Boolean);
}

function csrfCookieOccurrences(cookieHeader) {
  return cookieNames(cookieHeader).filter((name) => name === CSRF_COOKIE).length;
}

export async function GET() {
  const admin = await requireAdminApi();

  if (admin.response) {
    return admin.response;
  }

  const headersList = await headers();
  const cookieStore = await cookies();
  const csrfCookie = cookieStore.get(CSRF_COOKIE)?.value || "";
  const csrfHeader = headersList.get("x-csrf-token") || "";
  const rawCookieHeader = headersList.get("cookie") || "";
  let reviewCount = 0;
  let databaseReachable = true;
  let databaseError = "";

  try {
    reviewCount = (await listAdminReviews()).length;
  } catch (error) {
    databaseReachable = false;
    databaseError = safeError(error);
  }

  return NextResponse.json({
    now: new Date().toISOString(),
    admin: {
      email: admin.session.email,
      bypass: Boolean(admin.session.isBypass),
    },
    environment: {
      authDisabled: isAdminAuthDisabled(),
      blobConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      databaseConfigured: Boolean(process.env.DATABASE_URL),
      nodeEnv: process.env.NODE_ENV || "",
      production: isProduction,
    },
    csrf: {
      cookie: tokenSummary(csrfCookie, admin.session.email),
      header: tokenSummary(csrfHeader, admin.session.email),
      headerMatchesCookie: Boolean(csrfHeader && csrfCookie && csrfHeader === csrfCookie),
      cookieName: CSRF_COOKIE,
      cookieHeaderPresent: Boolean(rawCookieHeader),
      cookieNames: Array.from(new Set(cookieNames(rawCookieHeader))),
      csrfCookieOccurrences: csrfCookieOccurrences(rawCookieHeader),
    },
    storage: {
      databaseReachable,
      databaseError,
      reviewCount,
    },
  });
}
