/**
 * "Алано" AI асистент — Firebase Callable Function.
 *
 * Прима поруку корисника, лично прилагођава контекст (ако је корисник улогован),
 * зове OpenRouter (бесплатни :free модели, са fallback листом), чува лог у Firestore
 * и враћа одговор искључиво на српском/ћирилицом.
 *
 * Дизајн намерно НЕ баца грешке ка клијенту за очекиване ситуације (дневни лимит,
 * per-user throttle, модел недоступан) — увек враћа { ok, reply, reason } тако да
 * виџет на фронтенду увек има лепу, "маскота-гласом" писану поруку да прикаже.
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { checkRateLimit } from './rate-limiter.js';
import { ASSISTANT_KNOWLEDGE_SR } from './assistantKnowledge.js';

// OpenRouter :free модели — редослед fallback покушаја. Ова листа се повремено
// ротира на OpenRouter страни ("free models rotating out with almost no notice"),
// па је треба с времена на време проверити на https://openrouter.ai/models?max_price=0
const OPENROUTER_MODELS = [
  'deepseek/deepseek-v4-flash-0731:free',
  'google/gemma-4-31b-it:free',
  'qwen/qwen3.8-27b:free',
  'nex-agi/nex-n2.5-pro:free',
];

// OpenRouter бесплатни ниво: 50 захтева/дан укупно (дељено на СВЕ посетиоце сајта).
// Остављамо резерву испод тог прага да не бисмо добили сирову 429 грешку усред разговора.
const DAILY_SOFT_LIMIT = 42;

const MAX_MESSAGE_LENGTH = 1000;
const MAX_HISTORY_TURNS = 6;

// Bezbednosna mreža: pošto besplatni modeli povremeno ignorišu instrukciju i odgovore
// latinicom, primenjujemo determinističku srpsku transliteraciju latinica → ćirilica
// na svaki odgovor gde latinica preovlađuje. Digrafi MORAJU ići pre pojedinačnih slova.
const CYRILLIC_DIGRAPHS = [
  ['Nj', 'Њ'], ['NJ', 'Њ'], ['nj', 'њ'],
  ['Lj', 'Љ'], ['LJ', 'Љ'], ['lj', 'љ'],
  ['Dž', 'Џ'], ['DŽ', 'Џ'], ['dž', 'џ'],
];
const CYRILLIC_SINGLE_MAP = {
  a: 'а', b: 'б', v: 'в', g: 'г', d: 'д', đ: 'ђ', e: 'е', ž: 'ж', z: 'з', i: 'и',
  j: 'ј', k: 'к', l: 'л', m: 'м', n: 'н', o: 'о', p: 'п', r: 'р', s: 'с', t: 'т',
  ć: 'ћ', u: 'у', f: 'ф', h: 'х', c: 'ц', č: 'ч', š: 'ш',
};

// Putanje sajta, URL-ovi i email adrese ne smeju se transliterisati (moraju ostati
// klikabilni/tačni: "/contact", "profesorka.marinalukic@gmail.com"...).
const PROTECTED_TOKEN_PATTERN = /(https?:\/\/\S+|\/[a-zA-Z][\w-]*(?:\/[\w-]+)*|[\w.+-]+@[\w-]+\.[\w.-]+)/g;

function transliterateLatinToCyrillic(text) {
  let result = text;
  for (const [latin, cyr] of CYRILLIC_DIGRAPHS) {
    result = result.split(latin).join(cyr);
  }
  let out = '';
  for (const ch of result) {
    const lower = ch.toLowerCase();
    const cyr = CYRILLIC_SINGLE_MAP[lower];
    if (cyr) {
      out += ch === lower ? cyr : cyr.toUpperCase();
    } else {
      out += ch;
    }
  }
  return out;
}

function transliteratePreservingLinks(text) {
  const placeholders = [];
  const masked = text.replace(PROTECTED_TOKEN_PATTERN, (match) => {
    placeholders.push(match);
    return `\u0000${placeholders.length - 1}\u0000`;
  });
  const translit = transliterateLatinToCyrillic(masked);
  return translit.replace(/\u0000(\d+)\u0000/g, (_, idx) => placeholders[Number(idx)]);
}

// Bezbednosna mreža za markdown: modeli povremeno ipak ubace **bold** ili # naslove
// iako smo tražili čist tekst — chat prozor prikazuje samo plain text.
function stripMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/(^|\n)#{1,6}\s*/g, '$1')
    .replace(/(^|\n)[-*]\s+/g, '$1• ');
}

function ensureCyrillic(text) {
  const cyrillicCount = (text.match(/[Ѐ-ӿ]/g) || []).length;
  const latinLetterCount = (text.match(/[A-Za-zČĆĐŠŽčćđšž]/g) || []).length;
  // Ako latinica preovlađuje, tekst transliterišemo u celini. Ako je ćirilica već
  // dominantna, ostavljamo tekst netaknut (čuva ispravno pisane strane reči/URL-ove
  // poput "/contact" ili "PayPal" unutar inače ćiriličke rečenice).
  if (latinLetterCount > 0 && cyrillicCount < latinLetterCount) {
    return transliteratePreservingLinks(text);
  }
  return text;
}

