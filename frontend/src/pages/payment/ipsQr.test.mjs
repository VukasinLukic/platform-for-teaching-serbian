// Plain node test for the IPS QR payload builder (no test framework needed).
// Run from frontend/:  node src/pages/payment/ipsQr.test.mjs
import assert from 'node:assert/strict';
import {
  buildIpsPayload,
  normalizeAccount,
  isValidAccountChecksum,
  formatIpsAmount,
  sanitizeValue,
  buildReference,
  model97ControlDigits,
  formatAccountDisplay,
  IPS_LIMITS,
} from './ipsQr.js';

let passed = 0;
const test = (name, fn) => {
  fn();
  passed += 1;
  console.log(`ok - ${name}`);
};

test('normalizes 16-digit account to 18 digits with valid checksum', () => {
  const acc = normalizeAccount('1701009451800050');
  assert.equal(acc, '170001009451800050');
  assert.equal(acc.length, 18);
  assert.ok(isValidAccountChecksum(acc));
});

test('normalizes dashed and already-normalized accounts', () => {
  assert.equal(normalizeAccount('170-10094518000-50'), '170001009451800050');
  assert.equal(normalizeAccount('170-0010094518000-50'), '170001009451800050');
  assert.equal(normalizeAccount('170001009451800050'), '170001009451800050');
  assert.equal(normalizeAccount('265-1234-88'), '265000000000123488');
});

test('rejects invalid accounts', () => {
  assert.equal(normalizeAccount(''), null);
  assert.equal(normalizeAccount('abc'), null);
  assert.equal(normalizeAccount('17-12345-50'), null);
  assert.equal(normalizeAccount('1234567890123456789'), null);
  assert.equal(isValidAccountChecksum('170001009451800051'), false);
});

test('formats amounts with comma decimals', () => {
  assert.equal(formatIpsAmount(1500), 'RSD1500,00');
  assert.equal(formatIpsAmount(1234.5), 'RSD1234,50');
  assert.equal(formatIpsAmount('99,99'), 'RSD99,99');
  assert.equal(formatIpsAmount(0.1 + 0.2), 'RSD0,30');
  assert.equal(formatIpsAmount(0), null);
  assert.equal(formatIpsAmount(-5), null);
  assert.equal(formatIpsAmount('x'), null);
});

test('sanitizes separators, control chars and enforces length limits', () => {
  assert.equal(sanitizeValue('A|B'), 'A B');
  assert.equal(sanitizeValue('a\tb\nc'), 'a b c');
  assert.equal(sanitizeValue('line1\nline2\nline3\nline4', { allowNewlines: true }), 'line1\nline2\nline3');
  const long = 'Ш'.repeat(100);
  assert.equal([...sanitizeValue(long, { maxLength: 35 })].length, 35);
});

test('builds references for model 00 and validates model 97', () => {
  assert.equal(buildReference('00', '0100'), '000100');
  assert.equal(buildReference('97', ''), '');
  const body = '0100';
  const ref97 = model97ControlDigits(body) + body;
  assert.equal(buildReference('97', ref97), `97${ref97}`);
  assert.throws(() => buildReference('97', '0100'));
  assert.throws(() => buildReference('00', '01|00'));
  assert.throws(() => buildReference('00', '1'.repeat(40)));
});

test('builds a full payload in NBS order with no trailing separator', () => {
  const payload = buildIpsPayload({
    account: '1701009451800050',
    payeeName: 'Marina Lukic',
    amount: 1500,
    payerName: 'Петар Петровић',
    paymentCode: '289',
    purpose: 'Курс српског језика',
    model: '00',
    reference: '0100',
  });
  assert.equal(
    payload,
    'K:PR|V:01|C:1|R:170001009451800050|N:Marina Lukic|I:RSD1500,00|P:Петар Петровић|SF:289|S:Курс српског језика|RO:000100'
  );
  assert.ok(!payload.endsWith('|'));
});

test('no "|" leaks from values and limits hold', () => {
  const payload = buildIpsPayload({
    account: '170-10094518000-50',
    payeeName: 'Ime|Prezime\nAdresa 1',
    amount: 2500,
    payerName: 'X|Y',
    purpose: 'Online nastava | paket sa veoma dugackim nazivom koji prelazi limit',
    reference: '0101',
  });
  const fields = payload.split('|');
  const tags = fields.map((f) => f.slice(0, f.indexOf(':')));
  assert.deepEqual(tags, ['K', 'V', 'C', 'R', 'N', 'I', 'P', 'SF', 'S', 'RO']);
  const get = (t) => fields.find((f) => f.startsWith(`${t}:`)).slice(t.length + 1);
  assert.equal(get('N'), 'Ime Prezime\nAdresa 1');
  assert.equal(get('P'), 'X Y');
  assert.ok([...get('S')].length <= IPS_LIMITS.S);
  assert.ok([...get('N')].length <= IPS_LIMITS.N);
});

test('optional P, S and RO are omitted when empty', () => {
  const payload = buildIpsPayload({ account: '1701009451800050', payeeName: 'M', amount: 10 });
  assert.equal(payload, 'K:PR|V:01|C:1|R:170001009451800050|N:M|I:RSD10,00|SF:289');
});

test('throws on invalid mandatory data', () => {
  assert.throws(() => buildIpsPayload({ account: 'x', payeeName: 'M', amount: 10 }));
  assert.throws(() => buildIpsPayload({ account: '1701009451800050', payeeName: '', amount: 10 }));
  assert.throws(() => buildIpsPayload({ account: '1701009451800050', payeeName: 'M', amount: 0 }));
  assert.throws(() => buildIpsPayload({ account: '1701009451800050', payeeName: 'M', amount: 1, paymentCode: '389' }));
});

test('formats account for display', () => {
  assert.equal(formatAccountDisplay('170001009451800050'), '170-0010094518000-50');
});

console.log(`\n${passed} tests passed`);
