// Integration test: runs the real HL7 validator. Needs Java 17+ and
// `ehds-check setup`. Enabled with EHDS_INTEGRATION=1 (npm run test:integration).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';

const run = process.env.EHDS_INTEGRATION === '1';
const bin = new URL('../bin/ehds-check.js', import.meta.url).pathname;

function check(files, args = []) {
  try {
    return { code: 0, out: execFileSync('node', [bin, ...files, '--format', 'json', ...args], { encoding: 'utf8', maxBuffer: 64e6 }) };
  } catch (e) {
    return { code: e.status, out: e.stdout };
  }
}

test('lab examples: valid passes, broken fail', { skip: !run, timeout: 300_000 }, () => {
  const dir = 'examples/lab';
  const files = readdirSync(dir).map((f) => `${dir}/${f}`);
  const { code, out } = check(files);
  assert.equal(code, 1);
  const r = JSON.parse(out);
  for (const f of r.files) assert.equal(f.summary.pass, f.file.endsWith('valid.json'), f.file);
});

test('hdr example passes against the HDR guide', { skip: !run, timeout: 300_000 }, () => {
  const { code, out } = check(['examples/hdr/valid.json'], ['--ig', 'hdr']);
  const r = JSON.parse(out);
  const errs = r.files[0].issues.filter((i) => i.severity === 'error');
  assert.equal(code, 0, JSON.stringify(errs.slice(0, 5), null, 1));
});
