import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { buildMagicLink, createLoginToken } from "../../../../../lib/server/auth.js";
import { isAdminEmail, isProduction } from "../../../../../lib/server/config.js";
import { clientIpFromHeaders, rateLimit } from "../../../../../lib/server/rate-limit.js";

const requestSchema = z.object({
  email: z.string().trim().email().max(254),
});

async function sendMagicLink(email, magicLink) {
  if (!isProduction) {
    return;
  }

  if (!process.env.RESEND_API_KEY || !process.env.ADMIN_EMAIL_FROM) {
    throw new Error("RESEND_API_KEY and ADMIN_EMAIL_FROM are required for production admin login email.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.ADMIN_EMAIL_FROM,
      to: email,
      subject: "24시수영동물의료센터 관리자 로그인",
      text: `아래 링크로 10분 안에 로그인하세요.\n\n${magicLink}`,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send admin login email.");
  }
}

export async function POST(request) {
  const headersList = await headers();
  const ip = clientIpFromHeaders(headersList);
  const body = await request.json().catch(() => ({}));
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: true });
  }

  const email = parsed.data.email.toLowerCase();
  const limiter = rateLimit({
    key: `admin-login:${ip}:${email}`,
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });

  if (!limiter.ok) {
    return NextResponse.json({ ok: true }, { status: 202 });
  }

  if (!isAdminEmail(email)) {
    return NextResponse.json({ ok: true });
  }

  const token = createLoginToken(email);
  const magicLink = buildMagicLink(request, token);

  await sendMagicLink(email, magicLink);

  return NextResponse.json({
    ok: true,
    devMagicLink: !isProduction || process.env.ADMIN_DEV_MAGIC_LINKS === "1" ? magicLink : undefined,
  });
}
