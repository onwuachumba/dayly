// Generates DAYLY PWA icons from the vector D-mark (see components/Logo.tsx).
// Run: node scripts/generate-icons.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(here, "..", "public", "icons");

function mark({ fg, sun }) {
  return `<g transform="translate(76,84) scale(8)">
    <path d="M15 9 V35 M15 9 H22.5 A13.5 13.5 0 0 1 22.5 35 H15" stroke="${fg}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M17.5 24.5l4 4 6.5-7.5" stroke="${fg}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="32" cy="10.5" r="4.6" fill="${sun}"/>
    <g stroke="${sun}" stroke-width="2.2" stroke-linecap="round">
      <line x1="32" y1="1.5" x2="32" y2="2.6"/>
      <line x1="38.5" y1="4" x2="37.7" y2="5.4"/>
      <line x1="41" y1="10.5" x2="39.4" y2="10.5"/>
    </g>
  </g>`;
}

function svg({ bg, fg, sun }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${bg}"/>
  ${mark({ fg, sun })}
</svg>`;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const jobs = [
    // Regular icons: ivory tile, forest mark, gold sun.
    { file: "icon-192.png", size: 192, bg: "#FAF7F0", fg: "#1E4D3B", sun: "#D9A441" },
    { file: "icon-512.png", size: 512, bg: "#FAF7F0", fg: "#1E4D3B", sun: "#D9A441" },
    // Maskable: full-bleed forest tile, ivory mark, gold sun (safe padding built in).
    { file: "maskable-512.png", size: 512, bg: "#1E4D3B", fg: "#FAF7F0", sun: "#D9A441" },
    // Apple touch: opaque forest tile (iOS applies its own rounding).
    { file: "apple-touch-icon.png", size: 180, bg: "#1E4D3B", fg: "#FAF7F0", sun: "#D9A441" },
  ];
  for (const j of jobs) {
    const out = path.join(OUT, j.file);
    await sharp(Buffer.from(svg(j))).resize(j.size, j.size).png().toFile(out);
    const meta = await sharp(out).metadata();
    console.log(`${j.file}: ${meta.width}x${meta.height} ${meta.format}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
