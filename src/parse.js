// Normalises the validator's OperationOutcome (single or Bundle of them)
// into a flat list of issues per file.
const EXT = 'http://hl7.org/fhir/StructureDefinition/';

function ext(issue, name) {
  const e = (issue.extension || []).find((x) => x.url === EXT + name);
  if (!e) return undefined;
  return e.valueCode ?? e.valueString ?? e.valueInteger ?? e.valueUri;
}

function fileOf(oo) {
  const e = (oo.extension || []).find((x) => /operationoutcome-file$/.test(x.url));
  return e ? e.valueString : undefined;
}

export function normaliseOutcome(outcome) {
  const outcomes =
    outcome.resourceType === 'Bundle'
      ? (outcome.entry || []).map((e) => e.resource)
      : [outcome];
  return outcomes.map((oo) => ({
    file: fileOf(oo) || 'input',
    issues: (oo.issue || [])
      .map((i) => ({
        severity: i.severity,
        code: i.code,
        messageId: ext(i, 'operationoutcome-message-id') || null,
        text: i.details?.text || i.diagnostics || '',
        path: (i.expression && i.expression[0]) || (i.location && i.location[0]) || '',
        line: ext(i, 'operationoutcome-issue-line') ?? null,
        col: ext(i, 'operationoutcome-issue-col') ?? null,
        profile: ext(i, 'operationoutcome-issue-context') || null,
      }))
      // "All OK" placeholder the validator emits for clean files
      .filter((i) => !(i.severity === 'information' && /^All OK$/i.test(i.text))),
  }));
}

export function summarise(files) {
  const count = { fatal: 0, error: 0, warning: 0, information: 0 };
  for (const f of files) for (const i of f.issues) count[i.severity] = (count[i.severity] || 0) + 1;
  return { ...count, pass: count.fatal + count.error === 0 };
}

/** Human-friendly location: strips the validator's /*Type/id*\/ noise. */
export function prettyPath(path) {
  return path
    .replace(/\/\*([A-Za-z]+)\/[^*]*\*\//g, ' ($1)')
    .replace(/\s+\)/g, ')')
    .trim();
}
