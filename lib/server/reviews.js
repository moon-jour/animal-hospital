import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import postgres from "postgres";
import { z } from "zod";

const dataDir = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDir, "reviews.json");

let sqlClient;
let schemaReady;

const noHtml = (value) => !/<\/?[a-z][\s\S]*>/i.test(value);
const dateInput = z
  .string()
  .trim()
  .refine((value) => !value || isValidDateOnly(value), "Date must be YYYY-MM-DD.")
  .optional()
  .default("");

const reviewInputSchema = z.object({
  title: z.string().trim().min(2).max(120).refine(noHtml, "HTML is not allowed."),
  category: z.string().trim().min(2).max(40).refine(noHtml, "HTML is not allowed."),
  breed: z.string().trim().max(60).refine(noHtml, "HTML is not allowed.").optional().default(""),
  admissionDate: dateInput,
  dischargeDate: dateInput,
  excerpt: z.string().trim().max(240).refine(noHtml, "HTML is not allowed.").optional().default(""),
  body: z.string().trim().min(1).max(5000).refine(noHtml, "HTML is not allowed."),
  imageUrls: z.array(z.string().trim().max(800)).max(12).optional().default([]),
  coverImageUrl: z.string().trim().max(800).optional().default(""),
  coverImageAlt: z.string().trim().max(120).refine(noHtml, "HTML is not allowed.").optional().default(""),
  published: z.boolean().optional().default(false),
}).refine(
  (value) =>
    !value.admissionDate ||
    !value.dischargeDate ||
    new Date(value.admissionDate).getTime() <= new Date(value.dischargeDate).getTime(),
  {
    message: "퇴원일은 입원일과 같거나 이후여야 합니다.",
    path: ["dischargeDate"],
  },
);

function normalizeInput(input) {
  const parsed = reviewInputSchema.parse(input);
  const safeCoverImageUrl = parsed.coverImageUrl ? normalizeImageUrl(parsed.coverImageUrl) : "";
  let safeImageUrls = parsed.imageUrls.filter(Boolean).map(normalizeImageUrl);

  if (safeImageUrls.length === 0 && safeCoverImageUrl) {
    safeImageUrls = [safeCoverImageUrl];
  }

  return {
    ...parsed,
    imageUrls: safeImageUrls,
    coverImageUrl: safeCoverImageUrl || safeImageUrls[0] || "",
    coverImageAlt: "",
  };
}

function normalizeImageUrl(value) {
  if (!value) {
    return "";
  }

  if (value.startsWith("/images/")) {
    return value;
  }

  const url = new URL(value);
  const allowedHosts = [
    "public.blob.vercel-storage.com",
    ...(process.env.BLOB_ALLOWED_HOSTS || "")
      .split(",")
      .map((host) => host.trim())
      .filter(Boolean),
  ];

  if (url.protocol !== "https:" || !allowedHosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))) {
    throw new Error("Only server-generated Vercel Blob image URLs are allowed.");
  }

  return url.toString();
}

function createSlug(title) {
  const ascii = title
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 48);
  const base = ascii || "surgery-review";

  return `${base}-${crypto.randomBytes(4).toString("hex")}`;
}

function isValidDateOnly(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function dateOnly(value) {
  if (!value) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value).slice(0, 10);
}

function getSql() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!sqlClient) {
    const requireSsl = shouldRequireDatabaseSsl(process.env.DATABASE_URL);

    sqlClient = postgres(process.env.DATABASE_URL, {
      max: 3,
      prepare: false,
      ssl: requireSsl ? "require" : undefined,
    });
  }

  return sqlClient;
}

