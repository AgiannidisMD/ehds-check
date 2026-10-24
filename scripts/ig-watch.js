#!/usr/bin/env node
// Checks packages.fhir.org for IG versions newer than the pinned ones.
// Exit 0 = up to date, 10 = updates available (prints JSON), 2 = error.
import { IGS } from '../src/igs.js';

const cmp = (a, b) => {
  const pa = a.split(/[.-]/).map((x) => (isNaN(x) ? x : Number(x)));
  const pb = b.split(/[.-]/).map((x) => (isNaN(x) ? x : Number(x)));
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    if (pa[i] === pb[i]) continue;
    if (pa[i] === undefined) return 1; // 1.0.0 > 1.0.0-ballot
    if (pb[i] === undefined) return -1;
    return pa[i] > pb[i] ? 1 : -1;
  }
  return 0;
};
const isRelease = (v) => /^\d+\.\d+\.\d+$/.test(v);

try {
  const updates = [];
  for (const [key, ig] of Object.entries(IGS)) {
    const res = await fetch(`https://packages.fhir.org/${ig.package}`);
    if (!res.ok) throw new Error(`${ig.package}: HTTP ${res.status}`);
    const data = await res.json();
    const newer = Object.keys(data.versions || {}).filter((v) => isRelease(v) && cmp(v, ig.version) > 0).sort(cmp);
    if (newer.length) updates.push({ key, package: ig.package, pinned: ig.version, newer });
  }
  console.log(JSON.stringify({ checked: new Date().toISOString(), updates }, null, 2));
  process.exitCode = updates.length ? 10 : 0;
} catch (err) {
  console.error(`ig-watch: ${err.message}`);
  process.exitCode = 2;
}
