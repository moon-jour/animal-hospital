export const CSRF_COOKIE = "sams_admin_csrf";
export const ADMIN_SESSION_SECONDS = 60 * 60 * 8;

export const isProduction = process.env.NODE_ENV === "production";

export function parseEmailList(value = "") {
  return value
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function getAdminEmails() {
  return parseEmailList(process.env.ADMIN_EMAILS);
}

export function isAdminAuthDisabled() {
  return process.env.ADMIN_AUTH_DISABLED !== "0";
}

export function getBypassAdminEmail() {
  return getAdminEmails()[0] || "test-admin@local";
}

export function isAdminEmail(email) {
  if (!email) {
    return false;
  }

  return getAdminEmails().includes(email.trim().toLowerCase());
}

export function getAuthSecret() {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

  if (secret && secret.length >= 32) {
    return secret;
  }

  if (!isProduction) {
    return "local-development-secret-change-before-production";
  }

  throw new Error("AUTH_SECRET must be set to at least 32 characters in production.");
}

export function cookieOptions({ httpOnly = true, maxAge = ADMIN_SESSION_SECONDS } = {}) {
  return {
    httpOnly,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}