function shouldRequireDatabaseSsl(databaseUrl) {
  if (process.env.NODE_ENV === "production") {
    return true;
  }

  try {
    const url = new URL(databaseUrl);
    const sslMode = url.searchParams.get("sslmode");

    if (sslMode === "disable") {
      return false;
    }

    if (sslMode === "require") {
      return true;
    }

    return !["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  } catch {
    return true;
  }
}

async function ensureSchema(sql) {
  if (schemaReady) {
    return;
  }

  schemaReady = (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS surgery_reviews (
      id uuid PRIMARY KEY,
      slug text UNIQUE NOT NULL,
      title text NOT NULL,
      category text NOT NULL,
      breed text NOT NULL DEFAULT '',
      excerpt text NOT NULL DEFAULT '',
      admission_date date,
      discharge_date date,
      body text NOT NULL,
      image_urls text[] NOT NULL DEFAULT ARRAY[]::text[],
      cover_image_url text NOT NULL DEFAULT '',
      cover_image_alt text NOT NULL DEFAULT '',
      published boolean NOT NULL DEFAULT false,
      author_email text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      published_at timestamptz
      )
    `;

    await sql`
      ALTER TABLE surgery_reviews
      ADD COLUMN IF NOT EXISTS breed text NOT NULL DEFAULT '';
    `;

    await sql`
      ALTER TABLE surgery_reviews
      ADD COLUMN IF NOT EXISTS admission_date date;
    `;

    await sql`
      ALTER TABLE surgery_reviews
      ADD COLUMN IF NOT EXISTS discharge_date date;
    `;

    await sql`
      ALTER TABLE surgery_reviews
      ADD COLUMN IF NOT EXISTS image_urls text[] NOT NULL DEFAULT ARRAY[]::text[];
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS surgery_reviews_public_idx
      ON surgery_reviews (published, published_at DESC, created_at DESC);
    `;
  })();

  await schemaReady;
}

async function readLocalStore() {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    return JSON.parse(await fs.readFile(dataFile, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function writeLocalStore(reviews) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dataFile, `${JSON.stringify(reviews, null, 2)}\n`);
}

function fromRow(row) {
  const imageUrls = Array.isArray(row.image_urls) && row.image_urls.length > 0 ? row.image_urls : [row.cover_image_url].filter(Boolean);
  const coverImageUrl = row.cover_image_url || imageUrls[0] || "";

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    breed: row.breed || "",
    excerpt: row.excerpt,
    admissionDate: dateOnly(row.admission_date),
    dischargeDate: dateOnly(row.discharge_date),
    body: row.body,
    imageUrls,
    coverImageUrl,
    coverImageAlt: "",
    published: row.published,
    authorEmail: row.author_email,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
    publishedAt: row.published_at instanceof Date ? row.published_at.toISOString() : row.published_at,
  };
}

function hydrateReview(review) {
  const imageUrls = Array.isArray(review.imageUrls) && review.imageUrls.length > 0 ? review.imageUrls : [review.coverImageUrl].filter(Boolean);
  const coverImageUrl = review.coverImageUrl || imageUrls[0] || "";

  return {
    ...review,
    imageUrls,
    coverImageUrl,
    coverImageAlt: "",
    admissionDate: review.admissionDate || "",
    dischargeDate: review.dischargeDate || "",
  };
}

function sortReviews(reviews) {
  return [...reviews].sort((a, b) => {
    const left = new Date(b.publishedAt || b.createdAt).getTime();
    const right = new Date(a.publishedAt || a.createdAt).getTime();

    return left - right;
  });
}

export async function listPublishedReviews() {
  const sql = getSql();

  if (sql) {
    await ensureSchema(sql);
    const rows = await sql`
      SELECT *
      FROM surgery_reviews
      WHERE published = true
      ORDER BY COALESCE(published_at, created_at) DESC
    `;

    return rows.map(fromRow);
  }

  const reviews = await readLocalStore();

  return sortReviews(reviews.map(hydrateReview).filter((review) => review.published));
}

export async function getPublishedReview(slug) {
  const sql = getSql();
  const decodedSlug = decodeURIComponent(slug);
  const slugVariants = Array.from(new Set([slug, decodedSlug, decodedSlug.normalize("NFKD"), decodedSlug.normalize("NFC")]));

  if (sql) {
    await ensureSchema(sql);
    const rows = await sql`
      SELECT *
      FROM surgery_reviews
      WHERE slug = ANY(${slugVariants}) AND published = true
      LIMIT 1
    `;

    return rows[0] ? fromRow(rows[0]) : null;
  }

  const reviews = await readLocalStore();

  return reviews.map(hydrateReview).find((review) => slugVariants.includes(review.slug) && review.published) || null;
}

export async function listAdminReviews() {
  const sql = getSql();

  if (sql) {
    await ensureSchema(sql);
    const rows = await sql`
      SELECT *
      FROM surgery_reviews
      ORDER BY created_at DESC
    `;

    return rows.map(fromRow);
  }

  return sortReviews((await readLocalStore()).map(hydrateReview));
}

export async function createReview(input, authorEmail) {
  const values = normalizeInput(input);
  const now = new Date().toISOString();
  const review = {
    id: crypto.randomUUID(),
    slug: createSlug(values.title),
    ...values,
    authorEmail,
    createdAt: now,
    updatedAt: now,
    publishedAt: values.published ? now : null,
  };
  const sql = getSql();

  if (sql) {
    await ensureSchema(sql);
    const rows = await sql`
      INSERT INTO surgery_reviews (
        id, slug, title, category, breed, excerpt, admission_date, discharge_date, body, image_urls, cover_image_url, cover_image_alt,
        published, author_email, created_at, updated_at, published_at
      )
      VALUES (
        ${review.id}, ${review.slug}, ${review.title}, ${review.category}, ${review.breed}, ${review.excerpt},
        ${review.admissionDate || null}, ${review.dischargeDate || null}, ${review.body}, ${review.imageUrls}, ${review.coverImageUrl}, ${review.coverImageAlt}, ${review.published},
        ${review.authorEmail}, ${review.createdAt}, ${review.updatedAt}, ${review.publishedAt}
      )
      RETURNING *
    `;

    return fromRow(rows[0]);
  }

  const reviews = await readLocalStore();
  reviews.unshift(review);
  await writeLocalStore(reviews);

  return review;
}

export async function updateReview(id, input, authorEmail) {
  const values = normalizeInput(input);
  const sql = getSql();

  if (sql) {
    await ensureSchema(sql);
    const rows = await sql`
      UPDATE surgery_reviews
      SET
        title = ${values.title},
        category = ${values.category},
        breed = ${values.breed},
        excerpt = ${values.excerpt},
        admission_date = ${values.admissionDate || null},
        discharge_date = ${values.dischargeDate || null},
        body = ${values.body},
        image_urls = ${values.imageUrls},
        cover_image_url = ${values.coverImageUrl},
        cover_image_alt = ${values.coverImageAlt},
        published = ${values.published},
        author_email = ${authorEmail},
        updated_at = now(),
        published_at = CASE
          WHEN ${values.published} THEN COALESCE(published_at, now())
          ELSE NULL
        END
      WHERE id = ${id}
      RETURNING *
    `;

    return rows[0] ? fromRow(rows[0]) : null;
  }

  const reviews = await readLocalStore();
  const index = reviews.findIndex((review) => review.id === id);

  if (index < 0) {
    return null;
  }

  const now = new Date().toISOString();
  reviews[index] = {
    ...reviews[index],
    ...values,
    authorEmail,
    updatedAt: now,
    publishedAt: values.published ? reviews[index].publishedAt || now : null,
  };
  await writeLocalStore(reviews);

  return reviews[index];
}

export async function deleteReview(id) {
  const sql = getSql();

  if (sql) {
    await ensureSchema(sql);
    const rows = await sql`
      DELETE FROM surgery_reviews
      WHERE id = ${id}
      RETURNING id
    `;

    return Boolean(rows[0]);
  }

  const reviews = await readLocalStore();
  const nextReviews = reviews.filter((review) => review.id !== id);
  await writeLocalStore(nextReviews);

  return nextReviews.length !== reviews.length;
}

export function reviewValidationError(error) {
  if (error instanceof z.ZodError) {
    return error.issues.map((issue) => issue.message).join(" ");
  }

  return error.message || "Invalid review payload.";
}
