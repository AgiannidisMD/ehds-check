#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { IGS } from '../src/igs.js';
import { downloadValidator, findJava, jarPath, validateFiles } from '../src/validator.js';
import { normaliseOutcome } from '../src/parse.js';
import { buildReport, FORMATS } from '../src/report.js';
import { LANGS } from '../src/explain.js';

const HELP = `ehds-check — EHDS / HL7 Europe FHIR conformance checker (local, offline by default)

Usage:
  ehds-check setup                         download the official HL7 FHIR Validator
  ehds-check <files...> [options]          validate documents
  ehds-check serve [--port 8787]           local web UI (127.0.0.1 only)

Options:
  --ig <lab|hdr|ips>        implementation guide (default: lab)
  --lang <en|el|sk|cs>      explanation language (default: en)
  --format <text|json|html|junit>   (default: text)
  --out <file>              write report to file
  --min <error|warning|information>  lowest severity shown (default: warning)
  --tx <url>                opt in to a terminology server (sends codes only). Default: offline
  --verbose                 show validator log
IGs: ${Object.entries(IGS).map(([k, v]) => `${k}=${v.package}#${v.version}`).join(', ')}
Exit code: 0 pass, 1 conformance errors, 2 tool error.`;

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      ig: { type: 'string', default: 'lab' },
      lang: { type: 'string', default: 'en' },
      format: { type: 'string', default: 'text' },
      out: { type: 'string' },
      min: { type: 'string', default: 'warning' },
      tx: { type: 'string', default: 'n/a' },
      port: { type: 'string', default: '8787' },
      verbose: { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
  });
  if (values.help || positionals.length === 0) {
    console.log(HELP);
    return 0;
  }
  if (positionals[0] === 'setup') {
    await downloadValidator();
    console.error(`Java: ${findJava()}`);
    return 0;
  }
  if (positionals[0] === 'serve') {
    const { serve } = await import('../src/server.js');
    await serve({ port: Number(values.port) });
    return null; // keep running
  }
  if (!LANGS.includes(values.lang)) throw new Error(`--lang must be one of ${LANGS.join(', ')}`);
  const fmt = FORMATS[values.format];
  if (!fmt) throw new Error(`--format must be one of ${Object.keys(FORMATS).join(', ')}`);

  const { ig, outcome, tx, validatorVersion } = await validateFiles(positionals, { ig: values.ig, tx: values.tx, verbose: values.verbose, jar: jarPath() });
  const report = buildReport({ ig, files: normaliseOutcome(outcome), lang: values.lang, minSeverity: values.min, tx, validatorVersion });
  const text = fmt(report);
  if (values.out) {
    writeFileSync(values.out, text);
    console.error(`Report written to ${values.out}`);
    if (values.format !== 'text') console.log(FORMATS.text(report));
  } else {
    process.stdout.write(text);
  }
  return report.summary.pass ? 0 : 1;
}

main().then(
  (code) => {
    if (code !== null) process.exitCode = code;
  },
  (err) => {
    console.error(`ehds-check: ${err.message}`);
    process.exitCode = 2;
  },
);
