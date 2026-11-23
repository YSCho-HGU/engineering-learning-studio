# Chapter 1–8: shared mathematical rendering audit

The existing Chapter-specific renderers remain authoritative. Chapters 1–4 use the foundations standard; Chapter 5–7 retain their specialized KaTeX transformations and guided derivations; Chapter 8 uses the shared `SSMathCore`. This implementation **does not replace or duplicate those rendering engines**.

All eight chapters load `assets/ss-chapters-math-audit.js`, a passive observer that reports via `window.SSChaptersMathAudit.audit()`, the document attribute `data-ss-chapter-math-audit` and the `ss-chapter-math-audited` event. Its checks cover visible unrendered explicit mathematical sources, KaTeX error nodes and visible raw LaTeX commands in ordinary prose. It skips code/inputs/SVG/MathML/KaTeX descendants to prevent false positives. The observer also responds to dynamic content updates, language changes and theme updates.

The browser regression test `tests/ss-chapters-math-audit.mjs` visits Chapter 1–8, switching between English, Korean and Mixed. The GitHub Actions workflow `ss-chapters-math-audit.yml` runs the test and saves `qa/chapters-math-audit.json` as an artifact. A failed test should be investigated per chapter, without disabling existing dedicated rendering logic.

**Limits:** This is a rendering/visual notation audit, not a mathematical proof or symbol-level accuracy review. Its coverage is the visible initial view per language; for all lesson sections the test must additionally navigate each section and trigger each state before a complete content audit may be claimed.
