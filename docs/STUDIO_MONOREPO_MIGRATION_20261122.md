# Engineering Learning Studio monorepo integration — staged (2026-11-22)

## Scope and release state

- Source: `YSCho-HGU/signals-systems-visual-lab` (150 files).
- Target: `YSCho-HGU/engineering-learning-studio/signals-systems/`.
- Work is isolated on branch `integration/ss-monorepo-20261122`. **Do not delete or redirect the original deployment before browser QA.**
- Preserved: existing Signals chapter sources, datasets, experiment modules, stored progress keys, C source snippets, student draft keys.
- Studio home card now routes to `./signals-systems/` **only after merge**.
- Signals chapters use Studio root `assets/els-language.js`, `els-theme-v2.css`, `els-theme-v2.js`, design and typography assets. Chapter-specific JS/CSS remain local.
- Common immutable localization projector: `shared/els-content-model.js`.
- C course data translation uses shared projector for seven journey chapters; File I/O loads shared module but retains its specialized renderer.
- SS `ss-content-model.js` is preserved for existing labs; a full data-model rewrite is deliberately out of scope for the first migration.

## Language contract

Preference: `localStorage["els-language"]` = `mixed` (default), `en`, or `ko`; no second preference key.
`mixed`: English explanatory prose followed by Korean prose for translated C lesson fields.
`en`: English overlay; `ko`: original Korean source.
Immutable protected data: program code, answers, correct choice indices, numeric controls and learning progress.
The C DOM dictionary fallback and reload-on-switch remain in place, so the migration does **not yet** claim full state-preserving C language changes or complete English coverage across all File I/O widgets.

## QA before merge

1. Run `node tests/studio-monorepo-contract.mjs` and existing quality gates.
2. Verify C & SS home, all SS chapter 1–8 pages, and every C unit route in a local static-server preview of the integration branch.
3. Check 3 modes on Studio Home, C, SS, and all chart annotations and interactive prompts; log untranslated text.
4. Confirm the four navigation arrows, chapter dropdown, section boundaries, math renderer and lab controls.
5. Verify dark, warm and white themes with browser/system dark preference overrides.
6. Test same-origin storage continuity by opening the old Signals site and new `signals-systems/` path within the same browser profile; compare `els-language`, progress and theme keys.
7. Check the browser console and network panel for 404s, runtime exceptions or CSP errors.
8. Merge only after successful preview QA. Keep old deployment accessible and use a path-preserving redirect after merge.

## Caveats

This migration copies source files, **not the Git history from the separate source repository**; the original repository remains the historical archive.
Copied nested `.github/workflows` are archival, not active workflow definitions at the monorepo root.
File parity and static test source presence do not establish interactive/browser acceptance.
