# Workflow

## Who does what

| Role | Who | When |
|---|---|---|
| Owner (decisions, push, pricing, customers) | Αποστόλης | always |
| `ehds-fhir-dev` | Claude Code agent (`.claude/agents/`) | features, fixes, new explanations |
| `ehds-i18n-reviewer` | Claude Code agent | after new explanations, before release |
| `ehds-release-guard` | Claude Code agent, read-only | before every push/release |
| IG watch | Hermes cron, Mondays 09:00 → Telegram | new HL7 Europe guide versions |
| CI | GitHub Actions (`.github/workflows/ci.yml`) | every push / PR |

## Loop for one change

1. Owner (or Hermes) writes the task in one sentence.
2. `ehds-fhir-dev` implements it test-first, commits locally.
3. If explanations changed → `ehds-i18n-reviewer`.
4. `ehds-release-guard` → must say PASS.
5. Owner says "push" → push → CI green.

Run an agent headless from Hermes:
```bash
cd ~/GitHub/ehds-check
claude -p "Use the ehds-fhir-dev agent: <task>" --permission-mode acceptEdits \
  --disallowedTools "Bash(git push:*)" --output-format json
```

## When a new guide version is published (IG watch alert)

1. Bump the version in `src/igs.js`.
2. `npm run fixtures` (rebuilds examples from the new official package).
3. Regenerate the recorded outcome:
   ```bash
   java -jar ~/.cache/ehds-check/validator_cli.jar examples/lab/*.json -version 4.0.1 \
     -ig hl7.fhir.eu.laboratory#<new> -profile http://hl7.eu/fhir/laboratory/StructureDefinition/Bundle-eu-lab \
     -tx n/a -output test/fixtures/lab-outcome.json
   ```
   then make file paths relative (strip the absolute repo path).
4. `npm test && npm run test:integration`, add explanations for any new `"known": false` errors.
5. Update README table. Release guard. Push.

## Roadmap

| # | Step | Status |
|---|---|---|
| 1 | CLI: lab / hdr / ips, 4 languages, text/json/html/junit | done |
| 2 | GitHub Action + local web UI | done |
| 3 | Explanations for top ~60 validator messages | ~30 done |
| 4 | Native review SK/CS (paid freelancer) | open |
| 5 | Landing page + free download | open |
| 6 | Paid tier: team dashboard, history, CI report hosting (EU), support | open |
| 7 | Outreach: 20 small health-software vendors GR/SK/CZ | open |
