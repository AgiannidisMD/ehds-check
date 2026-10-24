# ehds-check: rules for agents

Product: EHDS / HL7 Europe FHIR conformance checker with plain-language error explanations (EN, EL, SK, CS).
Owner: STOLOSDIGITAL (stolosofficial s. r. o., Slovakia). Commercial product (free core + paid team/integration tier).

## Hard rules
1. **No real patient data, ever.** Only synthetic examples. Never copy code or data from other products.
2. **Local-first:** the checker must never upload documents anywhere.
3. **Pin IG versions** (hl7.fhir.eu.laboratory 2.1.x, hl7.fhir.eu.hdr 1.0.x, hl7.fhir.uv.ips) and record them in reports.
4. Not a medical device: validate structure/conformance only, never interpret clinical values.
5. AI-assisted development is disclosed in README.
6. Commit locally; push only when the owner asks. Replies to the owner: Greek, short.
