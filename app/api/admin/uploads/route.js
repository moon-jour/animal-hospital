import { put } from "@vercel/blob";
import crypto from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { requireAdminApi } from "../../../../lib/server/auth.js";
import { clientIpFromHeaders, rateLimit } from "../../../../lib/server/rate-limit.js";

const allowedMimeTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);
const maxImageSize = 3 * 1024 * 1024;

export const dynamic = "force-dynamic";

function hasValidImageSignature(bytes, mimeType) {
  if (mimeType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (mimeType === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }

  if (mimeType === "image/webp") {
    const riff = String.fromCharCode(...bytes.slice(0, 4));
    const webp = String.fromCharCode(...bytes.slice(8, 12));

    return riff === "RIFF" && webp === "WEBP";
  }

  return false;
}

export async function POST(request) {
  const admin = await requireAdminApi({ requireCsrf: true });

  if (admin.response) {
    return admin.response;
  }

  const headersList = await headers();
  const limiter = rateLimit({
    key: `admin-upload:${admin.session.email}:${clientIpFromHeaders(headersList)}`,
    limit: 12,
    windowMs: 60 * 1000,
  });

  if (!limiter.ok) {
    return NextResponse.json({ error: "Too many uploads." }, { status: 429 });
  }

  const formData = await request.formData();
  const files = formData.getAll("file");
  const file = files[0];

  if (files.length !== 1 || !file || typeof file === "string") {
    return NextResponse.json({ error: "Upload exactly one image file." }, { status: 400 });
  }

  const extension = allowedMimeTypes.get(file.type);

  if (!extension) {
    return NextResponse.json({ error: "Only jpg, png, and webp images are allowed." }, { status: 400 });
  }

  if (file.size > maxImageSize) {
    return NextResponse.json({ error: "Image must be 3MB or smaller." }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  if (!hasValidImageSignature(bytes, file.type)) {
    return NextResponse.json({ error: "Image contents do not match the declared file type." }, { status: 400 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Blob storage is not configured." }, { status: 503 });
  }

  const filename = `surgery-reviews/${crypto.randomUUID()}.${extension}`;
  const blob = await put(filename, file, {
    access: "public",
    contentType: file.type,
  });

  return NextResponse.json({ url: blob.url });
}
