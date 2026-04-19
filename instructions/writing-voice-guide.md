# Writing-voice guide (META)

*This file teaches users + agents how to author their own `workspace/conventions/writing-voice.md`. It does not prescribe voice rules.*

---

## What `workspace/conventions/writing-voice.md` is for

The user's voice rules. What words to avoid. What tone to hit. Hedging rules. Audience-aware framings. Whatever the user has learned from shipped docs + feedback that they want future docs to respect.

This file is the **user's** long-term writing memory. It evolves as they learn what works.

## Recommended structure

```markdown
# Writing voice — {{COMPANY_NAME}}

## Banned language

- "information asymmetry" — triggers MNPI-adjacent read with finance buyers
- "synergies" — generic buzzword, eroded meaning
- "leverage" as verb — overused, costs credibility
- (...with one-line rationale each)

## Preferred framings

- Benchmarking reciprocity over "information asymmetry" — same concept, no regulatory trigger
- "Aggregate operational-sentiment signal" for the data product
- (...)

## Tone register

- Direct, short sentences. Minimum hedge.
- No corporate softening ("we believe," "in our view"). Say the thing.
- Quote specifics: hours, dollars, dates. No "many", "significant," "various".
- No bullet-list sprawl. Bullets are for scannable items, not prose.

## Audience-specific framings

### For {{AUDIENCE_1}}

- (Specific rules that only apply to this audience)

### For {{AUDIENCE_2}}

- ...

## Structural rules

- Front-load conclusions. Readers decide to continue in the first sentence.
- Active voice. "We found X" not "X was found."
- Number specificity: "47 files" beats "a lot of files". "Tuesday 2026-04-14" beats "soon".
- No apologies in the opening.

## Words I actively favor

- (Optional — words that feel "on-brand")

## Revision log

- 2026-04-18: added "information asymmetry" to banned list after council decision
- 2026-04-19: added signal-first stat-bar rule
- (...)
```

## Authoring checklist

When a user is authoring this file the first time, ask them:

1. **Three words or phrases you never want in your docs — and why.** Rationale matters; edge cases get judged on rationale.
2. **Three words or phrases you always want to hit.** The voice is as much what's present as what's absent.
3. **Tone register: formal / casual / technical / editorial / terse?** One adjective.
4. **Hedging: heavy / medium / minimal?** Finance and academic often want minimal; legal wants heavy.
5. **Active or passive voice preference?** Active default, passive only for specific patterns.
6. **Length discipline:** one-sentence paragraphs OK? Multi-sentence paragraphs required? Bullet point tolerance?
7. **Audience archetypes:** who reads your docs? For each: attention span, prior knowledge, what they're looking for in the first 5 seconds.

## How agents apply this file

Every doc build, the agent:

1. Loads `workspace/conventions/writing-voice.md` after the doc-type instruction file
2. Checks every paragraph before shipping against banned-language list
3. Applies tone register and hedging rules to fresh-written content
4. If the doc is for a specific audience listed, applies those audience-specific rules too

## Growing this file

Every shipped doc is a test. When feedback comes in — "this read too corporate," "this was too terse," "this sentence tripped my compliance lawyer" — distill the feedback into a rule here. Add to the revision log with date + rationale.

When rules contradict over time (newer rule + older rule disagree), resolve by adding the newer rule and striking the old one with a note explaining why it changed.

## Anti-patterns

- **Don't write banned-word lists without rationale.** The list becomes opaque in 6 months. Every rule has a reason.
- **Don't list 50 banned words.** If the list is huge, the signal is weak. Keep it sharp: 5–15 items, curated.
- **Don't copy voice rules from someone else's brand.** The rules that work for you come from your shipped docs + your audience's feedback. Don't borrow wholesale.
- **Don't forget to update this file after every major piece of feedback.** Otherwise the lesson dies.
