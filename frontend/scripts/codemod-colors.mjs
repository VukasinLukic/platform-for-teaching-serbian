#!/usr/bin/env node
/**
 * Codemod: rewrite Tailwind arbitrary hex color classes (e.g. `bg-[#D62828]/10`)
 * to named palette tokens defined in tailwind.config.js (e.g. `bg-brand/10`).
 *
 * Usage: node scripts/codemod-colors.mjs [--dry]
 * Scans src/**\/*.{jsx,js}. Unknown hex values are left untouched and reported.
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');
const DRY = process.argv.includes('--dry');

// hex (lowercase, no #) -> token
const MAP = {
  // brand reds (stray reds are unified into the scale)
  d62828: 'brand', ce1919: 'brand', b91f1f: 'brand-700', b01515: 'brand-700',
  a01313: 'brand-800', '9e1b1b': 'brand-800', '780000': 'brand-900', '600000': 'brand-950', '3a1414': 'brand-950',
  fff5f5: 'brand-50', fff8f8: 'brand-50',
  // ink
  '1a1a1a': 'ink', '2d2d2d': 'ink-800', '2a2a2a': 'ink-800',
  // gold
  f2c94c: 'gold', ffd700: 'gold', e0b739: 'gold-500', d4a843: 'gold-500', d4a927: 'gold-500',
  b7791f: 'gold-700', fff8e1: 'gold-50', fffdf5: 'gold-50', fff1c2: 'gold-100',
  // backgrounds
  f7f7f7: 'surface', fdfafc: 'paper', f5f3ef: 'paper-200', fff8f0: 'paper-100',
  // semantic
  '27ae60': 'success', '1e8449': 'success-700', bfecc9: 'success-100', '9dd6ac': 'success-200',
  f77f00: 'warning', dc6b00: 'warning-600', ff6b35: 'warning', e55a28: 'warning-600',
  '669bbc': 'info-400', '5689a8': 'info-500', '4a7a96': 'info-600', '4a7a99': 'info-600',
  '003366': 'info-900', '002244': 'info-950',
  // third-party brand
  '7360f2': 'viber',
};

const RE = /([a-z][a-z0-9-]*?)-\[#([0-9a-fA-F]{3,8})\]/g;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(jsx|js)$/.test(name)) out.push(p);
  }
  return out;
}

let before = 0, after = 0, files = 0;
const unknown = {};
for (const file of walk(ROOT)) {
  const src = readFileSync(file, 'utf8');
  before += (src.match(RE) || []).length;
  const next = src.replace(RE, (m, prefix, hex) => {
    const token = MAP[hex.toLowerCase()];
    if (!token) { unknown[hex] = (unknown[hex] || 0) + 1; return m; }
    return `${prefix}-${token}`;
  });
  after += (next.match(RE) || []).length;
  if (next !== src) { files++; if (!DRY) writeFileSync(file, next); }
}
console.log(`hex classes before: ${before}, after: ${after}, files changed: ${files}${DRY ? ' (dry run)' : ''}`);
if (Object.keys(unknown).length) console.log('unmapped:', unknown);
