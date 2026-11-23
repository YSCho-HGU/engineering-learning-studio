# Chapter 1–8: shared mathematical rendering audit

The existing Chapter-specific renderers remain authoritative. Chapters 1–4 use the foundations standard; Chapter 5–7 retain their specialized KaTeX transformations and guided derivations; Chapter 8 uses the shared `SSMathCore`. This implementation **does not replace or duplicate those rendering engines**.

All eight chapters load `assets/ss-chapters-math-audit.js`, a passive observer that reports via `window.SSChaptersMathAudit.audit()`, the document attribute `data-ss-chapter-math-audit` and the `ss-chapter-math-audited` event. Its checks cover visible unrendered explicit mathematical sources, KaTeX error nodes and visible raw LaTeX commands in ordinary prose. It skips code/inputs/SVG/MathML/KaTeX descendants to prevent false positives. The observer also responds to dynamic content updates, language changes and theme updates.

The browser regression test `tests/ss-chapters-math-audit.mjs` visits Chapter 1–8, switching between English, Korean and Mixed. The GitHub Actions workflow `ss-chapters-math-audit.yml` runs the test and saves `qa/chapters-math-audit.json` as an artifact. A failed test should be investigated per chapter, without disabling existing dedicated rendering logic.

**Limits:** This is a rendering/visual notation audit, not a mathematical proof or symbol-level accuracy review. Its coverage is the visible initial view per language; for all lesson sections the test must additionally navigate each section and trigger each state before a complete content audit may be claimed.

## Expanded full-section regression (2026-11-23)

`tests/ss-chapters-full-qa.mjs` now navigates every indexed section in Chapters 1–8 via each chapter's native sidebar. For each section it verifies the selected navigation state, checks the passive math audit, tests graph/plot geometry, checks for nonempty instructional content and horizontal document overflow in English/Korean/Mixed modes. It additionally checks all five themes in every section, and first/last sections on a 390px mobile viewport. Machine-readable results are written to `qa/chapters-full-qa.json` and uploaded as a GitHub Actions artifact.

The first full traversal discovered 62 sections and 242 states (three languages per section, five themes per chapter, mobile bookends), with four mobile-width defects; later coverage was extended to 512 states to check themes in every section rather than only the first. Mobile overflow tracing located shared chapter dropdown geometry and mathematical expressions. Changes to shared header and math presentation styles preserve interactive lesson calculation code and provide locally scrollable long equations on small displays.

These tests inspect rendering state and graphical dimensions, not the numerical scientific validity of each plotted waveform. The audit does not exhaustively sweep every possible slider value. Review that separate coverage before making stronger claims.
