# Data-disclosure guide (META)

*This file teaches users + agents how to author their own `workspace/conventions/data-disclosure.md`. It does not prescribe disclosure rules — those depend on the user's regulatory context and audience norms.*

---

## What `workspace/conventions/data-disclosure.md` is for

User-specific rules about how to handle:

- Sample sizes (when to disclose, when to lead with, when to bury)
- Forward-looking claims (allowed? at what N? with what caveats?)
- Named-entity consent (can we quote a respondent by name? Title only? Anonymized?)
- Methodology transparency (manual vs automated process — how much to reveal)
- Caveats block (mandatory content, when it applies)
- Regulatory / compliance constraints (MNPI, HIPAA, GDPR, whatever the user's context requires)

## Recommended structure

```markdown
# Data disclosure — {{COMPANY_NAME}}

## Sample-size handling

- Minimum publishable N: (e.g. ≥10 for point estimates, ≥3 for descriptive signals)
- Below minimum: disclose as "calibration read" or "preliminary signal," never as a finding
- Never front-load N in hero stat bars — use signal-first stats, disclose N in methodology + caveats
- Rationale: (...why this rule; link to prior incident or council decision)

## Forward-looking claims

- Banned in: advisor decks, one-pagers, cover letters (any artifact to an individual reader)
- Allowed in: Vol. I publication where the reader can verify against public time-series
- N threshold for forward-looking: ≥10 interviews, ≥2 time points, pre-specified reconciliation date
- Rationale: asymmetric downside — if the forward claim misses, brand is permanently tarnished with that reader

## Named-entity consent

- Default attribution: role + geography + tenure only (e.g. "4-year Tier-1 supplier, [region]")
- Company/person name: requires explicit verbal or written consent, logged in (wherever consent is tracked)
- Financial figures: never attribute specific numbers to specific companies in external docs unless the company has published them
- (...)

## Methodology transparency

- Do disclose: instrument design, sample frame, response rate, cohort construction
- Don't disclose: script version history (v1/v2/v3), tech stack, dev process, internal failure modes
- Manual process: one transparent sentence per the 2026-04-15 council decision — subordinate, not centerpiece
- Rationale: buyers want to verify methodology; they don't want dev journal

## Caveats block (mandatory content)

Every calibration-stage research doc includes a Caveats block disclosing:

- [ ] Panel opt-in rate (if applicable)
- [ ] What the dataset is NOT (no forward-looking estimates, no platform-wide generalization, etc.)
- [ ] Single-respondent flags (signals cited by only one respondent, marked for re-testing)
- [ ] Any known skew (geographic, firm-size, seniority)

Positions credibility: a doc that flags its own weaknesses earns more trust than one that doesn't.

## Regulatory context

- (Jurisdictions that apply — e.g. GDPR for EU respondents, CCPA for CA residents)
- (Consent + data-handling requirements)
- (Anything MNPI-adjacent, HIPAA-adjacent, etc.)

## Revision log

- 2026-04-15: signal-first stat bar rule established (council)
- 2026-04-19: N-below-minimum rule added after first advisor deliverable
```

## Authoring checklist

When a user authors this file:

1. **Who regulates your output?** Finance (FCA, SEC, FINMA)? Health (HIPAA)? EU (GDPR)? None? Each implies different disclosure rules.
2. **What happens if a forward-looking claim misses?** If the answer is "we never make forward claims" or "misses don't matter," adjust accordingly. If the answer is "reader permanently loses trust in us," the rule is strict.
3. **Who can you quote by name, and under what conditions?** Default to anonymous; require explicit rule to name.
4. **What's the minimum N for your different artifact types?** A one-pager to a single reader has different tolerance than a publication claiming "80% of X."
5. **When does your process ship as transparent vs. hidden?** Some buyers value manual rigor; others read "manual" as "unscalable." Know your audience.

## How agents apply this file

Every doc build:

1. Load `workspace/conventions/data-disclosure.md` after voice rules
2. Check sample size of any cohort mentioned — is it above the user's minimum for the claims being made?
3. Check for any forward-looking language — is it allowed for this doc type?
4. Check for named attribution — is consent confirmed or is default anonymization applied?
5. Add a Caveats block if the user's rules require one
6. Warn the user before shipping if any rule is at risk

## Anti-patterns

- **Don't write disclosure rules once and forget them.** Revisit after every major audience shift, feedback cycle, or compliance review.
- **Don't copy someone else's compliance rules blindly.** Your regulatory context is yours. Ask a lawyer if the stakes are real.
- **Don't treat "caveats" as boilerplate.** Tailor per doc. A Caveats block that doesn't reflect the actual doc's weaknesses is worse than no Caveats block.
- **Don't confuse voice rules with disclosure rules.** Voice = how we say things. Disclosure = what we reveal. Both matter; distinct concerns.
