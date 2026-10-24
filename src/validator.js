// Runs the official HL7 FHIR Validator (Java) locally and returns the raw
// OperationOutcome bundle. Documents never leave the machine: terminology
// server is disabled by default (-tx n/a) unless the user opts in with --tx.
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, createWriteStream } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import { FHIR_VERSION, getIg } from './igs.js';

// Pinned validator release + checksum. Bump together (see docs/WORKFLOW.md).
export const VALIDATOR_VERSION = '7.0.3';
export const VALIDATOR_SHA256 = '57aa43fb40cec5de41def81c927725fd85908eeb71509b7f9313e04d9b8ec79b';
export const VALIDATOR_URL = `https://github.com/hapifhir/org.hl7.fhir.core/releases/download/${VALIDATOR_VERSION}/validator_cli.jar`;

export function cacheDir() {
  return process.env.EHDS_CHECK_CACHE || join(homedir(), '.cache', 'ehds-check');
}

export function jarPath() {
  return process.env.EHDS_CHECK_VALIDATOR || join(cacheDir(), 'validator_cli.jar');
}

export function findJava() {
  const candidates = [];
  if (process.env.JAVA_HOME) candidates.push(join(process.env.JAVA_HOME, 'bin', 'java'));
  candidates.push(
    '/opt/homebrew/opt/openjdk@21/bin/java',
    '/opt/homebrew/opt/openjdk/bin/java',
    '/usr/local/opt/openjdk@21/bin/java',
    '/usr/bin/java',
  );
  for (const c of candidates) if (existsSync(c)) return c;
  return 'java'; // rely on PATH
}

export async function downloadValidator({ url = VALIDATOR_URL, dest = jarPath(), log = console.error } = {}) {
  mkdirSync(cacheDir(), { recursive: true });
  log(`Downloading HL7 FHIR Validator (~200 MB) to ${dest} ...`);
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`);
  const tmp = `${dest}.part`;
  const out = createWriteStream(tmp);
  const hash = createHash('sha256');
  for await (const chunk of res.body) {
    hash.update(chunk);
    out.write(chunk);
  }
  await new Promise((resolve, reject) => out.end((err) => (err ? reject(err) : resolve())));
  const digest = hash.digest('hex');
  if (url === VALIDATOR_URL && digest !== VALIDATOR_SHA256) {
    rmSync(tmp, { force: true });
    throw new Error(`Checksum mismatch for validator ${VALIDATOR_VERSION}: got ${digest}`);
  }
  renameSync(tmp, dest);
  log(`Done (validator ${VALIDATOR_VERSION}, sha256 ${digest.slice(0, 12)}…).`);
  return dest;
}

function run(cmd, args, { onLine } = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let log = '';
    const collect = (b) => {
      const s = b.toString();
      log += s;
      if (onLine) s.split('\n').filter(Boolean).forEach(onLine);
    };
    p.stdout.on('data', collect);
    p.stderr.on('data', collect);
    p.on('error', reject);
    p.on('close', (code) => resolve({ code, log }));
  });
}

/**
 * Validate one or more files against a pinned IG.
 * @returns {Promise<{ig: object, outcome: object, log: string, tx: string}>}
 */
export async function validateFiles(files, { ig: igKey = 'lab', tx = 'n/a', java = findJava(), jar = jarPath(), verbose = false } = {}) {
  const ig = getIg(igKey);
  if (!existsSync(jar)) {
    throw new Error(`HL7 validator not found at ${jar}. Run: ehds-check setup`);
  }
  for (const f of files) if (!existsSync(f)) throw new Error(`File not found: ${f}`);
  const work = mkdtempSync(join(process.env.TMPDIR || tmpdir(), 'ehds-check-'));
  const out = join(work, 'outcome.json');
  const args = [
    '-Xmx4g', '-jar', jar, ...files,
    '-version', FHIR_VERSION,
    '-ig', ig.ref,
    '-profile', ig.profile,
    '-tx', tx,
    '-output', out,
  ];
  try {
    const { code, log } = await run(java, args, verbose ? { onLine: (l) => console.error(l) } : {});
    if (!existsSync(out)) {
      const tail = log.split('\n').slice(-15).join('\n');
      throw new Error(`Validator produced no output (exit ${code}).\n${tail}`);
    }
    const outcome = JSON.parse(readFileSync(out, 'utf8'));
    const m = log.match(/FHIR Validation tool Version (\S+)/);
    return { ig, outcome, log, tx, validatorVersion: m ? m[1] : null };
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}
