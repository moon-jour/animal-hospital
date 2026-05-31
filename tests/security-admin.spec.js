import fs from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

const dataFile = path.join(process.cwd(), ".data", "reviews.json");

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  await fs.rm(dataFile, { force: true });
});

async function openAdmin(page) {
  await page.goto("/admin/reviews");
  await expect(page).toHaveURL(/\/admin\/reviews/);
  await expect(page.getByRole("heading", { name: "수술 후기 관리" })).toBeVisible();

  const csrfResponse = await page.request.get("/api/admin/csrf");
  const csrfPayload = await csrfResponse.json();

  expect(csrfResponse.ok()).toBe(true);
  expect(csrfPayload.csrfToken).toBeTruthy();

  const cookies = await page.context().cookies();
  const csrf = cookies.find((cookie) => cookie.name === "sams_admin_csrf")?.value;

  expect(csrf).toBeTruthy();

  return {
    csrf,
    cookieHeader: cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; "),
  };
}

test("admin pages are open for temporary testing while mutations still require CSRF", async ({ page }) => {
  await page.goto("/admin/reviews");
  await expect(page).toHaveURL(/\/admin\/reviews/);
  await expect(page.getByRole("heading", { name: "수술 후기 관리" })).toBeVisible();
  await expect(page.getByLabel("입원일")).toHaveAttribute("type", "date");
  await expect(page.getByLabel("퇴원일")).toHaveAttribute("type", "date");
  expect(await page.getByText("목록 요약").count()).toBe(0);
  expect(await page.getByText("대표 이미지 URL").count()).toBe(0);
  expect(await page.getByText("대표 이미지 설명").count()).toBe(0);
  await expect(page.locator(".admin-image-field input[type='file']")).toHaveAttribute("accept", "image/jpeg,image/png,image/webp");
  await expect(page.locator(".admin-image-field input[type='file']")).toHaveAttribute("multiple", "");
  await page.locator(".admin-image-field input[type='file']").setInputFiles(path.join(process.cwd(), "public/images/facility-01.jpg"));
  await expect(page.getByRole("dialog", { name: "썸네일 편집" })).toBeVisible();
  await expect(page.getByAltText("썸네일로 자를 원본 이미지")).toBeVisible();
  await expect(page.getByAltText("정사각형 썸네일 미리보기")).toBeVisible();
  await page.getByRole("button", { name: "영역 적용" }).click();
  await expect(page.getByRole("dialog", { name: "썸네일 편집" })).toHaveCount(0);

  const adminLayout = await page.evaluate(() => {
    const dateLabels = Array.from(document.querySelectorAll(".admin-date-row label")).map((label) =>
      label.getBoundingClientRect(),
    );

    return {
      bodyOverflowY: getComputedStyle(document.body).overflowY,
      dateLabelCount: dateLabels.length,
      dateTopDifference: Math.abs((dateLabels[0]?.top || 0) - (dateLabels[1]?.top || 0)),
    };
  });

  expect(adminLayout.bodyOverflowY).toBe("auto");
  expect(adminLayout.dateLabelCount).toBe(2);
  expect(adminLayout.dateTopDifference).toBeLessThan(2);

  const listResponse = await page.request.get("/api/admin/reviews");
  expect(listResponse.status()).toBe(200);

  const createResponse = await page.request.post("/api/admin/reviews", {
    data: { title: "권한 없는 요청", category: "수술 후기", body: "작성 실패" },
  });
  expect(createResponse.status()).toBe(403);

  const uploadResponse = await page.request.post("/api/admin/uploads", {
    multipart: { file: { name: "bad.svg", mimeType: "image/svg+xml", buffer: Buffer.from("<svg />") } },
  });
  expect(uploadResponse.status()).toBe(403);
});

test("login page redirects to admin while temporary auth bypass is enabled", async ({ page }) => {
  await page.goto("/admin/login");
  await expect(page).toHaveURL(/\/admin\/reviews/);
  await expect(page.getByRole("heading", { name: "수술 후기 관리" })).toBeVisible();
});

test("admin review mutations validate CSRF, payloads, publish state, and author identity", async ({ page }) => {
  const { cookieHeader, csrf } = await openAdmin(page);

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
      admissionDate: "2026-05-01",
      dischargeDate: "2026-05-05",
      body: "관리자가 직접 작성한 공개 전 임시저장 후기입니다.",
      imageUrls: ["/images/facility-01.jpg", "/images/facility-02.jpg"],
      coverImageUrl: "/images/facility-10.jpg",
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
  expect(created.admissionDate).toBe("2026-05-01");
  expect(created.dischargeDate).toBe("2026-05-05");
  expect(created.imageUrls).toEqual(["/images/facility-01.jpg", "/images/facility-02.jpg"]);
  expect(created.coverImageUrl).toBe("/images/facility-10.jpg");

  const publicDrafts = await page.request.get("/api/reviews");
  expect((await publicDrafts.json()).reviews.map((review) => review.id)).not.toContain(created.id);

  const publishResponse = await page.request.patch(`/api/admin/reviews/${created.id}`, {
    data: {
      title: created.title,
      category: created.category,
      breed: created.breed,
      admissionDate: created.admissionDate,
      dischargeDate: created.dischargeDate,
      body: "공개된 수술 후기입니다.",
      imageUrls: created.imageUrls,
      coverImageUrl: created.coverImageUrl,
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
  await expect(page.getByAltText(`${created.title} 썸네일`)).toBeVisible();
  await expect(page.getByText("2026.05.01 - 2026.05.05")).toBeVisible();
  await page.goto(`/reviews/${created.slug}`);
  await expect(page.getByRole("heading", { name: created.title })).toBeVisible();
  await expect(page.locator(".review-detail__gallery img")).toHaveCount(2);
  await page.goto("/reviews");
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
  const { cookieHeader, csrf } = await openAdmin(page);
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

  const oversizedResponse = await page.request.post("/api/admin/uploads", {
    headers: { cookie: cookieHeader, "x-csrf-token": csrf },
    multipart: {
      file: {
        name: "oversized.png",
        mimeType: "image/png",
        buffer: Buffer.concat([
          Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
          Buffer.alloc(3 * 1024 * 1024),
        ]),
      },
    },
  });
  expect(oversizedResponse.status()).toBe(400);
  expect(await oversizedResponse.json()).toEqual({ error: "Image must be 3MB or smaller." });

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
