import fs from "node:fs/promises";
import path from "node:path";

const sourcePath = path.join(process.cwd(), "src", "main.js");
const outputDir = path.join(process.cwd(), "public", "site");
const outputPath = path.join(outputDir, "main.js");
const source = await fs.readFile(sourcePath, "utf8");

if (!source.includes("export function mountSite()")) {
  throw new Error("src/main.js must export mountSite() for public script sync.");
}

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(
  outputPath,
  `// Generated from src/main.js by scripts/sync-site-script.mjs.\n${source}\nmountSite();\n`,
);

console.log(`Synced ${path.relative(process.cwd(), outputPath)}`);
