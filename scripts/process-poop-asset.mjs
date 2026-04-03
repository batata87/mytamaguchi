import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/** Match cleanup-assets.mjs — white / near-white → transparent, then trim. */
function shouldRemovePixel(r, g, b, a) {
  if (a === 0) {
    return false;
  }
  const maxChannel = Math.max(r, g, b);
  const minChannel = Math.min(r, g, b);
  const nearWhite = r >= 247 && g >= 247 && b >= 247;
  const lowSaturation = maxChannel - minChannel <= 10;
  return nearWhite && lowSaturation;
}

async function processPoop(inputPath, outPath) {
  const image = sharp(inputPath).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const next = Buffer.from(data);

  for (let i = 0; i < next.length; i += info.channels) {
    const r = next[i];
    const g = next[i + 1];
    const b = next[i + 2];
    const a = next[i + 3];
    if (shouldRemovePixel(r, g, b, a)) {
      next[i + 3] = 0;
    }
  }

  const tmp = `${outPath}.tmp`;
  await sharp(next, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels
    }
  })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(tmp);

  await fs.rename(tmp, outPath);
  console.log(`Wrote ${outPath}`);
}

const out = path.join(process.cwd(), "public", "assets", "poop.png");
const input =
  process.argv[2] ??
  path.join(process.cwd(), "public", "assets", "poop.png");

await processPoop(input, out);
