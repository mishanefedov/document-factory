# examples (public)

Reference HTMLs that ship with the public repo. These are brand-agnostic or appropriately-redacted examples that demonstrate what good output from this factory looks like.

## What goes here vs workspace/examples/

- **`examples/` (public, this folder):** generic reference docs. Brand values are either `{{PLACEHOLDER}}` or a neutral fake brand ("ACME Research"). Safe to ship publicly.
- **`workspace/examples/` (private):** user's actual shipped docs. Real brand, real content. Gitignored.

## Status

Currently empty — the public repo is in v0.1 preview. Reference examples will be added as real docs ship through the factory and can be generalized.

## Contributing an example

If you've built a doc through this factory and want to contribute a neutralized version as a public reference:

1. Redact any client names, audience identifiers, and proprietary findings
2. Replace with neutral equivalents (ACME Research, "sell-side analyst," "European manufacturing supplier")
3. Verify all `{{PLACEHOLDERS}}` are either resolved with neutral values or explicitly left as placeholders
4. Add a paired `.md` explaining what the example teaches (e.g., "strong Caveats block", "effective cross-respondent matrix", "how to anonymize attribution")
5. Submit a PR
