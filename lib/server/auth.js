import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_SECONDS,
  CSRF_COOKIE,
  SESSION_COOKIE,
  cookieOptions,
  getBaseUrl,
  isAdminEmail,
} from "./config.js";
import { randomToken, sha256, signPayload, verifySignedPayload } from "./signing.js";

export function createLoginToken(email) {
  return signPayload({
    type: "admin-login",
    email: email.trim().toLowerCase(),
    nonce: randomToken(18),
    exp: Date.now() + 10 * 60 * 1000,
  });
}

export function buildMagicLink(request, token) {
  return `${getBaseUrl(request)}/api/admin/auth/callback?token=${encodeURIComponent(token)}`;
}

export async function createSessionResponse(email, request) {
  const csrfToken = randomToken(32);
  const sessionToken = signPayload({
    type: "admin-session",
    email: email.trim().toLowerCase(),
    csrfHash: sha256(csrfToken),
    exp: Date.now() + ADMIN_SESSION_SECONDS * 1000,
  });
  const response = NextResponse.redirect(new URL("/admin/reviews", request.url));

  response.cookies.set(SESSION_COOKIE, sessionToken, cookieOptions({ httpOnly: true }));
  response.cookies.set(CSRF_COOKIE, csrfToken, cookieOptions({ httpOnly: false }));

  return response;
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const payload = verifySignedPayload(cookieStore.get(SESSION_COOKIE)?.value, "admin-session");

  if (!payload?.email || !isAdminEmail(payload.email)) {
    return null;
  }

  return {
    email: payload.email,
    csrfHash: payload.csrfHash,
  };
}

export async function requireAdminPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}

export function unauthorized() {
  return NextResponse.json({ error: "Authentication required." }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: "Administrator permission required." }, { status: 403 });
}

export async function requireAdminApi({ requireCsrf = false } = {}) {
  const session = await getAdminSession();

  if (!session) {
    return { response: unauthorized() };
  }

  if (requireCsrf) {
    const cookieStore = await cookies();
    const headersList = await headers();
    const csrfCookie = cookieStore.get(CSRF_COOKIE)?.value;
    const csrfHeader = headersList.get("x-csrf-token");

    if (!csrfCookie || !csrfHeader || csrfHeader !== csrfCookie || sha256(csrfHeader) !== session.csrfHash) {
      return {
        response: NextResponse.json({ error: "Invalid CSRF token." }, { status: 403 }),
      };
    }
  }

  return { session };
}

export function clearSessionResponse() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set(SESSION_COOKIE, "", cookieOptions({ maxAge: 0 }));
  response.cookies.set(CSRF_COOKIE, "", cookieOptions({ httpOnly: false, maxAge: 0 }));

  return response;
}
