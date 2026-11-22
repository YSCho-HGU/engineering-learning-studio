# Studio shared asset cleanup — 2026-11-22

## Inventory and decision
The integrated Studio monorepo already serves Signals & Systems from `signals-systems/` and all live course pages import the canonical root `../assets/` palette, language and design files. Five Signals-era files were redundant copies and were removed:

| Retired Signals-local file | Canonical single source | Evidence |
| --- | --- | --- |
| `signals-systems/assets/els-theme-v2.css` | `assets/els-theme-v2.css` | Byte-identical blobs; root referenced by 9 live SS pages |
| `signals-systems/assets/els-theme-v2.js` | `assets/els-theme-v2.js` | Byte-identical blobs; root referenced by 9 live SS pages |
| `signals-systems/assets/design-system.css` | `assets/design-system.css` | Byte-identical blobs; root referenced by 9 live SS pages |
| `signals-systems/assets/design-system.version.json` | `assets/design-system.version.json` | Byte-identical blobs; obsolete mirrored release contract |
| `signals-systems/assets/els-language.js` | `assets/els-language.js` | Inactive earlier copy; canonical module supports additional shared bilingual helpers |

These files are removed from the active monorepo only; Git history still retains them. There is no change to the original standalone Signals repository history.

## Duplicated implementation removed
- `assets/els-theme-v2.js` now owns theme choice labels and order through one `CHOICES` array.
- `assets/els-header-controls.js` reads `ELSTheme.choices` instead of maintaining a second option list.
- The duplicate S&S globe-picker CSS rules were removed from `ss-common-header.css`; `assets/els-header-controls.css` remains authoritative for that presentation.
- S&S theme tests load the canonical root assets after cleanup.
- C Landing visual QA now waits for a card to be attached, not visible, because the Roadmap section intentionally starts collapsed; no course logic changed.

## What is deliberately retained
`signals-systems/assets/ss-site-theme.css`, `ss-readable-themes.css`, `ss6-white-theme-fix.css`, `ss-common-header.css`, chapter-specific math/plot CSS and native chapter JavaScript are not copies of the root theme. They adapt chapter-specific visuals and are retained to avoid changing labs, graph rendering or theme-specific formula styling.

The pre-paint theme bootstrap in entry pages is also retained; removing it risks a flash of incorrect light/dark palette before CSS and scripts initialize.

## Release gates
- `node tests/els-shared-asset-contract.mjs`
- `node signals-systems/tests/theme-contrast-audit.mjs`
- `cd signals-systems && node tests/ss-theme-qa.mjs`
- Existing Studio monorepo migration static + browser workflows, C Landing viewport/theme checks

No `localStorage` keys, learning progress values, editor buffers, quizzes or experiment initialization are changed by this cleanup.
