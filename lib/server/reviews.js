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

const reviewInputSchema = z.object({
  title: z.string().trim().min(2).max(120).refine(noHtml, "HTML is not allowed."),
  category: z.string().trim().min(2).max(40).refine(noHtml, "HTML is not allowed."),
  breed: z.string().trim().max(60).refine(noHtml, "HTML is not allowed.").optional().default(""),
  excerpt: z.string().trim().max(240).refine(noHtml, "HTML is not allowed.").optional().default(""),
  body: z.string().trim().min(1).max(5000).refine(noHtml, "HTML is not allowed."),
  coverImageUrl: z.string().trim().max(800).optional().default(""),
  coverImageAlt: z.string().trim().max(120).refine(noHtml, "HTML is not allowed.").optional().default(""),
  published: z.boolean().optional().default(false),
});

function normalizeInput(input) {
  const parsed = reviewInputSchema.parse(input);
  const safeImageUrl = normalizeImageUrl(parsed.coverImageUrl);

  return {
    ...parsed,
    coverImageUrl: safeImageUrl,
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

function getSql() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!sqlClient) {
    sqlClient = postgres(process.env.DATABASE_URL, {
      max: 3,
      prepare: true,
      ssl: process.env.NODE_ENV === "production" ? "require" : undefined,
    });
  }

  return sqlClient;
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
      body text NOT NULL,
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
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    breed: row.breed || "",
    excerpt: row.excerpt,
    body: row.body,
    coverImageUrl: row.cover_image_url,
    coverImageAlt: row.cover_image_alt,
    published: row.published,
    authorEmail: row.author_email,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
    publishedAt: row.published_at instanceof Date ? row.published_at.toISOString() : row.published_at,
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

  return sortReviews(reviews.filter((review) => review.published));
}

export async function getPublishedReview(slug) {
  const sql = getSql();

  if (sql) {
    await ensureSchema(sql);
    const rows = await sql`
      SELECT *
      FROM surgery_reviews
      WHERE slug = ${slug} AND published = true
      LIMIT 1
    `;

    return rows[0] ? fromRow(rows[0]) : null;
  }

  const reviews = await readLocalStore();

  return reviews.find((review) => review.slug === slug && review.published) || null;
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

  return sortReviews(await readLocalStore());
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
        id, slug, title, category, breed, excerpt, body, cover_image_url, cover_image_alt,
        published, author_email, created_at, updated_at, published_at
      )
      VALUES (
        ${review.id}, ${review.slug}, ${review.title}, ${review.category}, ${review.breed}, ${review.excerpt},
        ${review.body}, ${review.coverImageUrl}, ${review.coverImageAlt}, ${review.published},
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
        body = ${values.body},
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
