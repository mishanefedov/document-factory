# PDF export workflow

*How to get a print-ready PDF from an HTML document in this factory.*

---

## Primary workflow: Chrome print-to-PDF (manual)

1. Open the HTML file in Chrome: `file:///.../workspace/results/2026-04-20-onepager-example.html`
2. Cmd+P (Mac) or Ctrl+P (Windows/Linux)
3. In the print dialog:
   - **Destination:** "Save as PDF"
   - **Pages:** "All"
   - **Layout:** Portrait
   - **Paper size:** match the `@page` rule in your `print.css` (A4 or Letter)
   - **Margins:** "Default" (respects `@page` from CSS)
   - **Options → Background graphics:** ✅ **CHECKED** (critical — otherwise filled signal boxes render as white)
   - **Options → Headers and footers:** ❌ unchecked (removes Chrome's URL/timestamp)
4. Click "Save"
5. Save in `workspace/results/` with matching filename (swap `.html` → `.pdf`)

## Quality checks before sending

- [ ] All `{{PLACEHOLDERS}}` resolved (grep the HTML for `{{`)
- [ ] Page breaks at sensible spots (no orphaned headings, split signal boxes, or stranded single lines)
- [ ] Backgrounds rendered (signal boxes have color, not white)
- [ ] No Chrome header/footer (URL / timestamp strip)
- [ ] Fonts loaded correctly (no fallback-to-Times artifacts)
- [ ] Images / SVGs embedded and visible

## Secondary workflow: headless Chrome (automation)

When the user ships 10+ docs a month, manual Cmd+P becomes annoying. Add a script to `workspace/scripts/pdf.sh`:

```bash
#!/bin/bash
# Usage: ./pdf.sh workspace/results/2026-04-20-onepager-example.html
set -euo pipefail
INPUT="$1"
OUTPUT="${INPUT%.html}.pdf"

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

"$CHROME" \
  --headless \
  --disable-gpu \
  --no-pdf-header-footer \
  --print-to-pdf="$OUTPUT" \
  --print-to-pdf-no-header \
  --virtual-time-budget=5000 \
  "file://$(pwd)/$INPUT"

echo "Generated: $OUTPUT"
```

Caveats:

- Older Chrome versions may need `--disable-gpu` or may not support `--no-pdf-header-footer`. Test.
- `file://` paths must be absolute. `pwd` prepend handles that.
- `--virtual-time-budget=5000` gives the page 5 seconds for fonts + any inline JS to settle before capture.
- This script isn't shipped in the public repo — it's a `workspace/` addition. Add it only when the user asks for automation.

## Tertiary: Puppeteer / Playwright

More powerful than headless Chrome directly. Useful when:

- You need per-doc paper-size or margin overrides
- You need to inject custom headers/footers (page numbers)
- You need to wait for specific DOM states before capturing

Don't default to this. It's a dependency. Only add when the manual/headless options don't meet the need.

## Font loading — critical for fidelity

If your `workspace/tokens/brand.css` references fonts via `@import url('https://fonts.googleapis.com/css2?...')` or `<link>` in the template, Chrome needs network access to load them during print.

For fully offline / self-contained exports:

1. Download font files to `workspace/assets/fonts/`
2. Declare `@font-face` in `brand.css` pointing at the local files
3. Test the print output to confirm no fallback-to-Times artifacts

## Inlining CSS before sending

For a self-contained single-file HTML attachment (e.g. emailing raw HTML to someone without the linked CSS files):

1. Agent reads `workspace/tokens/brand.css` + `print.css`
2. Replaces the `<link>` tags in the HTML head with an inline `<style>` block containing the concatenated CSS
3. Writes the inlined version to `workspace/results/{original-filename}-inlined.html`

This is useful for emailing drafts. Final PDF export doesn't need it — Chrome loads linked CSS just fine from `file://`.

## Anti-patterns

- **Don't ship the `.html` file as the primary deliverable.** PDF is the output format. HTML is the source.
- **Don't hand-edit the PDF.** If the PDF needs changes, fix the HTML and regenerate.
- **Don't use online HTML-to-PDF converters** for confidential documents. They upload your content to third-party servers.
- **Don't check "Print backgrounds" and then fail to save the setting.** Chrome remembers it per session; verify every time.
