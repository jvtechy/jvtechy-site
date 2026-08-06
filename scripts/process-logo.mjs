import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const input = path.join(root, 'assets', 'Image_logo_inicial.png');
const outLogo = path.join(root, 'assets', 'logo.png');
const outIcon = path.join(root, 'assets', 'logo-icon.png');
const outFavicon = path.join(root, 'assets', 'favicon.png');

function colorDist(r, g, b, br, bg, bb) {
  const dr = r - br;
  const dg = g - bg;
  const db = b - bb;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function removeBackground(data, width, height) {
  const samples = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
    [Math.floor(width / 2), 0],
    [Math.floor(width / 2), height - 1],
  ];

  let br = 0;
  let bg = 0;
  let bb = 0;
  for (const [x, y] of samples) {
    const i = (y * width + x) * 4;
    br += data[i];
    bg += data[i + 1];
    bb += data[i + 2];
  }
  br = Math.round(br / samples.length);
  bg = Math.round(bg / samples.length);
  bb = Math.round(bb / samples.length);

  const hard = 28;
  const soft = 52;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const d = colorDist(r, g, b, br, bg, bb);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const chroma = max - min;
    const isGrayish = chroma < 18 && max > 150;

    if (d <= hard || (isGrayish && d <= soft + 10)) {
      data[i + 3] = 0;
    } else if (d < soft) {
      const t = (d - hard) / (soft - hard);
      data[i + 3] = Math.round(255 * Math.min(1, Math.max(0, t)));
    }
  }

  return { br, bg, bb };
}

function contentBounds(data, width, height, alphaThreshold = 16) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * 4 + 3];
      if (a > alphaThreshold) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < 0) throw new Error('No opaque content found after background removal');
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

function findEmblemCut(data, width, height) {
  const dens = [];
  for (let x = 0; x < width; x++) {
    let sum = 0;
    for (let y = 0; y < height; y++) sum += data[(y * width + x) * 4 + 3];
    dens.push(sum / (height * 255));
  }

  let started = false;
  let gapStart = -1;
  for (let x = 0; x < dens.length; x++) {
    if (!started && dens[x] > 0.05) started = true;
    if (started && dens[x] < 0.02) {
      if (gapStart < 0) gapStart = x;
    } else if (gapStart >= 0 && dens[x] >= 0.02) {
      break;
    }
  }

  return gapStart > 20 ? Math.max(1, gapStart - 2) : Math.round(width * 0.42);
}

async function main() {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = Buffer.from(data);
  const bg = removeBackground(pixels, info.width, info.height);
  const bounds = contentBounds(pixels, info.width, info.height);

  console.log('Background sample:', bg);
  console.log('Content bounds:', bounds);

  const cropped = await sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .extract(bounds)
    .png()
    .toBuffer();

  const croppedMeta = await sharp(cropped).metadata();
  const pad = Math.round(Math.max(croppedMeta.width, croppedMeta.height) * 0.04);

  await sharp(cropped)
    .extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toFile(outLogo);

  const logoRaw = await sharp(outLogo).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const cut = findEmblemCut(logoRaw.data, logoRaw.info.width, logoRaw.info.height);
  console.log('Emblem cut at x =', cut);

  const emblemBuf = await sharp(outLogo)
    .extract({
      left: 0,
      top: 0,
      width: cut,
      height: logoRaw.info.height,
    })
    .png()
    .toBuffer();

  const trimmed = await sharp(emblemBuf).trim({ threshold: 8 }).png().toBuffer();

  await sharp(trimmed)
    .resize(512, 512, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toFile(outIcon);

  await sharp(outIcon)
    .resize(180, 180)
    .png({ compressionLevel: 9 })
    .toFile(outFavicon);

  const logoMeta = await sharp(outLogo).metadata();
  const iconMeta = await sharp(outIcon).metadata();
  console.log(`Wrote ${outLogo} (${logoMeta.width}x${logoMeta.height})`);
  console.log(`Wrote ${outIcon} (${iconMeta.width}x${iconMeta.height})`);
  console.log(`Wrote ${outFavicon} (180x180)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
