import crypto from "node:crypto";

import { getAuthSecret } from "./config.js";

const encoder = new TextEncoder();

function base64UrlEncode(input) {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);

  return buffer.toString("base64url");
}

function base64UrlDecode(input) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function hmac(value) {
  return crypto.createHmac("sha256", getAuthSecret()).update(value).digest("base64url");
}

function timingSafeEqualString(a, b) {
  const left = encoder.encode(a);
  const right = encoder.encode(b);

  if (left.byteLength !== right.byteLength) {
    return false;
  }

  return crypto.timingSafeEqual(left, right);
}

export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function signPayload(payload) {
  const encoded = base64UrlEncode(JSON.stringify(payload));
  const signature = hmac(encoded);

  return `${encoded}.${signature}`;
}

export function verifySignedPayload(token, expectedType) {
  if (!token || typeof token !== "string") {
    return null;
  }

  const [encoded, signature] = token.split(".");

  if (!encoded || !signature || !timingSafeEqualString(hmac(encoded), signature)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encoded));

    if (expectedType && payload.type !== expectedType) {
      return null;
    }

    if (!payload.exp || Number(payload.exp) < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
