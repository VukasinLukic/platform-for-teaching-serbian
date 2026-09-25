/**
 * NBS IPS QR payload builder (Serbian instant payment standard, "IPS Skeniraj").
 *
 * Pure functions only (no DOM, no React) so they can be unit tested with plain node:
 *   node src/pages/payment/ipsQr.test.mjs   (from frontend/)
 *
 * Payload format for a payment slip (K:PR), tags in the order required by the NBS
 * recommendation, separated by "|" with no trailing separator:
 *   K:PR|V:01|C:1|R:<18 digits>|N:<payee>|I:RSD<amount>|P:<payer>|SF:<code>|S:<purpose>|RO:<model+ref>
 */

export const IPS_LIMITS = {
  N: 70, // payee name and address (max 3 lines)
  P: 70, // payer name and address (max 3 lines)
  S: 35, // purpose of payment
  RO: 35, // model (2 digits) + reference
};

/** Remainder of a long digit string divided by 97 (ISO 7064 MOD 97-10 helper). */
export function mod97(digits) {
  let rem = 0;
  for (const ch of String(digits)) {
    rem = (rem * 10 + (ch.charCodeAt(0) - 48)) % 97;
  }
  return rem;
}

/** Serbian account control check: the whole 18-digit number mod 97 must equal 1. */
export function isValidAccountChecksum(account18) {
  return /^\d{18}$/.test(account18) && mod97(account18) === 1;
}

/**
 * Normalizes a Serbian bank account to the 18-digit form:
 * bank code (3) + account number zero-padded to 13 + control number (2).
 * Accepts "170-10094518000-50", "1701009451800050", "170001009451800050".
 * Returns null when the input cannot be an account number.
 */
export function normalizeAccount(input) {
  if (input === null || input === undefined) return null;
  const raw = String(input).trim();
  if (!raw) return null;

  let bank;
  let middle;
  let control;

  const parts = raw.split(/[-\s]+/).filter(Boolean);
  if (parts.length === 3 && parts.every((p) => /^\d+$/.test(p))) {
    [bank, middle, control] = parts;
    if (bank.length !== 3 || control.length !== 2) return null;
  } else {
    const compact = raw.replace(/[-\s]/g, '');
    if (!/^\d+$/.test(compact)) return null;
    if (compact.length < 6 || compact.length > 18) return null;
    bank = compact.slice(0, 3);
    middle = compact.slice(3, -2);
    control = compact.slice(-2);
  }

  if (middle.length === 0 || middle.length > 13) return null;
  return bank + middle.padStart(13, '0') + control;
}

/**
 * Removes characters that would break the payload: the "|" separator and control
 * characters. Line breaks are kept only where allowed (N and P, max 3 lines).
 * Length is counted in characters (Cyrillic letters count as one).
 */
export function sanitizeValue(value, { allowNewlines = false, maxLength } = {}) {
  let text = String(value ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/\|/g, ' ');

  const cleanLine = (line) =>
    // eslint-disable-next-line no-control-regex
    line.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim();

  if (allowNewlines) {
    text = text.split('\n').map(cleanLine).filter(Boolean).slice(0, 3).join('\n');
  } else {
    text = cleanLine(text);
  }

  if (maxLength && [...text].length > maxLength) {
    text = [...text].slice(0, maxLength).join('').trim();
  }
  return text;
}

/** 1500 -> "RSD1500,00", 1234.5 -> "RSD1234,50". Returns null for invalid amounts. */
export function formatIpsAmount(amount, currency = 'RSD') {
  const num = typeof amount === 'string' ? Number(amount.replace(',', '.')) : Number(amount);
  if (!Number.isFinite(num) || num <= 0 || num > 999999999999.99) return null;
  const cents = Math.round(num * 100);
  const whole = Math.floor(cents / 100);
  const dec = String(cents % 100).padStart(2, '0');
  return `${currency}${whole},${dec}`;
}

/** Control digits for a model 97 reference body (98 - (body * 100 mod 97)). */
export function model97ControlDigits(body) {
  return String(98 - mod97(`${body}00`)).padStart(2, '0');
}

/**
 * Builds the RO tag value (model + reference). Model 97 requires valid control
 * digits, other models only allow digits and dashes. Returns '' when there is no reference.
 */
export function buildReference(model, reference) {
  const ref = String(reference ?? '').replace(/\s+/g, '');
  if (!ref) return '';
  const m = String(model ?? '00').padStart(2, '0');
  if (!/^\d{2}$/.test(m)) throw new Error('Invalid reference model');
  if (!/^[0-9-]+$/.test(ref)) throw new Error('Reference may contain only digits and dashes');
  if (m === '97') {
    const digits = ref.replace(/-/g, '');
    if (digits.length < 3 || digits.slice(0, 2) !== model97ControlDigits(digits.slice(2))) {
      throw new Error('Model 97 control digits are invalid');
    }
  }
  const ro = m + ref;
  if (ro.length > IPS_LIMITS.RO) throw new Error('Reference too long');
  return ro;
}

/**
 * Builds the full IPS QR payload string. Throws on invalid mandatory data.
 * @param {object} p
 * @param {string} p.account      payee account in any common notation
 * @param {string} p.payeeName    payee name (optional address lines joined with \n)
 * @param {number} p.amount       amount in RSD
 * @param {string} [p.payerName]  payer name
 * @param {string} [p.paymentCode='289'] SF, 3 digits starting with 1 or 2
 * @param {string} [p.purpose]    S, purpose of payment
 * @param {string} [p.model='00'] reference model
 * @param {string} [p.reference]  reference number (poziv na broj)
 * @returns {string}
 */
export function buildIpsPayload({
  account,
  payeeName,
  amount,
  payerName = '',
  paymentCode = '289',
  purpose = '',
  model = '00',
  reference = '',
}) {
  const r = normalizeAccount(account);
  if (!r) throw new Error('Invalid account number');

  const n = sanitizeValue(payeeName, { allowNewlines: true, maxLength: IPS_LIMITS.N });
  if (!n) throw new Error('Payee name is required');

  const i = formatIpsAmount(amount);
  if (!i) throw new Error('Invalid amount');

  const sf = String(paymentCode);
  if (!/^[12]\d{2}$/.test(sf)) throw new Error('Invalid payment code');

  const out = ['K:PR', 'V:01', 'C:1', `R:${r}`, `N:${n}`, `I:${i}`];

  const p = sanitizeValue(payerName, { allowNewlines: true, maxLength: IPS_LIMITS.P });
  if (p) out.push(`P:${p}`);

  out.push(`SF:${sf}`);

  const s = sanitizeValue(purpose, { maxLength: IPS_LIMITS.S });
  if (s) out.push(`S:${s}`);

  const ro = buildReference(model, reference);
  if (ro) out.push(`RO:${ro}`);

  return out.join('|');
}

/** Formats an 18-digit account for humans: 170-0010094518000-50. */
export function formatAccountDisplay(account18) {
  if (!/^\d{18}$/.test(account18 || '')) return account18 || '';
  return `${account18.slice(0, 3)}-${account18.slice(3, 16)}-${account18.slice(16)}`;
}
