import { encode } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  ADMIN_SESSION_SECONDS,
  getAuthSecret,
  isAdminEmail,
  isProduction,
} from "../../../../../lib/server/config.js";

const requestSchema = z.object({
  email: z.string().trim().email().max(254),
});

export async function POST(request) {
  if (isProduction || process.env.ADMIN_DEV_AUTH_BYPASS !== "1") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => ({})));

  if (!parsed.success || !isAdminEmail(parsed.data.email)) {
    return NextResponse.json({ error: "Administrator permission required." }, { status: 403 });
  }

  const email = parsed.data.email.toLowerCase();
  const cookieName = "authjs.session-token";
  const token = await encode({
    maxAge: ADMIN_SESSION_SECONDS,
    salt: cookieName,
    secret: getAuthSecret(),
    token: {
      email,
      isAdmin: true,
      name: "Development Admin",
      sub: email,
    },
  });
  const response = NextResponse.json({ ok: true });

  response.cookies.set(cookieName, token, {
    httpOnly: true,
    maxAge: ADMIN_SESSION_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: false,
  });

  return response;
}