const FALLBACK_MESSAGES = {
  daily_limit: [
    'Данас сам одговорио на толико питања да ми је требао кратак одмор 😌 Врати се сутра, или пиши директно на profesorka.marinalukic@gmail.com — тим одговара у року од 24 часа.',
    'Уф, потрошио сам сву данашњу енергију за одговоре! 💤 Пробај поново сутра, или контактирај тим преко /contact странице — брзо одговарају.',
  ],
  rate_limit: [
    'Успори мало! 😅 Дај ми пар секунди па настави са питањима.',
    'Пуно питања одједном! Предахни тренутак па пробај поново.',
  ],
  model_error: [
    'Тренутно ми нешто фали инспирација 🎭 Пробај поново за минут, или нам пиши на /contact ако хитно треба помоћ.',
    'Изгледа да сам се мало заплео у мислима 🤔 Постави питање поново, или нас контактирај директно преко контакт странице.',
  ],
  not_configured: [
    'Још увек ме подешавају 🛠️ — ускоро ћу моћи да одговарам на питања. За сад, пиши нам директно на /contact.',
  ],
  empty_message: [
    'Реци ми нешто па ћу одговорити 🙂',
  ],
};

function pickFallback(reason) {
  const options = FALLBACK_MESSAGES[reason] || FALLBACK_MESSAGES.model_error;
  return options[Math.floor(Math.random() * options.length)];
}

function buildPersonalizationBlock({ profile, ownedCourses, activeCourses, isLoggedIn }) {
  if (!isLoggedIn) {
    return 'Корисник НИЈЕ улогован (гост посетилац сајта). Ако питање захтева налог (нпр. приступ купљеном курсу), реци му да се региструје на /register.';
  }

  const lines = [];
  const firstName = profile?.ime?.split(' ')?.[0];
  lines.push(`Име корисника: ${firstName || 'непознато'}`);

  if (profile?.razred) {
    lines.push(`Разред: ${profile.razred}. разред основне школе.`);
  } else {
    lines.push(
      'Разред: непознат. Ако разговор природно то дозволи, љубазно питај који је разред ' +
        '(само једном, не инсистирај) да би могао прецизније да предлажеш курс/тест.'
    );
  }

  if (ownedCourses?.length) {
    lines.push(`Курсеви које корисник ВЕЋ ПОСЕДУЈЕ: ${ownedCourses.map((c) => c.title).filter(Boolean).join(', ')}.`);
  } else {
    lines.push('Корисник тренутно нема ниједан купљен курс — можеш му препоручити одговарајући.');
  }

  if (activeCourses?.length) {
    const list = activeCourses
      .map((c) => `${c.title} (${c.type === 'live' ? 'уживо настава' : 'видео курс'})`)
      .join('; ');
    lines.push(`Тренутно доступни курсеви на сајту: ${list}.`);
  }

  return lines.join('\n');
}

async function loadUserContext(uid) {
  const db = getFirestore();
  const [profileSnap, ownedSnap, coursesSnap] = await Promise.all([
    db.collection('users').doc(uid).get(),
    db.collection('user_courses').doc(uid).get(),
    db.collection('courses').where('status', '==', 'active').limit(6).get(),
  ]);

  const profile = profileSnap.exists ? profileSnap.data() : null;

  let ownedCourses = [];
  if (ownedSnap.exists) {
    const courseIds = Object.keys(ownedSnap.data()?.courses || {});
    if (courseIds.length) {
      const courseDocs = await Promise.all(courseIds.map((id) => db.collection('courses').doc(id).get()));
      ownedCourses = courseDocs.filter((d) => d.exists).map((d) => ({ id: d.id, ...d.data() }));
    }
  }

  const activeCourses = coursesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return { profile, ownedCourses, activeCourses };
}

async function callOpenRouter(messages) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return { ok: false, reason: 'not_configured' };
  }

  for (const model of OPENROUTER_MODELS) {
    const controller = new AbortController();
    // Neki besplatni modeli su sporiji ("reasoning" modeli), a fallback lanac ume da
    // proba 2-3 modela u nizu — funkcija ima timeoutSeconds: 90 da sve to stane.
    const timeout = setTimeout(() => controller.abort(), 14000);
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://srpskiusrcu.rs',
          'X-Title': 'Srpski u Srcu - Alano',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.6,
          // Neki besplatni modeli su "reasoning" modeli i troše deo budžeta na interno
          // razmišljanje pre nego što napišu vidljiv odgovor — velikodušan max_tokens
          // sprečava da odgovor bude odsečen usred rečenice (finish_reason: "length").
          max_tokens: 700,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        console.error(`[assistant] OpenRouter model ${model} vratio status ${res.status}`);
        continue;
      }

      const json = await res.json();
      const rawText = json?.choices?.[0]?.message?.content?.trim();
      if (rawText) {
        return { ok: true, reply: ensureCyrillic(stripMarkdown(rawText)), model };
      }
      console.error(`[assistant] OpenRouter model ${model} vratio prazan odgovor`);
    } catch (err) {
      console.error(`[assistant] OpenRouter model ${model} greška:`, err.message);
    } finally {
      clearTimeout(timeout);
    }
  }

  return { ok: false, reason: 'model_error' };
}

