# Translation review

All explanations live in `src/explain.js` (one entry per validator message id).

| Language | Written by | Reviewed by | Status |
|---|---|---|---|
| EN | AI | owner | to review |
| EL | AI | owner (native) | to review |
| SK | AI | — needs native FHIR reviewer | not reviewed |
| CS | AI | — needs native FHIR reviewer | not reviewed |

Rules for every explanation:
1. Say *what is wrong* and *what to do*, in one short sentence each.
2. Use the FHIR element name in backticks; do not translate element names.
3. Never comment on clinical values (not a medical device).
4. Placeholders `{name}` must come from the entry's `match` regex.

Adding a message: run the checker with `--format json`, find issues with
`"known": false`, add the `messageId` to `src/explain.js` in all four languages,
then `npm test`.
