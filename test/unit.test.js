// Unit tests: no Java needed. Uses a recorded validator outcome
// (test/fixtures/lab-outcome.json, generated from examples/lab/*.json).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normaliseOutcome, prettyPath, summarise } from '../src/parse.js';
import { explain, LANGS, CATALOG } from '../src/explain.js';
import { buildReport, toText, toJunit, toHtml } from '../src/report.js';
import { getIg } from '../src/igs.js';

const outcome = JSON.parse(readFileSync(new URL('./fixtures/lab-outcome.json', import.meta.url)));
const files = normaliseOutcome(outcome);
const byName = (n) => files.find((f) => f.file.endsWith(n));
const report = (lang = 'en') => buildReport({ ig: getIg('lab'), files, lang });

test('every example file is in the outcome', () => {
  assert.equal(files.length, 7);
});

test('valid example passes, every broken example fails', () => {
  assert.equal(summarise([byName('valid.json')]).pass, true);
  for (const f of files.filter((x) => /broken-/.test(x.file))) {
    assert.equal(summarise([f]).pass, false, `${f.file} should fail`);
  }
});

const expectations = {
  'broken-bad-datetime.json': 'Type_Specific_Checks_DT_DateTime_Valid',
  'broken-observation-no-status.json': 'Validation_VAL_Profile_Minimum',
  'broken-wrong-bundle-type.json': '_DT_Fixed_Wrong',
  'broken-broken-reference.json': 'Bundle_BUNDLE_Entry_NotFound',
};
for (const [file, id] of Object.entries(expectations)) {
  test(`${file} reports ${id}`, () => {
    assert.ok(byName(file).issues.some((i) => i.messageId === id && i.severity === 'error'));
  });
}

test('every error in the examples has a known explanation in all languages', () => {
  for (const f of files)
    for (const i of f.issues.filter((x) => x.severity === 'error'))
      for (const lang of LANGS) {
        const e = explain(i, lang);
        assert.ok(e.known, `no explanation for ${i.messageId} (${i.text})`);
        assert.doesNotMatch(e.title + e.fix, /\{\w+\}/, `unfilled placeholder in ${i.messageId}/${lang}`);
      }
});

test('catalog: every entry has all languages (or is an alias)', () => {
  for (const [id, e] of Object.entries(CATALOG)) {
    if (e.alias) {
      assert.ok(CATALOG[e.alias], `${id} aliases missing ${e.alias}`);
      continue;
    }
    for (const lang of LANGS) assert.ok(e[lang]?.t && e[lang]?.f, `${id} missing ${lang}`);
  }
});

test('explanations extract values from the message', () => {
  const i = byName('broken-bad-datetime.json').issues.find((x) => x.messageId === 'Type_Specific_Checks_DT_DateTime_Valid');
  assert.match(explain(i, 'el').title, /24\/10\/2026 09:30/);
});

test('unknown message ids fall back to a generic explanation', () => {
  const e = explain({ messageId: 'NOPE', text: 'x' }, 'sk');
  assert.equal(e.known, false);
});

test('prettyPath strips resource ids', () => {
  assert.equal(prettyPath('Bundle.entry[0].resource/*Composition/abc-1*/.date'), 'Bundle.entry[0].resource (Composition).date');
});

test('report records pinned IG and offline mode', () => {
  const r = report();
  assert.equal(r.ig.version, '2.1.0');
  assert.equal(r.terminology, 'offline');
  assert.equal(r.summary.pass, false);
});

test('report de-duplicates identical issues', () => {
  for (const f of report().files) {
    const keys = f.issues.map((i) => `${i.severity}|${i.messageId}|${i.where}|${i.title}`);
    assert.equal(new Set(keys).size, keys.length);
  }
});

test('renderers produce output', () => {
  const r = report('el');
  assert.match(toText(r, { colors: false }), /ΑΠΟΤΥΓΧΑΝΕΙ/);
  assert.match(toJunit(r), /<testsuite name="ehds-check" tests="7" failures="6">/);
  assert.match(toHtml(r), /Not a medical device/);
});

test('html escapes document content', () => {
  const r = buildReport({ ig: getIg('lab'), files: [{ file: '<x>', issues: [{ severity: 'error', messageId: null, text: '<script>', path: '' }] }] });
  assert.doesNotMatch(toHtml(r), /<script>/);
});

test('web UI binds to 127.0.0.1 and rejects cross-site / rebinding requests', async () => {
  const { serve } = await import('../src/server.js');
  const server = await serve({ port: 0, quiet: true });
  const { address, port } = server.address();
  const base = `http://127.0.0.1:${port}`;
  try {
    assert.equal(address, '127.0.0.1');
    assert.equal((await fetch(`${base}/`)).status, 200);
    assert.equal((await fetch(`${base}/check`, { method: 'POST', body: '{}', headers: { origin: 'https://evil.example' } })).status, 403);
    // fetch() cannot override Host, so use node:http for the DNS-rebinding case
    const { request } = await import('node:http');
    const status = await new Promise((resolve, reject) =>
      request({ host: '127.0.0.1', port, path: '/', headers: { host: 'evil.example' } }, (r) => resolve(r.statusCode)).on('error', reject).end(),
    );
    assert.equal(status, 403);
  } finally {
    server.close();
  }
});