async function logInteraction(entry) {
  try {
    const db = getFirestore();
    await db.collection('assistant_logs').add({
      ...entry,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error('[assistant] Greška pri logovanju:', err.message);
  }
}

export const askAsistent = onCall({ timeoutSeconds: 90, memory: '256MiB' }, async (request) => {
  const startedAt = Date.now();
  const { auth, data, rawRequest } = request;

  const userMessage = String(data?.message || '').trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!userMessage) {
    return { ok: false, reason: 'empty_message', reply: pickFallback('empty_message') };
  }

  const history = Array.isArray(data?.history)
    ? data.history.slice(-MAX_HISTORY_TURNS).map((h) => ({
        role: h?.role === 'assistant' ? 'assistant' : 'user',
        content: String(h?.content || '').slice(0, 500),
      }))
    : [];

  // Per-user/IP throttle (odvojeno od globalnog dnevnog budžeta ispod)
  const limiterKey = auth?.uid ? `user_${auth.uid}` : `ip_${rawRequest?.ip || 'unknown'}`;
  try {
    await checkRateLimit(limiterKey, 'assistant_chat', 12, 60);
  } catch (err) {
    if (err instanceof HttpsError && err.code === 'resource-exhausted') {
      return { ok: false, reason: 'rate_limit', reply: pickFallback('rate_limit') };
    }
    // rate limiter's own internal errors already fail-open (return true), so ovo se retko desi
  }

  const db = getFirestore();
  const todayKey = new Date().toISOString().slice(0, 10);
  const dailyCounterRef = db.collection('rate_limits').doc(`openrouter_daily_${todayKey}`);

  const dailySnap = await dailyCounterRef.get();
  const usedToday = dailySnap.exists ? dailySnap.data()?.count || 0 : 0;
  if (usedToday >= DAILY_SOFT_LIMIT) {
    await logInteraction({
      uid: auth?.uid || null,
      message: userMessage,
      ok: false,
      reason: 'daily_limit',
      latencyMs: Date.now() - startedAt,
    });
    return { ok: false, reason: 'daily_limit', reply: pickFallback('daily_limit') };
  }

  // Personalizacija — samo ako je korisnik ulogovan
  let personalization;
  try {
    if (auth?.uid) {
      const ctx = await loadUserContext(auth.uid);
      personalization = buildPersonalizationBlock({ ...ctx, isLoggedIn: true });
    } else {
      personalization = buildPersonalizationBlock({ isLoggedIn: false });
    }
  } catch (err) {
    console.error('[assistant] Greška pri učitavanju korisničkog konteksta:', err.message);
    personalization = buildPersonalizationBlock({ isLoggedIn: !!auth?.uid });
  }

  const systemPrompt = `Ти си Алано — драга, охрабрујућа маскота-помоћник платформе "Српски у Срцу" (сладак пастелни мачкић са дипломском капом).

ПРАВИЛА (обавезно поштуј):
- Одговарај ИСКЉУЧИВО на српском језику, ЋИРИЛИЦОМ. Никад латиницом, никад на другом језику.
- Буди топао, кратак и конкретан (2-5 реченица), понеки емоџи је добродошао, али без претеривања.
- Пиши чист текст, БЕЗ markdown форматирања (без **, без ##, без листа са цртицама) — текст се
  приказује као обичан текст у чет прозору, па markdown знакови остају видљиви и ружни.
- Одговарај САМО на основу базе знања испод. Ако не знаш тачан одговор, искрено то реци и упути
  корисника на /contact или email profesorka.marinalukic@gmail.com. НИКАД не измишљај цене,
  правила, датуме или чињенице које нису у бази знања.
- Ако корисник пита нешто потпуно ван теме (није ни српски језик ни ова платформа), учтиво
  преусмери разговор назад на тему платформе.
- Персонализуј тон према подацима о кориснику испод, али не помињи експлицитно да "читаш податке
  из базе" — понашај се природно, као да га познајеш.

БАЗА ЗНАЊА:
${ASSISTANT_KNOWLEDGE_SR}

ПОДАЦИ О ОВОМ КОРИСНИКУ:
${personalization}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map((h) => ({ role: h.role, content: h.content })),
    { role: 'user', content: userMessage },
  ];

  // Rezervišemo dnevni budžet PRE poziva (optimistički) da ne pređemo prag ni pod
  // konkurentnim zahtevima.
  await dailyCounterRef.set({ count: FieldValue.increment(1), date: todayKey }, { merge: true });

  const result = await callOpenRouter(messages);
  const latencyMs = Date.now() - startedAt;

  await logInteraction({
    uid: auth?.uid || null,
    message: userMessage,
    reply: result.ok ? result.reply : null,
    ok: result.ok,
    reason: result.ok ? null : result.reason,
    model: result.model || null,
    latencyMs,
  });

  if (!result.ok) {
    return { ok: false, reason: result.reason, reply: pickFallback(result.reason) };
  }

  return { ok: true, reply: result.reply, model: result.model };
});
