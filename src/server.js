// Local web UI. Binds to 127.0.0.1 only; uploaded documents are written to a
// private temp dir, validated, and deleted. Nothing is sent to the internet.
import { createServer } from 'node:http';
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { FHIR_VERSION, IGS } from './igs.js';
import { LANGS } from './explain.js';
import { validateFiles } from './validator.js';
import { normaliseOutcome } from './parse.js';
import { buildReport, toHtml } from './report.js';

const MAX_BYTES = 10 * 1024 * 1024;
const EXAMPLES = join(fileURLToPath(new URL('..', import.meta.url)), 'examples');
const exampleList = () => {
  try {
    return readdirSync(EXAMPLES).flatMap((d) => readdirSync(join(EXAMPLES, d)).map((f) => `${d}/${f}`));
  } catch {
    return [];
  }
};

const UI = fileURLToPath(new URL('./ui.html', import.meta.url));

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BYTES) {
        reject(new Error('Document too large (max 10 MB)'));
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

export function serve({ port = 8787, host = '127.0.0.1', quiet = false } = {}) {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, `http://${host}`);
    // Block DNS-rebinding and cross-site requests from other web pages.
    const p = server.address().port;
    const okHost = new Set([`${host}:${p}`, `localhost:${p}`]);
    const origin = req.headers.origin;
    if (!okHost.has(req.headers.host) || (origin && !okHost.has(origin.replace(/^https?:\/\//, '')))) {
      res.writeHead(403).end('forbidden');
      return;
    }
    try {
      if (req.method === 'GET' && url.pathname === '/') {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
        return res.end(readFileSync(UI));
      }
      if (req.method === 'GET' && url.pathname === '/api/meta') {
        res.writeHead(200, { 'content-type': 'application/json' });
        return res.end(JSON.stringify({ fhirVersion: FHIR_VERSION, igs: IGS, langs: LANGS, examples: exampleList() }));
      }
      if (req.method === 'POST' && url.pathname === '/render') {
        // Re-renders a report the UI already has (no validation, no document).
        const report = JSON.parse(await readBody(req));
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        return res.end(toHtml(report));
      }
      if (req.method === 'GET' && url.pathname.startsWith('/examples/')) {
        const name = decodeURIComponent(url.pathname.slice('/examples/'.length));
        if (!exampleList().includes(name)) return res.writeHead(404).end('not found');
        res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
        return res.end(readFileSync(join(EXAMPLES, name)));
      }
      if (req.method === 'POST' && url.pathname === '/check') {
        const body = await readBody(req);
        JSON.parse(body); // reject non-JSON early
        const dir = mkdtempSync(join(process.env.TMPDIR || tmpdir(), 'ehds-ui-'));
        try {
          const file = join(dir, 'document.json');
          writeFileSync(file, body);
          const lang = LANGS.includes(url.searchParams.get('lang')) ? url.searchParams.get('lang') : 'en';
          const { ig, outcome, tx, validatorVersion } = await validateFiles([file], { ig: url.searchParams.get('ig') || 'lab' });
          const files = normaliseOutcome(outcome).map((f) => ({ ...f, file: 'document.json' }));
          const report = buildReport({ ig, files, lang, tx, validatorVersion });
          if (url.searchParams.get('format') === 'json') {
            res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
            return res.end(JSON.stringify(report));
          }
          res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
          return res.end(toHtml(report));
        } finally {
          rmSync(dir, { recursive: true, force: true });
        }
      }
      res.writeHead(404).end('not found');
    } catch (err) {
      res.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' }).end(String(err.message));
    }
  });
  return new Promise((resolve) =>
    server.listen(port, host, () => {
      if (!quiet) console.error(`ehds-check UI on http://${host}:${server.address().port} (local only)`);
      resolve(server);
    }),
  );
}
