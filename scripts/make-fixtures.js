#!/usr/bin/env node
// Builds examples/ from the official, CC0-licensed HL7 Europe IG examples.
// Person names/identifiers are overwritten with obviously synthetic values,
// then deliberate faults are injected to create "broken" fixtures.
// Usage: node scripts/make-fixtures.js
import { mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { IGS } from '../src/igs.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const SOURCES = {
  lab: 'examples/Bundle-SimpleChemistryResultReport.json',
  hdr: 'examples/Bundle-HDR-Luigi-De-Luca-Example.json',
};

async function fetchPackage(ig) {
  const res = await fetch(`https://packages.fhir.org/${ig.package}/${ig.version}`);
  if (!res.ok) throw new Error(`${ig.package}: HTTP ${res.status}`);
  const dir = mkdtempSync(join(process.env.TMPDIR || tmpdir(), 'ehds-pkg-'));
  const tgz = join(dir, 'p.tgz');
  writeFileSync(tgz, Buffer.from(await res.arrayBuffer()));
  execFileSync('tar', ['xzf', tgz, '-C', dir]);
  return dir;
}

const PERSON_TYPES = new Set(['Patient', 'Practitioner', 'RelatedPerson']);
const SYNTH_NAME = [{ text: 'Synthetic Test', family: 'Test', given: ['Synthetic'] }];
const SYNTH_DIV = '<div xmlns="http://www.w3.org/1999/xhtml"><p>Synthetic example derived from the official HL7 Europe IG example (CC0).</p></div>';
// Italian codice fiscale and similar person codes embedded in identifiers
const PERSON_CODE = /[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]/g;

const isHumanName = (v) => Array.isArray(v) && v.length > 0 && v.every((n) => n && typeof n === 'object' && ('family' in n || 'given' in n || 'text' in n));

// Walks the whole bundle: narratives, names, telecom, addresses of people,
// reference displays and embedded person codes are all replaced.
function scrub(node, ctx = {}) {
  if (Array.isArray(node)) return node.forEach((x) => scrub(x, ctx));
  if (!node || typeof node !== 'object') return;
  const type = node.resourceType || ctx.type;
  const person = PERSON_TYPES.has(type) || ctx.contact;
  if (node.text && typeof node.text === 'object' && node.text.div) node.text = { status: 'generated', div: SYNTH_DIV };
  if (person && isHumanName(node.name)) node.name = SYNTH_NAME;
  else if (person && isHumanName([node.name])) node.name = SYNTH_NAME[0]; // Patient.contact.name is a single HumanName
  if (Array.isArray(node.telecom)) node.telecom = node.telecom.map((t, n) => ({ system: t.system || 'phone', value: t.system === 'email' ? `synthetic${n + 1}@example.org` : '+421000000000', ...(t.use ? { use: t.use } : {}) }));
  if (person && node.address) node.address = Array.isArray(node.address) ? [{ city: 'Testville', country: 'SK' }] : { city: 'Testville', country: 'SK' };
  const displayOnly = Object.keys(node).length === 1 && typeof node.display === 'string'; // Reference with display only
  const isRef = displayOnly || typeof node.reference === 'string' || (node.identifier && !Array.isArray(node.identifier) && typeof node.identifier === 'object');
  if (isRef && typeof node.display === 'string') {
    node.display = 'Synthetic Test';
    if (node.identifier && !Array.isArray(node.identifier) && node.identifier.value) node.identifier = { ...node.identifier, value: 'SYNTH-REF' };
  }
  if (PERSON_TYPES.has(node.resourceType) && Array.isArray(node.identifier)) {
    node.identifier = node.identifier.map((id, n) => ({ ...id, value: `SYNTH-${node.resourceType.toUpperCase()}-${n + 1}` }));
  }
  for (const [k, v] of Object.entries(node)) {
    if (typeof v === 'string') node[k] = v.replace(PERSON_CODE, 'SYNTHX00A00A000X');
    else scrub(v, { type, contact: ctx.contact || k === 'contact' });
  }
}

function anonymise(bundle) {
  scrub(bundle);
  return bundle;
}

const clone = (x) => JSON.parse(JSON.stringify(x));
const firstOf = (b, type) => b.entry.find((e) => e.resource.resourceType === type)?.resource;

const BREAKS = {
  'missing-timestamp': (b) => { delete b.timestamp; },
  'wrong-bundle-type': (b) => { b.type = 'collection'; },
  'observation-no-status': (b) => { delete firstOf(b, 'Observation').status; },
  'bad-datetime': (b) => { firstOf(b, 'Composition').date = '24/10/2026 09:30'; },
  'broken-reference': (b) => { firstOf(b, 'Composition').subject = { reference: 'urn:uuid:00000000-0000-0000-0000-000000000000' }; },
  'unknown-field': (b) => { firstOf(b, 'Composition').colour = 'blue'; },
};

const write = (rel, obj) => {
  const p = join(root, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(obj, null, 2) + '\n');
  console.log('wrote', rel);
};

for (const [key, src] of Object.entries(SOURCES)) {
  const ig = IGS[key];
  const dir = await fetchPackage(ig);
  try {
    const valid = anonymise(JSON.parse(readFileSync(join(dir, 'package', src), 'utf8')));
    valid.id = `${key}-synthetic-example`;
    write(`examples/${key}/valid.json`, valid);
    if (key === 'lab') {
      for (const [name, fn] of Object.entries(BREAKS)) {
        const b = clone(valid);
        fn(b);
        write(`examples/${key}/broken-${name}.json`, b);
      }
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
