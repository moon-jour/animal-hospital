import fs from "node:fs/promises";
import path from "node:path";

const roots = [".next/static", "public"];
const forbiddenValues = [
  process.env.DATABASE_URL,
  process.env.BLOB_READ_WRITE_TOKEN,
  process.env.AUTH_SECRET,
  process.env.NEXTAUTH_SECRET,
  process.env.RESEND_API_KEY,
].filter((value) => value && value.length >= 12);
const forbiddenPatterns = [
  /postgres(?:ql)?:\/\/[^"'\s]+/i,
  /BLOB_READ_WRITE_TOKEN\s*=\s*[^"'\s]+/i,
  /AUTH_SECRET\s*=\s*[^"'\s]+/i,
  /RESEND_API_KEY\s*=\s*[^"'\s]+/i,
];

async function listFiles(root) {
  try {
    const entries = await fs.readdir(root, { withFileTypes: true });
    const nested = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(root, entry.name);

        if (entry.isDirectory()) {
          return listFiles(fullPath);
        }

        return fullPath;
      }),
    );

    return nested.flat();
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

const files = (await Promise.all(roots.map(listFiles))).flat();
const matches = [];

for (const file of files) {
  const stat = await fs.stat(file);

  if (stat.size > 2 * 1024 * 1024) {
    continue;
  }

  const content = await fs.readFile(file, "utf8").catch(() => "");

  for (const secretValue of forbiddenValues) {
    if (content.includes(secretValue)) {
      matches.push(`${file}: contains an environment secret value`);
    }
  }

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(content)) {
      matches.push(`${file}: matches ${pattern}`);
    }
  }
}

if (matches.length > 0) {
  console.error(matches.join("\n"));
  process.exit(1);
}

console.log(`Secret scan passed across ${files.length} public/static files.`);
