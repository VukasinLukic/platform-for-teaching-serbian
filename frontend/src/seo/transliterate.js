/**
 * Serbian Cyrillic -> Latin (gajica) transliteration.
 *
 * Pure module (no browser/Vite APIs) so it can be used at runtime and by the
 * build-time SEO step in plain Node.
 *
 * Case handling for digraphs (Љ, Њ, Џ):
 *   "Љубав" -> "Ljubav", "ЉУБАВ" -> "LJUBAV", "Њ" alone before a capital -> "NJ".
 */

const LOWER = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', ђ: 'đ', е: 'e', ж: 'ž', з: 'z', и: 'i',
  ј: 'j', к: 'k', л: 'l', љ: 'lj', м: 'm', н: 'n', њ: 'nj', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', ћ: 'ć', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'č', џ: 'dž', ш: 'š',
};

const UPPER = {};
for (const [cyr, lat] of Object.entries(LOWER)) {
  UPPER[cyr.toUpperCase()] = lat.charAt(0).toUpperCase() + lat.slice(1);
}

const DIGRAPH_UPPER = { Љ: 'LJ', Њ: 'NJ', Џ: 'DŽ' };

// Quick test used to skip strings that need no work.
const CYRILLIC_RE = /[Ѐ-ӿ]/;

function isUpperLetter(ch) {
  return !!ch && ch !== ch.toLowerCase() && ch === ch.toUpperCase();
}

function isLetter(ch) {
  return !!ch && ch.toLowerCase() !== ch.toUpperCase();
}

export function hasCyrillic(str) {
  return typeof str === 'string' && CYRILLIC_RE.test(str);
}

/**
 * Transliterate a string from Serbian Cyrillic to Serbian Latin.
 * Non-Serbian characters are left untouched.
 */
export function cyrToLat(str) {
  if (!hasCyrillic(str)) return str;
  let out = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (LOWER[ch] !== undefined) {
      out += LOWER[ch];
      continue;
    }
    if (DIGRAPH_UPPER[ch] !== undefined) {
      const next = str[i + 1];
      const prev = str[i - 1];
      // All-caps context: next letter is uppercase, or the word ends here and
      // the previous letter was uppercase ("ЂАЧКИ ЉЉ").
      const allCaps = isUpperLetter(next) || (!isLetter(next) && isUpperLetter(prev));
      out += allCaps ? DIGRAPH_UPPER[ch] : UPPER[ch];
      continue;
    }
    if (UPPER[ch] !== undefined) {
      out += UPPER[ch];
      continue;
    }
    out += ch;
  }
  return out;
}

/**
 * Recursively transliterate every string value of a JSON-like structure
 * (used for JSON-LD on /lat pages). URLs are ASCII and stay unchanged.
 */
export function deepCyrToLat(value) {
  if (typeof value === 'string') return cyrToLat(value);
  if (Array.isArray(value)) return value.map(deepCyrToLat);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = deepCyrToLat(v);
    return out;
  }
  return value;
}

/**
 * ASCII URL slug from any (Cyrillic or Latin) Serbian text:
 * "Припрема за малу матуру — Ђачки курс" -> "priprema-za-malu-maturu-dacki-kurs".
 */
export function slugify(str) {
  return cyrToLat(String(str || ''))
    .replace(/đ/g, 'dj')
    .replace(/Đ/g, 'Dj')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
}
