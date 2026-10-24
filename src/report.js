// Turns normalised validator results into text / JSON / HTML / JUnit reports.
import { explain } from './explain.js';
import { prettyPath, summarise } from './parse.js';
import { FHIR_VERSION } from './igs.js';

const SEV_ORDER = { fatal: 0, error: 1, warning: 2, information: 3 };
const L = {
  en: { pass: 'PASS', fail: 'FAIL', at: 'at', line: 'line', details: 'Validator', errors: 'errors', warnings: 'warnings', file: 'File' },
  el: { pass: 'ΠΕΡΝΑΕΙ', fail: 'ΑΠΟΤΥΓΧΑΝΕΙ', at: 'στο', line: 'γραμμή', details: 'Validator', errors: 'σφάλματα', warnings: 'προειδοποιήσεις', file: 'Αρχείο' },
  sk: { pass: 'VYHOVUJE', fail: 'NEVYHOVUJE', at: 'v', line: 'riadok', details: 'Validátor', errors: 'chyby', warnings: 'varovania', file: 'Súbor' },
  cs: { pass: 'VYHOVUJE', fail: 'NEVYHOVUJE', at: 'v', line: 'řádek', details: 'Validátor', errors: 'chyby', warnings: 'varování', file: 'Soubor' },
};

// Errors that are usually a consequence of another error in the same file.
const CASCADE = new Set(['Reference_REF_CantMatchChoice', 'Validation_VAL_Profile_NoMatch']);
// Not problems in the document: checks that need a terminology server (skipped offline).
const OFFLINE = new Set(['UNKNOWN_CODESYSTEM', 'UNKNOWN_CODESYSTEM_VERSION', 'Error_validating_code_running_without_terminology_services', 'Terminology_TX_System_NotKnown', 'TERMINOLOGY_TX_SYSTEM_NO_CODE']);

export function buildReport({ ig, files, lang = 'en', minSeverity = 'warning', tx = 'n/a', validatorVersion = null }) {
  const limit = SEV_ORDER[minSeverity] ?? 2;
  const out = files.map((f) => {
    const seen = new Set();
    const issues = f.issues
      .filter((i) => (SEV_ORDER[i.severity] ?? 3) <= limit)
      .map((i) => ({ ...i, where: prettyPath(i.path), cascade: CASCADE.has(i.messageId), offline: OFFLINE.has(i.messageId), ...explain(i, lang) }))
      .filter((i) => {
        const k = `${i.severity}|${i.offline ? 'offline' : i.messageId}|${i.where}|${i.title}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      })
      .sort(
        (a, b) =>
          SEV_ORDER[a.severity] - SEV_ORDER[b.severity] ||
          Number(a.offline) - Number(b.offline) ||
          Number(a.cascade) - Number(b.cascade) ||
          (a.line ?? 0) - (b.line ?? 0),
      );
    return { file: f.file, summary: summarise([{ issues }]), issues };
  });
  return {
    tool: 'ehds-check',
    generated: new Date().toISOString(),
    lang,
    fhirVersion: FHIR_VERSION,
    ig: { key: ig.key, package: ig.package, version: ig.version, profile: ig.profile },
    terminology: tx === 'n/a' ? 'offline' : tx,
    validatorVersion,
    summary: summarise(out),
    files: out,
  };
}

const color = (on) => (c, s) => (on ? `\x1b[${c}m${s}\x1b[0m` : s);

export function toText(r, { colors = process.stdout.isTTY } = {}) {
  const c = color(colors);
  const l = L[r.lang] || L.en;
  const lines = [];
  lines.push(c(1, `ehds-check · ${r.ig.package}#${r.ig.version} · FHIR ${r.fhirVersion} · validator ${r.validatorVersion || '?'} · tx ${r.terminology}`));
  for (const f of r.files) {
    lines.push('');
    const s = f.summary;
    lines.push(`${s.pass ? c(32, '✓ ' + l.pass) : c(31, '✗ ' + l.fail)}  ${f.file}  (${s.error + s.fatal} ${l.errors}, ${s.warning} ${l.warnings})`);
    for (const i of f.issues) {
      const tag = i.severity === 'error' || i.severity === 'fatal' ? c(31, 'ERROR') : i.severity === 'warning' ? c(33, 'WARN ') : c(36, 'INFO ');
      const pos = i.line ? ` ${l.line} ${i.line}` : '';
      lines.push(`  ${tag} ${c(1, i.title)}`);
      if (i.where) lines.push(`        ${l.at} ${i.where}${pos}`);
      lines.push(`        → ${i.fix}`);
      lines.push(c(2, `        ${l.details}: [${i.messageId || '-'}] ${i.text}`));
    }
  }
  lines.push('');
  return lines.join('\n');
}

export function toJson(r) {
  return JSON.stringify(r, null, 2);
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

export function toHtml(r) {
  const l = L[r.lang] || L.en;
  const files = r.files
    .map((f) => {
      const items = f.issues
        .map(
          (i) => `<li class="${esc(i.severity)}"><b>${esc(i.title)}</b>
<div class="where">${esc(i.where)}${i.line ? ` · ${l.line} ${i.line}` : ''}</div>
<div class="fix">→ ${esc(i.fix)}</div>
<details><summary>${l.details}</summary><code>[${esc(i.messageId)}] ${esc(i.text)}</code></details></li>`,
        )
        .join('\n');
      return `<section><h2 class="${f.summary.pass ? 'ok' : 'bad'}">${f.summary.pass ? '✓ ' + l.pass : '✗ ' + l.fail} · ${esc(f.file)}</h2><ul>${items}</ul></section>`;
    })
    .join('\n');
  return `<!doctype html><html lang="${esc(r.lang)}"><meta charset="utf-8"><title>ehds-check report</title>
<style>body{font:15px/1.5 system-ui;max-width:900px;margin:2rem auto;padding:0 1rem}h2.ok{color:#137333}h2.bad{color:#b3261e}
li{margin:.6rem 0;list-style:none;border-left:4px solid #999;padding-left:.7rem}li.error,li.fatal{border-color:#b3261e}li.warning{border-color:#e37400}
.where{color:#555;font-size:13px}.fix{margin:.2rem 0}code{font-size:12px;white-space:pre-wrap}.meta{color:#555;font-size:13px}</style>
<h1>ehds-check</h1><p class="meta">${esc(r.ig.package)}#${esc(r.ig.version)} · FHIR ${esc(r.fhirVersion)} · terminology: ${esc(r.terminology)} · ${esc(r.generated)}</p>
${files}
<p class="meta">Structural conformance check only. Not a medical device; it does not assess clinical content.</p></html>`;
}

export function toJunit(r) {
  const cases = r.files
    .map((f) => {
      const errs = f.issues.filter((i) => i.severity === 'error' || i.severity === 'fatal');
      const body = errs.map((i) => `<failure message="${esc(i.title)}">${esc(`${i.where}\n${i.fix}\n[${i.messageId}] ${i.text}`)}</failure>`).join('');
      return `<testcase classname="${esc(r.ig.package)}" name="${esc(f.file)}">${body}</testcase>`;
    })
    .join('');
  const failures = r.files.filter((f) => !f.summary.pass).length;
  return `<?xml version="1.0" encoding="UTF-8"?>\n<testsuite name="ehds-check" tests="${r.files.length}" failures="${failures}">${cases}</testsuite>\n`;
}

export const FORMATS = { text: toText, json: toJson, html: toHtml, junit: toJunit };
