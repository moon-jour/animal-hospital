import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

import { auth as getAuthSession } from "../../auth.js";
import {
  ADMIN_SESSION_SECONDS,
  CSRF_COOKIE,
  cookieOptions,
  getBypassAdminEmail,
  isAdminAuthDisabled,
  isAdminEmail,
} from "./config.js";
import { randomToken, sha256, signPayload, verifySignedPayload } from "./signing.js";

function createCsrfToken(email) {
  const nonce = randomToken(32);
  const proof = signPayload({
    type: "admin-csrf",
    email: email.trim().toLowerCase(),
    nonceHash: sha256(nonce),
    exp: Date.now() + ADMIN_SESSION_SECONDS * 1000,
  });

  return `${nonce}.${proof}`;
}

export function verifyCsrfToken(token, email) {
  const [nonce, ...proofParts] = token?.split(".") ?? [];
  const proof = proofParts.join(".");
  const payload = verifySignedPayload(proof, "admin-csrf");

  return (
    Boolean(nonce) &&
    payload?.email === email.trim().toLowerCase() &&
    payload.nonceHash === sha256(nonce)
  );
}

export async function getAdminSession() {
  if (isAdminAuthDisabled()) {
    return { email: getBypassAdminEmail(), isBypass: true };
  }

  const session = await getAuthSession();
  const email = session?.user?.email?.trim().toLowerCase();

  if (!email || !isAdminEmail(email)) {
    return null;
  }

  return { email };
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

export async function createCsrfResponse() {
  const session = await getAdminSession();

  if (!session) {
    return unauthorized();
  }

  const csrfToken = createCsrfToken(session.email);
  const response = NextResponse.json({ csrfToken });

  response.cookies.set(CSRF_COOKIE, csrfToken, cookieOptions({ httpOnly: false }));

  return response;
}

export async function requireAdminApi({ requireCsrf = false } = {}) {
  const session = await getAdminSession();

  if (!session) {
    return { response: unauthorized() };
  }

  if (requireCsrf) {
    const headersList = await headers();
    const csrfHeader = headersList.get("x-csrf-token");

    if (!csrfHeader || !verifyCsrfToken(csrfHeader, session.email)) {
      return {
        response: NextResponse.json({ error: "Invalid CSRF token." }, { status: 403 }),
      };
    }
  }

  return { session };
}

export function clearSessionResponse() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set(CSRF_COOKIE, "", cookieOptions({ httpOnly: false, maxAge: 0 }));
  response.cookies.set("authjs.session-token", "", cookieOptions({ maxAge: 0 }));
  response.cookies.set("__Secure-authjs.session-token", "", {
    ...cookieOptions({ maxAge: 0 }),
    secure: true,
  });

  return response;
}
