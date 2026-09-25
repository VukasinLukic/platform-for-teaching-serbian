#!/usr/bin/env node
/**
 * Lists files in frontend/public that are not referenced from frontend/src,
 * frontend/index.html, public JSON/XML/TXT files or backend functions (email
 * templates). Informational only (exit code 0).
 *
 * Unused files are not deleted: move them with
 *   git mv "frontend/public/<file>" "design-assets/unused-public/<file>"
 *
 * Usage: node scripts/find-unused-public.mjs   (from frontend/)
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const frontend = join(dirname(fileURLToPath(import.meta.url)), '..');
const repo = join(frontend, '..');
const publicDir = join(frontend, 'public');

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.name === 'node_modules' || e.name === 'dist') return [];
    const p = join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });

const isText = (p) => /\.(jsx?|mjs|cjs|tsx?|css|html|json|xml|txt|md)$/.test(p);
const corpus = [
  ...walk(join(frontend, 'src')),
  join(frontend, 'index.html'),
  join(frontend, 'vite.config.js'),
  join(frontend, 'tailwind.config.js'),
  ...walk(join(repo, 'backend/functions/src')),
  ...walk(publicDir).filter((p) => /\.(json|xml|txt|webmanifest)$/.test(p) && !p.endsWith('version.json')),
]
  .filter(isText)
  .map((p) => readFileSync(p, 'utf8'))
  .join('\n');

const candidates = walk(publicDir)
  .map((p) => relative(publicDir, p).split('\\').join('/'))
  .filter((rel) => !rel.startsWith('data/') && !/\.(json|xml|txt)$/.test(rel));

const unused = candidates.filter((rel) => {
  const variants = [rel, encodeURI(rel), rel.replace(/ /g, '%20')];
  return !variants.some((v) => corpus.includes(v));
});

if (unused.length === 0) {
  console.log('All files in public/ are referenced.');
} else {
  let total = 0;
  console.log(`${unused.length} unreferenced file(s) in public/:`);
  for (const rel of unused) {
    const size = statSync(join(publicDir, rel)).size;
    total += size;
    console.log(`  ${rel}  (${(size / 1024).toFixed(1)} KB)`);
  }
  console.log(`Total: ${(total / 1024 / 1024).toFixed(2)} MB`);
}
