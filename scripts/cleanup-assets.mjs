import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const assetDir = path.join(process.cwd(), "public", "assets");

const gameplayAssets = [
  "stage0.png",
  "stage1.png",
  "stage2.png",
  "stage3_baby.png",
  "stage4_medium.png",
  "stage5_adult.png",
  "berries.png",
  "cloudbed.png",
  "cookie.png",
  "soup.png",
  "ball.png",
  "yoyo.png",
  "clean_menu_icon.png"
];

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

async function cleanupAsset(filename) {
  const inputPath = path.join(assetDir, filename);
  await fs.access(inputPath);

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

  await sharp(next, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels
    }
  })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(`${inputPath}.tmp`);

  await fs.rename(`${inputPath}.tmp`, inputPath);
  console.log(`Cleaned ${filename}`);
}

for (const asset of gameplayAssets) {
  try {
    await cleanupAsset(asset);
  } catch (error) {
    console.warn(`Skipped ${asset}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
