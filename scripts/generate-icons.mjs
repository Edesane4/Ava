// Generates PNG app icons from the SVG masters using `sharp`.
//   npm run icons
// Produces: icon-192.png, icon-512.png, apple-touch-icon.png,
//           maskable-192.png, maskable-512.png  (in /public/icons)
//
// `sharp` is a devDependency. If you'd rather not rasterize, the manifest
// also lists the SVG icons, which install fine on Android/Chrome & desktop.

import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, "..", "public", "icons");

const jobs = [
  { src: "icon.svg", out: "icon-192.png", size: 192 },
  { src: "icon.svg", out: "icon-512.png", size: 512 },
  { src: "icon.svg", out: "apple-touch-icon.png", size: 180 },
  { src: "maskable.svg", out: "maskable-192.png", size: 192 },
  { src: "maskable.svg", out: "maskable-512.png", size: 512 },
];

for (const { src, out, size } of jobs) {
  await sharp(join(iconsDir, src))
    .resize(size, size)
    .png()
    .toFile(join(iconsDir, out));
  console.log(`✓ ${out} (${size}×${size})`);
}
console.log("🎉 Icons generated!");
