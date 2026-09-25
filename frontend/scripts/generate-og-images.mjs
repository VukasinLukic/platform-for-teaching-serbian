/**
 * DEV-TIME ONLY (not part of `npm run build`): renders brand images with
 * Playwright/Chromium and writes committed PNGs into public/:
 *   og-image.png (1200×630), og/blog/<slug>.png (1200×630),
 *   apple-touch-icon.png (180), icon-192.png, icon-512.png, icon-maskable-512.png.
 *
 * Usage: node scripts/generate-og-images.mjs
 * Needs the `playwright` package (global install is fine: NODE_PATH=$(npm root -g)).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { blogPosts } from '../src/data/blogPosts.js';

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  const { execSync } = await import('node:child_process');
  const globalRoot = execSync('npm root -g').toString().trim();
  ({ chromium } = require(path.join(globalRoot, 'playwright')));
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'public');
const dataUri = (file, mime) => `data:${mime};base64,${fs.readFileSync(path.join(pub, file)).toString('base64')}`;
const mascot = dataUri('mascot/alano-hero.webp', 'image/webp');
const mascotReading = dataUri('mascot/alano-reading.webp', 'image/webp');
const heart = dataUri('icon.png', 'image/png');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

function ogHtml({ kicker, headline, sub, img }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0;box-sizing:border-box}
  body{width:1200px;height:630px;font-family:'DejaVu Sans','Noto Sans',Arial,sans-serif;background:#FFF8EC;overflow:hidden;position:relative;color:#1A1A1A}
  .band{position:absolute;right:-120px;top:-160px;width:720px;height:950px;background:#D62828;transform:rotate(14deg);border-radius:80px}
  .gold{position:absolute;right:360px;bottom:-90px;width:240px;height:240px;border-radius:50%;background:#F2C94C;opacity:.9}
  .mascot{position:absolute;right:70px;bottom:10px;height:560px;filter:drop-shadow(0 20px 30px rgba(0,0,0,.25))}
  .content{position:absolute;left:72px;top:64px;width:640px;bottom:60px;display:flex;flex-direction:column}
  .brand{display:flex;align-items:center;gap:16px;font-weight:800;font-size:30px;letter-spacing:.5px}
  .brand img{height:52px}
  .kicker{margin-top:40px;display:inline-block;align-self:flex-start;background:#1A1A1A;color:#F2C94C;font-weight:700;font-size:24px;padding:10px 20px;border-radius:999px}
  h1{margin-top:22px;font-size:${headline.length > 60 ? 44 : headline.length > 40 ? 50 : 72}px;line-height:1.08;font-weight:900}
  h1 span{color:#D62828}
  .sub{margin-top:18px;font-size:28px;color:#444;line-height:1.3}
  .url{margin-top:auto;font-size:30px;font-weight:800;color:#D62828}
  </style></head><body>
  <div class="band"></div><div class="gold"></div>
  <img class="mascot" src="${img}">
  <div class="content">
    <div class="brand"><img src="${heart}">Српски у Срцу</div>
    <div class="kicker">${esc(kicker)}</div>
    <h1>${headline}</h1>
    ${sub ? `<div class="sub">${esc(sub)}</div>` : ''}
    <div class="url">srpskiusrcu.rs</div>
  </div></body></html>`;
}

function iconHtml(size, { maskable = false } = {}) {
  const pad = maskable ? 0.22 : 0.12;
  return `<!doctype html><html><head><style>*{margin:0}body{width:${size}px;height:${size}px;background:#FFFFFF;display:flex;align-items:center;justify-content:center}
  img{width:${Math.round(size * (1 - 2 * pad))}px;height:auto}</style></head><body><img src="${heart}"></body></html>`;
}

const browser = await chromium.launch();
const page = await browser.newPage();

async function shot(html, width, height, out) {
  await page.setViewportSize({ width, height });
  await page.setContent(html, { waitUntil: 'load' });
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width, height } });
  console.log('wrote', path.relative(root, out));
}

await shot(
  ogHtml({
    kicker: 'Онлајн припрема · 5–8. разред',
    headline: 'Мала матура<br><span>из српског</span>',
    sub: 'Видео лекције, часови уживо и бесплатни тестови са наставницом Марином Лукић.',
    img: mascot,
  }),
  1200, 630, path.join(pub, 'og-image.png')
);

for (const post of blogPosts) {
  await shot(
    ogHtml({ kicker: `Блог · ${post.category}`, headline: esc(post.title), sub: '', img: mascotReading }),
    1200, 630, path.join(pub, 'og', 'blog', `${post.slug}.png`)
  );
}

await shot(iconHtml(180), 180, 180, path.join(pub, 'apple-touch-icon.png'));
await shot(iconHtml(192), 192, 192, path.join(pub, 'icon-192.png'));
await shot(iconHtml(512), 512, 512, path.join(pub, 'icon-512.png'));
await shot(iconHtml(512, { maskable: true }), 512, 512, path.join(pub, 'icon-maskable-512.png'));

await browser.close();
