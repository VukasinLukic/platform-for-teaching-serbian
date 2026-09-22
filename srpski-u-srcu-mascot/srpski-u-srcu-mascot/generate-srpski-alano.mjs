#!/usr/bin/env node
/**
 * Alano x "Srpski u srcu" - on-brand stills via Magic Hour AI Image Editor.
 *
 * Adapted from alano-mascot/scripts/generate-alano-images.mjs (BytePlus Seedream)
 * to Magic Hour's API. Same discipline as the skill: every request attaches the
 * canonical reference (assets/root/alano-think.png) plus the canonical STYLE
 * string; the script aborts without the reference.
 *
 *   MAGICHOUR_API_KEY=... node generate-srpski-alano.mjs
 *
 * Env: MH_MODEL (default "default"), MH_ONLY=id1,id2, MH_RES (default 2k), MH_COUNT (1|4)
 * Output: output/stills/<id>[-n].png
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";

const API = "https://api.magichour.ai/v1";
const KEY = process.env.MAGICHOUR_API_KEY;
if (!KEY) { console.error("MAGICHOUR_API_KEY is required (runtime-injected)."); process.exit(1); }

const SKILL = process.env.ALANO_SKILL_DIR ?? path.join(os.homedir(), ".claude/skills/alano-mascot");
const REF = path.join(SKILL, "assets/root/alano-think.png");
if (!existsSync(REF)) { console.error(`Reference image missing: ${REF}`); process.exit(1); }

const OUT = path.resolve(process.env.ALANO_OUTPUT_DIR ?? "output", "stills");
const MODEL = process.env.MH_MODEL ?? "default";
const RES = process.env.MH_RES ?? "2k";
const COUNT = Number(process.env.MH_COUNT ?? 1);

// Canonical STYLE string from references/brand.md (unchanged).
const STYLE =
  "Soft 3D render matching the reference character exactly: the cute plush cat mascot Alano " +
  "with pink-and-mint gradient fur, teal ears, rosy cheeks, black t-shirt with a small pastel rainbow. " +
  "Warm cream background, premium pastel palette of candy pink, mint green, soft lavender, warm peach and sky blue, " +
  "soft studio lighting, centered balanced composition, " +
  "the warm cream background color extends continuously to all four edges of the image, " +
  "seamless studio backdrop photograph style, " +
  "absolutely no text, no letters, no numbers, no symbols, no watermarks";

// Flat-backdrop clause from references/image-generation.md (so the still can be cut out).
const FLAT =
  "The background is one completely flat uniform field of warm cream color with no floor, no ground plane, " +
  "no horizon line and no perspective; the character floats against it. No contact shadow, no cast shadow, " +
  "no reflection. Alano's own colors stay soft and pastel and never blend into the backdrop.";

// Brand prop: the "Srpski u srcu" logo heart - a glossy red heart woven from interlacing ribbon strands.
const HEART =
  "a glossy candy-red heart (#D62828) woven from several interlacing parallel ribbon strands, like a braided ribbon heart";

const STILLS = [
  { id: "hero", prompt: `${STYLE}. ${FLAT} Alano proudly holding ${HEART} in both paws in front of his chest, wearing a small pastel graduation cap on his head with a tiny golden tassel, warm confident encouraging smile, facing directly toward the viewer` },
  { id: "reading", prompt: `${STYLE}. ${FLAT} Alano sitting cheerfully and holding a large open pastel book in one paw and a red pencil in the other, a small ${HEART} floating above the book, wearing a small pastel graduation cap, bright curious smile, facing directly toward the viewer` },
  { id: "wave", prompt: `${STYLE}. ${FLAT} Alano waving hello warmly with one raised paw, other paw holding a small ${HEART}, wearing a small pastel graduation cap, bright welcoming smile, facing directly toward the viewer` },
  { id: "celebrating", prompt: `${STYLE}. ${FLAT} Alano celebrating joyfully after passing an exam, both paws thrown up in the air, wearing a small pastel graduation cap, huge happy open-mouth smile, small red hearts and golden star confetti floating around him` },
];

// MH_SHIRT=heart: replace the pastel rainbow on the t-shirt with the "Srpski u srcu" heart logo.
// Poses are rewritten so the chest stays visible (no book/heart held in front of it).
const SHIRT_HEART = process.env.MH_SHIRT === "heart";
const SHIRT_OLD = "black t-shirt with a small pastel rainbow";
const SHIRT_NEW =
  "black t-shirt with one small glossy candy-red heart logo (#D62828) printed centered on the chest, the heart woven from " +
  "several interlacing parallel ribbon strands like a braided ribbon heart, and absolutely no rainbow anywhere on the shirt";
const HEART_STILLS = [
  { id: "hero", prompt: `${STYLE}. ${FLAT} Alano standing proudly and confidently, both paws relaxed at his sides so the whole chest is clearly visible, wearing a small pastel graduation cap on his head with a tiny golden tassel, warm encouraging smile, facing directly toward the viewer` },
  { id: "reading", prompt: `${STYLE}. ${FLAT} Alano sitting cheerfully with a large open pastel book resting low on his lap, held at the bottom by both paws and tilted forward so the shirt chest stays fully visible above it, a red pencil tucked behind one ear, wearing a small pastel graduation cap, bright curious smile, facing directly toward the viewer` },
  { id: "wave", prompt: `${STYLE}. ${FLAT} Alano waving hello warmly with one raised paw, the other paw relaxed at his side, wearing a small pastel graduation cap, bright welcoming smile, chest fully visible, facing directly toward the viewer` },
  { id: "celebrating", prompt: `${STYLE}. ${FLAT} Alano celebrating joyfully after passing an exam, both paws thrown up in the air, wearing a small pastel graduation cap, huge happy open-mouth smile, golden star confetti floating around him, chest fully visible` },
].map((x) => ({ id: `${x.id}-heart`, prompt: x.prompt.replaceAll(SHIRT_OLD, SHIRT_NEW) + ". No question mark and no floating symbols other than those described" }));

const only = process.env.MH_ONLY?.split(",").map((s) => s.trim()).filter(Boolean);
const GREEN = process.env.MH_BG === "green"; // chroma-green backdrop for clean cutouts (references/cutout.md)
const GREEN_CLAUSE = " The backdrop is one single uniform solid bright chroma-key green color, no gradient, no vignette, no shadow on the background, crisp clean edges with no white outline or halo around the character.";
const toGreen = (t) => t.replaceAll("warm cream", "bright chroma-key green") + GREEN_CLAUSE;
const base = SHIRT_HEART ? HEART_STILLS : STILLS;
const queue = base.filter((s) => !only || only.includes(s.id.replace("-heart", ""))).map((s) => GREEN ? { id: `${s.id}-green`, prompt: toGreen(s.prompt) } : s);
const H = { authorization: `Bearer ${KEY}`, "content-type": "application/json", accept: "application/json" };

async function j(res) { const t = await res.text(); try { return JSON.parse(t); } catch { return { raw: t }; } }

async function upload(file) {
  const ext = path.extname(file).slice(1).toLowerCase();
  const r = await fetch(`${API}/files/upload-urls`, { method: "POST", headers: H, body: JSON.stringify({ items: [{ type: "image", extension: ext }] }) });
  const b = await j(r);
  if (!r.ok) throw new Error(`upload-urls ${r.status} ${JSON.stringify(b).slice(0, 300)}`);
  const it = b.items[0];
  const put = await fetch(it.upload_url, { method: "PUT", body: await readFile(file) });
  if (!put.ok) throw new Error(`PUT ${put.status}`);
  return it.file_path;
}

async function generate(still, refPath) {
  const r = await fetch(`${API}/ai-image-editor`, {
    method: "POST", headers: H,
    body: JSON.stringify({
      name: `alano-srpski-${still.id}`,
      image_count: COUNT,
      model: MODEL,
      aspect_ratio: "1:1",
      resolution: RES,
      assets: { image_file_paths: [refPath] },
      style: { prompt: still.prompt },
    }),
  });
  const b = await j(r);
  if (!r.ok) throw new Error(`${still.id}: HTTP ${r.status} ${JSON.stringify(b).slice(0, 500)}`);
  console.log(`… ${still.id}: project ${b.id} (credits ${b.credits_charged})`);
  for (let i = 0; i < 120; i++) {
    await new Promise((s) => setTimeout(s, 5000));
    const d = await j(await fetch(`${API}/image-projects/${b.id}`, { headers: H }));
    if (d.status === "complete") {
      await mkdir(OUT, { recursive: true });
      for (const [n, dl] of (d.downloads ?? []).entries()) {
        const img = await fetch(dl.url);
        const ext = (new URL(dl.url).pathname.match(/\.(\w+)$/) ?? [, "png"])[1];
        const dest = path.join(OUT, `${still.id}${d.downloads.length > 1 ? `-${n + 1}` : ""}.${ext}`);
        await writeFile(dest, Buffer.from(await img.arrayBuffer()));
        console.log(`✔ ${still.id} → ${path.relative(process.cwd(), dest)}`);
      }
      return;
    }
    if (["error", "canceled"].includes(d.status)) throw new Error(`${still.id}: ${d.status} ${JSON.stringify(d.error)}`);
  }
  throw new Error(`${still.id}: timed out`);
}

const ref = await upload(REF);
const fails = [];
for (const s of queue) { try { await generate(s, ref); } catch (e) { console.error(`✗ ${e.message}`); fails.push(s.id); } }
if (fails.length) { console.error(`Retry with MH_ONLY=${fails.join(",")}`); process.exit(1); }
