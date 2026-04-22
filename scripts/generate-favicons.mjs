/**
 * Builds favicons from public/gainables-mark.png — alpha preserved (no filled background).
 * Writes Next.js metadata file conventions (app/icon.png, app/apple-icon.png) plus public/favicon-32.png.
 */
import sharp from "sharp";
import { mkdir } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const SRC = join(root, "public", "gainables-mark.png");

const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

async function transparentSquare(size, outPath) {
  await mkdir(dirname(outPath), { recursive: true });
  await sharp(SRC)
    .resize(size, size, {
      fit: "contain",
      kernel: sharp.kernel.lanczos3,
      background: TRANSPARENT,
    })
    .ensureAlpha()
    .png()
    .toFile(outPath);
}

async function main() {
  await transparentSquare(32, join(root, "app", "icon.png"));
  await transparentSquare(180, join(root, "app", "apple-icon.png"));
  await transparentSquare(32, join(root, "public", "favicon-32.png"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
