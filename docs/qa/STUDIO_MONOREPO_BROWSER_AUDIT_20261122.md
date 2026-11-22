# C + Signals & Systems browser regression audit (2026-11-22)

## Scope
Branch: `integration/ss-monorepo-20261122`. This is not merged into `main`.

Playwright QA now checks:
- 8 published C units at 390/1280 px, neutral-dark/warm-neutral, plus existing Logic Design gate pilot (32 C viewport/theme combinations).
- Signals & Systems chapters 1–8 navigation and themes at 1440/980 px, plus Learning Map.
- All 62 Signals sections in English mode with console page error tracking.
- Static content and relative dependency paths.

## Verified evidence
- Static contract: PASS (migration-static job in PR workflow).
- Eight C unit/Logic pilot browser matrix: PASS in observed PR run `44989788685`.
- Signals chapter navigation and theme: PASS after selector correction in observed PR run `44989788685`.
- English mode sweep: 9+9+7+8+8+6+7+8 = 62 sections loaded; zero page exceptions. **FAILED language purity:** Korean text remained in all 62 sections prior to the additional label localization changes. Do not report English-only coverage as complete without a clean rerun.
- Original source migration comparison: 150/150 source files present; 252 internal HTML references checked, zero missing.

## Corrections committed
1. Corrected File I/O M1 `fgets` simulation: stops on first newline or 79 bytes, rather than consuming two lines in one read.
2. Updated outdated S&S navigation visual selector to distinguish sidebar collapse button from independent restore button.
3. Updated Learning Map typography audit selector to match current native node structure.
4. Added English/Korean middle-dot and slash text normalization, and a reversible state-preserving text-localization helper for common instructional labels in eight native chapters.
5. PR workflow now runs browser QA as well as static checks, and collects all subtest outcomes without suppressing overall failure.

## Known open issues / release blockers
- English-only language QA still has chapter-specific untranslated instructional prose not covered by the common label normalization. Track all 62 sections and re-run the precise language audit after completing authored translations.
- The new local instructional-label helper needs browser QA on a branch commit containing all eight chapter additions. It must never rewrite editor content, formulas, SVG, graph data or student input.
- C File I/O specialized dynamic pages and language-switch reload behavior remain independent and must be covered by the later shared-content migration.
- Verify progress restoration across old/new paths in the same browser profile and route redirects before merging.

## Release decision
**HOLD** draft PR #1. No production merge, redirect or original-site deletion until browser results and English purity are clean.
