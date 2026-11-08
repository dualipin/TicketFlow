import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const publicDir = path.resolve(import.meta.dirname, '../public');
const svgPath = path.join(publicDir, 'favicon.svg');
const svgBuffer = fs.readFileSync(svgPath);

async function generate() {
  // 192x192 icon
  await sharp(svgBuffer, { density: 300 })
    .resize(192, 192, { fit: 'contain', background: { r: 9, g: 9, b: 11, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // 512x512 icon
  await sharp(svgBuffer, { density: 300 })
    .resize(512, 512, { fit: 'contain', background: { r: 9, g: 9, b: 11, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // 64x64 icon
  await sharp(svgBuffer, { density: 300 })
    .resize(64, 64, { fit: 'contain', background: { r: 9, g: 9, b: 11, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'pwa-64x64.png'));

  // Apple touch icon (180x180) with dark background
  const appleSvg = await sharp(svgBuffer, { density: 300 })
    .resize(140, 140, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: { r: 15, g: 15, b: 20, alpha: 1 },
    },
  })
    .composite([{ input: appleSvg, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // Maskable icon 512x512 with safe area (padding ~15-20%)
  const innerIcon = await sharp(svgBuffer, { density: 300 })
    .resize(380, 380, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 15, g: 15, b: 20, alpha: 1 },
    },
  })
    .composite([{ input: innerIcon, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'maskable-icon-512x512.png'));

  console.log('PWA icons successfully generated in', publicDir);
}

generate().catch(console.error);
