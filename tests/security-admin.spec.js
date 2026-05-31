import fs from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

const dataFile = path.join(process.cwd(), ".data", "reviews.json");

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  await fs.rm(dataFile, { force: true });
});

async function adminLogin(page) {
  const loginResponse = await page.request.post("/api/admin/auth/request", {
    data: { email: "admin@example.com" },
  });
  const loginPayload = await loginResponse.json();

  expect(loginResponse.ok()).toBe(true);
  expect(loginPayload.devMagicLink).toContain("/api/admin/auth/callback");

  await page.goto(loginPayload.devMagicLink);
  await expect(page).toHaveURL(/\/admin\/reviews/);

  const cookies = await page.context().cookies();
  const csrf = cookies.find((cookie) => cookie.name === "sams_admin_csrf")?.value;
  const session = cookies.find((cookie) => cookie.name === "sams_admin_session");

  expect(csrf).toBeTruthy();
  expect(session?.httpOnly).toBe(true);
  expect(session?.sameSite).toBe("Lax");

  return {
    csrf,
    cookieHeader: cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; "),
  };
}

test("admin pages and APIs require authentication", async ({ page }) => {
  await page.goto("/admin/reviews");
  await expect(page).toHaveURL(/\/admin\/login/);

  const listResponse = await page.request.get("/api/admin/reviews");
  expect(listResponse.status()).toBe(401);

  const createResponse = await page.request.post("/api/admin/reviews", {
    data: { title: "권한 없는 요청", category: "수술 후기", body: "작성 실패" },
  });
  expect(createResponse.status()).toBe(401);

  const uploadResponse = await page.request.post("/api/admin/uploads", {
    multipart: { file: { name: "bad.svg", mimeType: "image/svg+xml", buffer: Buffer.from("<svg />") } },
  });
  expect(uploadResponse.status()).toBe(401);
});

test("non-admin email cannot obtain a login link", async ({ request }) => {
  const response = await request.post("/api/admin/auth/request", {
    data: { email: "visitor@example.com" },
  });
  const payload = await response.json();

  expect(response.ok()).toBe(true);
  expect(payload.devMagicLink).toBeUndefined();
});

test("admin review mutations validate CSRF, payloads, publish state, and author identity", async ({ page }) => {
  const { cookieHeader, csrf } = await adminLogin(page);

  const invalidCsrf = await page.request.post("/api/admin/reviews", {
    data: { title: "CSRF 테스트", category: "수술 후기", body: "실패해야 합니다." },
    headers: { cookie: cookieHeader, "x-csrf-token": "wrong" },
  });
  expect(invalidCsrf.status()).toBe(403);

  const xssResponse = await page.request.post("/api/admin/reviews", {
    data: {
      title: "<script>alert(1)</script>",
      category: "수술 후기",
      body: "본문",
      published: true,
    },
    headers: { cookie: cookieHeader, "x-csrf-token": csrf },
  });
  expect(xssResponse.status()).toBe(400);

  const createResponse = await page.request.post("/api/admin/reviews", {
    data: {
      title: "슬개골 탈구 수술 회복 사례",
      category: "슬개골탈구",
      breed: "말티즈",
      excerpt: "보행 평가부터 회복 관리까지 정리한 사례입니다.",
      body: "관리자가 직접 작성한 공개 전 임시저장 후기입니다.",
      coverImageUrl: "/images/facility-01.jpg",
      coverImageAlt: "수술실",
      authorEmail: "attacker@example.com",
      isAdmin: true,
      published: false,
    },
    headers: { cookie: cookieHeader, "x-csrf-token": csrf },
  });
  expect(createResponse.status()).toBe(201);
  const created = (await createResponse.json()).review;

  expect(created.authorEmail).toBe("admin@example.com");
  expect(created.published).toBe(false);
  expect(created.breed).toBe("말티즈");

  const publicDrafts = await page.request.get("/api/reviews");
  expect((await publicDrafts.json()).reviews.map((review) => review.id)).not.toContain(created.id);

  const publishResponse = await page.request.patch(`/api/admin/reviews/${created.id}`, {
    data: {
      title: created.title,
      category: created.category,
      breed: created.breed,
      excerpt: created.excerpt,
      body: "공개된 수술 후기입니다.",
      coverImageUrl: created.coverImageUrl,
      coverImageAlt: created.coverImageAlt,
      published: true,
    },
    headers: { cookie: cookieHeader, "x-csrf-token": csrf },
  });
  expect(publishResponse.ok()).toBe(true);
  const published = (await publishResponse.json()).review;

  expect(published.published).toBe(true);

  const publicReviews = await page.request.get("/api/reviews");
  const publicPayload = await publicReviews.json();

  expect(publicPayload.reviews.map((review) => review.id)).toContain(created.id);

  await page.goto("/reviews");
  await expect(page.getByRole("heading", { name: created.title })).toBeVisible();
  await expect(page.getByAltText("수술실")).toBeVisible();
  await page.getByLabel("제목 검색").fill("슬개골");
  await page.getByLabel("수술 종류").selectOption("슬개골탈구");
  await page.getByLabel("견종").selectOption("말티즈");
  await expect(page.getByRole("heading", { name: created.title })).toBeVisible();
  await page.getByLabel("제목 검색").fill("십자인대");
  await expect(page.getByText("조건에 맞는 수술 후기가 없습니다.")).toBeVisible();

  const deleteResponse = await page.request.delete(`/api/admin/reviews/${created.id}`, {
    headers: { cookie: cookieHeader, "x-csrf-token": csrf },
  });
  expect(deleteResponse.ok()).toBe(true);
});

test("admin upload rejects unsupported MIME types and spoofed image bodies before touching Blob storage", async ({ page }) => {
  const { cookieHeader, csrf } = await adminLogin(page);
  const response = await page.request.post("/api/admin/uploads", {
    headers: { cookie: cookieHeader, "x-csrf-token": csrf },
    multipart: {
      file: {
        name: "payload.svg",
        mimeType: "image/svg+xml",
        buffer: Buffer.from("<svg><script>alert(1)</script></svg>"),
      },
    },
  });

  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({ error: "Only jpg, png, and webp images are allowed." });

  const spoofedResponse = await page.request.post("/api/admin/uploads", {
    headers: { cookie: cookieHeader, "x-csrf-token": csrf },
    multipart: {
      file: {
        name: "not-really-a-png.png",
        mimeType: "image/png",
        buffer: Buffer.from("<script>alert(1)</script>"),
      },
    },
  });

  expect(spoofedResponse.status()).toBe(400);
  expect(await spoofedResponse.json()).toEqual({
    error: "Image contents do not match the declared file type.",
  });

  const missingFileResponse = await page.request.post("/api/admin/uploads", {
    headers: { cookie: cookieHeader, "x-csrf-token": csrf },
    multipart: { note: "no file attached" },
  });

  expect(missingFileResponse.status()).toBe(400);
  expect(await missingFileResponse.json()).toEqual({ error: "Upload exactly one image file." });
});
