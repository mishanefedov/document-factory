# Print CSS primer

*Practical rules for making HTML documents export cleanly to PDF via Chrome print-to-PDF.*

---

## The two tools

### 1. `@page`

Browser-level rule. Defines the PDF page size and margins.

```css
@page {
  size: A4;        /* or "letter", "legal", specific dimensions like "210mm 297mm" */
  margin: 18mm;    /* top/right/bottom/left all 18mm */
}
```

Variants:

```css
@page {
  size: letter;
  margin: 0.75in 0.5in 0.75in 0.5in;   /* T R B L */
}

@page :first {
  margin-top: 30mm;                    /* larger margin on cover page */
}

@page cover {
  size: A4 portrait;
  margin: 0;
  background: var(--color-accent);     /* full-bleed cover */
}
```

Use `@page` only in `workspace/tokens/print.css` — UNLESS you need per-document running header/footer text (see "Running headers and footers" below), in which case keep the `@page` block inline in the doc's `<style>`.

### 2. `@media print`

CSS rules that only apply during print/PDF rendering. Used to override screen-only styles.

```css
@media print {
  body { padding: 28px 36px; font-size: 12px; }
  h1 { font-size: 22px; }
  .stat .n { font-size: 22px; }
  .signal-box { break-inside: avoid; }
  blockquote { break-inside: avoid; }
  table { break-inside: avoid; }
  .caveats { break-inside: avoid; }
}
```

## Break rules

Four modern properties. Only these three practical ones matter most docs:

```css
break-inside: avoid;      /* don't split this element across pages */
break-before: page;       /* start this element on a new page */
break-after: avoid;       /* keep the next element on the same page */
```

### When to use `break-inside: avoid`

- Signal boxes (callouts, warnings, conclusions)
- Blockquotes with short text
- Tables with <15 rows — larger tables need to wrap; don't force them
- Figure + caption pairs

### When to use `break-before: page`

- Section breaks in case studies / multi-page docs
- Appendix start
- Cover → content transition

### When NOT to fight page breaks

- Long paragraphs — let them flow
- Lists with >5 items — let them wrap
- Full-page tables — forced `break-inside: avoid` on an over-full element silently fails in Chrome and produces weird gaps

## A4 vs Letter

| Format | Dimensions | Margin default | When to use |
|---|---|---|---|
| A4 | 210 × 297 mm | 18mm | EU-originating docs, academic, international |
| Letter | 8.5 × 11 in | 0.75in | US-originating docs, finance firms based in US |

Ask the user. Default to A4 unless the user's audience is US-heavy. The size of the generated PDF is ~40KB larger on A4 due to different default density — negligible.

## Running headers and footers (every-page)

Use `@page` margin boxes for repeating content on every printed page. Standard institutional convention for sell-side / buyer-facing research.

```css
@page {
  size: A4;
  margin: 22mm 18mm 22mm 18mm;   /* top / right / bottom / left */

  @top-center {
    content: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 32 32'>...</svg>") "  Acme, Inc. · PanelName · Week 1";
    font-family: "SF Mono", ui-monospace, monospace;
    font-size: 8px;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: #5a5450;
    vertical-align: middle;
  }

  @bottom-center {
    content: "Acme, Inc. · PanelName · company@example.com · Page " counter(page) " of " counter(pages) " · Prepared YYYY-MM-DD";
    font-family: "SF Mono", ui-monospace, monospace;
    font-size: 8px;
    color: #5a5450;
  }
}
@media print {
  footer { display: none; }   /* hide body <footer> — @page @bottom-center replaces it */
}
```

### Why `@page` margin boxes (not body `<header>` / `<footer>`)

