# Applications Parts A / B / D — Shared Visual System & QA

**Verified:** 2026-11-23  
**Code review:** [PR #8](https://github.com/YSCho-HGU/engineering-learning-studio/pull/8)  
**Chromium A/B/D QA:** [successful workflow run 45194000216](https://github.com/YSCho-HGU/engineering-learning-studio/actions/runs/45194000216)  
**Regression of unchanged FFT Part C:** [successful run 45194000262](https://github.com/YSCho-HGU/engineering-learning-studio/actions/runs/45194000262)

## Actual coverage (do not imply B/D labs exist)

| Area | Content present in repository | UI treatment |
| --- | --- | --- |
| **Part A — Signals** | Six working interactive laboratories: Harmonics & Sound, Chirp & Spectrogram, Complex Exponential 3D Helix, Beats, AM/FM, Sampling & Aliasing | Six **direct clickable lesson rows** matching Part C's module-first list; full-row links to `applications-lab.html?lab=...` |
| **Part B — Systems** | Six curriculum-only topic proposals, **no interactive lab pages** | Six matching **Planned** cards with a disclosure for question, planned observation, and related chapter links; no fake lab action |
| **Part D — Integrated** | Six curriculum-only topic proposals, **no interactive lab pages** | Same honest expandable **Planned** cards preserving all supplied topic explanations |
| **Part C — FFT** | Seven existing interactive labs | Deliberately **unchanged** and independently regression-tested |

## Design standard

Derived from the tested `ss-app-fft-visual-standard.css`, introduced in `ss-app-abd-visual-standard.css`. The new stylesheet is applied **after** the original Applications hub and Part A lab CSS.

| Design role | Desktop | 390px mobile |
| --- | --- | --- |
| Card/control panel inner padding | 14px | 12px |
| Card corner radius | 12px | 12px |
| Topic/plot heading | 16px | 15px |
| Select/button minimum height in Part A | 40px | 40px |
| Display equation scale | ~19px | 17px |
| Default spacing | 12px | 10px |
| Local equation scrolling | Yes | Yes |
| Theme-aware tokens | Neutral Dark, White Clean and existing common themes | Same |

No FFT, signal synthesis, Canvas drawing coordinates, KaTeX source strings, header scripts, or Chapter 1–8 source code was changed.

### Hub and content semantics

- Part A module rows are links and navigate directly to six actual experiments.
- Part B/D planned cards use native `details` and `summary` for keyboard accessibility. They expose their existing **Question**, **Planned exploration**, and **Related chapters**.
- Status is explicitly labelled *Planned / 개발 예정*; the entire card is not deceptively linked to an unimplemented lab.
- The existing Signals & Systems header, EN/KR/Mixed language switch, all themes, and Part A control interactions are retained.
- The new topic list collection spans the full hub content width; it uses two columns only within the collection on wide screens, avoiding a half-width list inside the old two-column wrapper.

## Real browser verification

The new workflow `.github/workflows/applications-abd-visual.yml` runs `node tests/applications-abd-visual-regression.mjs` with Playwright/Chromium 1.56.1 on Ubuntu 24.04, including Noto CJK fonts. Tests verify:

1. Six real Part A links, with exact lab query targets.
2. Six planned Part B and six planned Part D modules; no fake interactive lab links.
3. Planned detail expansion/collapse, retained questions/observations and working chapter anchors.
4. English and Korean topic labels and planned status.
5. All six working Part A laboratory canvases actually render nonblank imagery, with controls and Reset responsive.
6. Three presentation states: desktop Neutral Dark at 1366px, desktop White Clean at 1366px, and 390px mobile Neutral Dark.
7. Actual computed panel padding/radius, plot heading size, formula size, content width, and document-level overflow.
8. No page-wide horizontal overflow, uncaught JS exceptions or KaTeX errors.
9. The seven Part C FFT module rows remain present and their existing full regression workflow still passes.

### Measured outcomes

- **21 screenshots:** 3 hub views + 6 interactive lab pages × 3 views each.
- **27 measurement records:** A/B/D × 3 views + six labs × 3 views.
- **Desktop:** 14px panel padding, 16px title, ~18.85px math; **mobile:** 12px padding, 15px title and 17px math.
- **Card radius:** 12px, consistent in all sampled views.
- **Document horizontal overflow:** 0px for all measured pages and views.
- **Full-width module list:** new list collection >=94% of its parent width.

Screenshots and `measured-layout.json` are stored as the GitHub Actions artifact `applications-abd-visual-screenshots`. Dark, White and mobile contact sheets were inspected; no unintended light-theme panels or blank Part A plots were seen.

## Known boundaries and future options

- Part B and D **have not been implemented as working labs**. This change standardizes their presentation and keeps their future content visible.
- The six-link Part A internal lesson tabs remain functionally intact. Small mobile screens show a horizontal subset in the existing tab scroller; a separate navigation redesign could simplify them in a future iteration.
- Some Canvas chart tick annotations remain naturally small on phones because the plotting engines' viewports and transform code were intentionally unchanged.
- QA is real checked-out-source Chromium, **not** an independent GitHub Pages CDN propagation check or multi-browser device certification.

## Files

- `signals-systems/assets/ss-app-abd-visual-standard.css` — scoped shared visual contract.
- `signals-systems/assets/ss-applications-hub.js` — honest Part A vs B/D card semantics and direct links.
- `signals-systems/applications.html` and `signals-systems/applications-lab.html` — stylesheet loading.
- `tests/applications-abd-visual-regression.mjs` — 6 lab, 12 planned topic, layout and theme regression.
- `.github/workflows/applications-abd-visual.yml` — independent repeatable browser QA.
