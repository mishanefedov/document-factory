---
name: cover-letter
version: 1
description: 1-page cover letter or email-cover accompanying another deliverable.
triggers:
  - "cover letter"
  - "cover-letter"
  - "letter"
  - "email cover"
  - "outreach letter"
reads:
  - instructions/00-read-first.md
  - instructions/factory-rules.md
  - instructions/filename-convention.md
  - workspace/BRAND.md
  - workspace/conventions/writing-voice.md
  - workspace/templates/cover-letter.html
writes_to: workspace/results/
mutating: true
---

# Doc type — cover-letter

*Spec for a cover letter or outreach email that accompanies another deliverable.*

---

## Purpose

A cover-letter contextualizes the doc it ships with. Explains who, why, what's attached, and what's expected in response. Either a standalone HTML file (if formal / print-ready) or email copy (if sent digitally).

## Audience

One person. The specific recipient of the accompanying deliverable.

## Length

5–10 sentences for email cover. 1 page for formal print cover-letter. Almost never longer.

## Required sections (in order)

For **email cover** (inline copy):

1. Opening — recipient name, brief context setup
2. What you're sending — name + purpose of each attachment
3. Why you're sending now — what changed, what this enables
4. What you're asking — clear request or nothing asked
5. Closing — signature, next-step

For **print cover-letter** (HTML → PDF):

1. **Header** — sender brand, date, recipient address (if applicable)
2. **Salutation** — "Dear [name]," or equivalent
3. **Opening paragraph** — context + what's enclosed
4. **Middle paragraph** — what you want the reader to notice
5. **Closing paragraph** — request / next-step / gratitude (pick one)
6. **Signature block** — name, title, brand, contact
7. **Footer** — confidentiality if applicable

## Content constraints

- **No marketing prose.** The cover-letter is operational — what / why / what-next. The attached deliverable is where positioning happens.
- **Single ask.** If you have multiple asks, you're sending the wrong format. Send the deliverable + a single-ask cover.
- **Respect `workspace/conventions/writing-voice.md`.**
- **If you're apologizing or explaining a miss**, be concrete about what changed and why. Don't over-hedge.
- **Named recipient.** Cover letters don't go to "To whom it may concern." If you don't know the recipient, you're writing the wrong format.

## Components used

- `workspace/components/headers/{brand}-header.html` (simplified for cover-letter)
- Plain prose (no stat-row, no signal boxes, no blockquote unless quoting the recipient back to themselves)
- `workspace/components/footers/{brand}-footer.html`

## Starter template

`starter-templates/cover-letter.html` — minimal scaffold.

## Build checklist

- [ ] Recipient name is correct (double-check spelling)
- [ ] Date is correct
- [ ] Attached deliverables named specifically (not "the attached documents")
- [ ] Single clear ask, or no ask at all
- [ ] Signature block includes correct title + contact
- [ ] Voice passes `workspace/conventions/writing-voice.md`
- [ ] Filename matches `filename-convention.md`

## Common failures

- **Multi-paragraph context before the attachment is named.** Fix: name the attachments in sentence 1 or 2.
- **Multiple asks buried in the closing.** Fix: one ask. If more are needed, one cover-letter per ask or restructure.
- **Formality mismatch.** Fix: match the register you and the recipient have already established. A first-touch letter is more formal than a 10th follow-up.
- **Boilerplate confidentiality warnings.** Fix: either the content is actually confidential (include) or it isn't (omit).
