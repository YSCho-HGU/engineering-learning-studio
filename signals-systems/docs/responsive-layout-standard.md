# Signals & Systems responsive layout contract

## Target viewport classes

| Environment | Regression viewport | Layout priority |
|---|---:|---|
| Lecture projector / wide display | 1920 × 1080 | Spacious controls and two plots on one row wherever feasible |
| Typical notebook / desktop | 1366 × 850 | Change (2) and Observe (3) side by side, shared heading and equations |
| Tablet | 768 × 1024 | Single-column controls and plots to keep plots legible without zoom |
| Smartphone | 390 × 844 | Single-column flow; equations scroll within their local container |

The shared implementation is `signals-systems/assets/ss-responsive-unified.css`, linked by every Chapter 1–8 entry page and all four Applications page templates. It does not change transform or simulation calculations. Chapter-specific layout rules are retained when they are necessary for functioning simulations.

## Principles

- Keep the existing four-step pedagogy: predict, change controls, observe graphs, explain and reflect. When there is enough width, steps 2 and 3 stay beside each other; on narrow screens they stack. Derivations and reflections start at the full left edge below the pair.
- The graph and its own axis labels must not be clipped. Canvas/SVG intrinsic drawing dimensions are preserved. Avoid document-level horizontal scrolling; lengthy display mathematics should scroll inside a formula card.
- Theme backgrounds, graph text and language controllers continue to use the established tokens rather than viewport-dependent replacements.
- Desktop sticky controls may be used only when the graph remains visible. At <=860 px, controls revert to normal flow.
- Course hub cards and applications change to one column on small viewports.
- Do not hide required instructional content or remove controls to pass the screenshot/regression test.

## Browser QA

`tests/ss-responsive-unified-browser.mjs` visits Chapters 1–8 and all Applications templates at 1920, 1366, 768 and 390 px. It checks document overflow, main-region width and noncollapsed graphs. All Chapter sections are visited at tablet and phone resolutions; first and last sections are inspected at the wide resolutions. Representative viewport screenshots are uploaded as GitHub Actions artifacts.

The existing `tests/ss-chapters-full-qa.mjs` separately checks all 62 Sections, language modes, themes and mathematical rendering. The new responsive test validates layout geometry, **not** a full scientific calibration of graph calculation or every possible slider value.