A body `<header>` only appears on page 1 (it's the first inline content). A body `<footer>` only appears on the last page. On a 2-page doc, page 1 ends up with no footer, page 2 with no header. `@page` margin boxes solve this by rendering on **every** printed page.

### Rules that matter

- Keep `@page` **outside** `@media print` — `@page` is a page-context rule, applies to print by definition.
- Icon in the running header: encode SVG as a data URL inside `content: url("...")`. Escape `#` as `%23`, keep attribute quotes consistent (outer `"`, inner `'`).
- Use `@top-center` / `@bottom-center` for consolidated single-line content. Split to `@top-left` + `@top-right` only when you need the left-right layout.
- `@page :first { @top-center { content: none; } }` suppresses the running header on page 1 — useful when page 1 has its own prominent masthead/h1 and you want to avoid visual duplication.
- Increase bottom margin (24mm+) if the footer content looks cramped against the page edge.

### Body `<header>` in a doc that uses `@page` running header

Keep it minimal — just the `<h1>` (big document title). All eyebrow/branding lives in `@page @top-center`. Remove the old inline masthead (logo + eyebrow stacked above h1) — it duplicates what the running header now carries.

### What fails quietly in Chrome

- **Margins: None** in the print dialog collapses `@page` margin boxes.
- **"Headers and footers" checkbox** adds Chrome's own URL/timestamp bar on TOP of yours. Should usually be unchecked. If only Chrome's bar appears and not yours, check @page margin box support in your Chrome version (needs 90+).
- **Paged.js polyfill** IS an option for unreliable cases, but it re-paginates the document in-browser and introduces its own rendering quirks. Pure `@page` margin boxes work in modern Chrome for 99% of cases.

## Chrome print-to-PDF nuances

- **Background graphics:** Chrome defaults to "no background graphics" in the print dialog. User must check the box, or the filled signal-boxes will render as white. Document this in `pdf-export.md`.
- **Headers & footers:** Chrome adds its own URL + timestamp header by default. Disable in the print dialog (unchecked "Headers and footers").
- **Margins:** Chrome's print dialog margin override can conflict with `@page` rules. Document the recommended setting (usually "Default" respects `@page`).
- **Two-up / N-up printing:** Respect `@page` size. Agents should never try to get multiple pages on one sheet.

## Inspecting print output without printing

In Chrome DevTools → More Tools → Rendering → Emulate CSS media type: `print`. This previews how the doc renders with `@media print` rules applied — but page breaks are approximate in Chrome's devtools. For accurate pagination preview, actually run Cmd+P and look at the preview pane.

## Anti-patterns

- **Don't set global `@page { margin: 0 }` to "remove margins."** Your browser will render content with no breathing room against the paper edge, and some printers will clip.
- **Don't use `page-break-*` (legacy).** Use `break-*` (modern). Chrome supports both, but the legacy names are deprecated.
- **Don't use fixed pixel widths for layout.** Print dialog respects `@page` sizing; fixed widths in the body can overflow on smaller paper sizes.
- **Don't assume Chrome renders complex CSS the same in print and screen.** Gradients, filters, backdrop-filter are notoriously flaky in print. Prefer solid backgrounds + simple borders for print-critical blocks.
- **Don't generate a 20-page PDF from HTML without testing pagination.** Run Cmd+P, scroll through the preview, check every page break. Agents: offer this QA step to the user.

## Paged.js (optional future)

Paged.js is a polyfill that renders `@page` rules in-browser for pagination preview without actually printing. Useful for long documents (>5 pages). Not installed by default — add to `workspace/assets/` if you want it. One line: `<script src="paged.polyfill.js"></script>` at the end of `<body>`.

**Warning (learned 2026-04-20):** loading Paged.js from a CDN (`https://unpkg.com/pagedjs/dist/paged.polyfill.js`) can fail silently if the fetch errors or the library throws during pagination. The symptom is a completely blank page. If you need Paged.js, download it locally to `workspace/assets/` and reference via relative path.

Defer Paged.js until you're building a 10+ page document.

## Lessons learned (2026-04-20 converged design)

From a real session of iterating on a sell-side one-pager for an advisor:

1. **Native `@page` margin boxes are the reliable path in modern Chrome.** Don't over-engineer with Paged.js unless you've tested and confirmed native @page fails.
2. **Running header ≠ body `<header>`.** If the user wants "header on every page," they mean @page. Hide or simplify the body `<header>` accordingly.
3. **Chrome print dialog settings are user-side, not document-side.** Document the recommended settings in `pdf-export.md` and remind the user. You cannot force them.
4. **Test pagination BEFORE shipping.** Open Cmd+P and scroll through every page. Look for: content crashing into running header (increase top margin), footer disappearing (check @bottom rules and `footer { display: none }` interaction), page-break-inside: avoid creating weird gaps (loosen if page-1 ends with ~25% empty space).
5. **`@page :first` suppression is useful but subtle.** Use it to hide the running header on page 1 ONLY when page 1 has a prominent inline masthead that would duplicate. If the body header is minimal (just h1), let the running header appear on every page.
6. **Debug mantra:** "If footer is missing in print but visible on screen, check the `footer { display: none }` rule in `@media print` — it's hiding the BODY footer intentionally because @page @bottom replaces it. Verify @page @bottom-* actually renders via Cmd+P preview."
