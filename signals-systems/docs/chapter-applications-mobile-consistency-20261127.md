# Chapter 1–8 vs Applications mobile UI consistency review

Date: 2026-11-27  
Evidence: [Automated 44-state browser run](https://github.com/YSCho-HGU/engineering-learning-studio/actions/runs/45983401728)

## Scope

Chromium reviewed all 8 Chapter pages plus 14 representative Applications pages at **390px** and **768px**. The route list, geometry, screenshot artifacts, and assertions are defined in `tests/ss-applications-chapter-mobile-consistency.mjs`.

## Findings

| Concern | Chapter 1–8 | Applications | Decision |
|---|---|---|---|
| Body type | 16px | 16px after DFT adjustment | Standardized |
| Language | Mixed, English, Korean | Same | Verified |
| Theme picker | white-clean, warm-neutral, warm-dark, navy-dark, neutral-dark | Same | Verified |
| Horizontal overflow | None in audited states | None | Verified |
| Content width | Noncollapsed | Noncollapsed | Verified |
| Navigation arrows | 4 on all eight Chapters | 4 on Applications hub/A/B, absent on 10 C/D lab pages | Preserved, not an overflow or broken control |
| 390px header height | 131px | 131px with four-arrow header / 97px with compact C/D header | Explained by navigation layout |
| 768px header height | 93px | 93px with arrows / 59px without | Explained by navigation layout |

### Actual issues corrected

1. **Chapter 5 dropdown clipping.** A chapter-specific CSS rule forcibly set the closed `details` dropdown links to `display:grid`, overriding the shared closed-menu style. The menu appeared even when its toggle was not opened and its links extended beyond the 390px screen. The Ch5 CSS now hides links until the menu is opened, and constrains an opened menu within a 12px phone gutter. The browser test checks both closed and opened states.
2. **C3 DFT vs FFT typography.** The DFT page set `body` to `font:15px/1.6` after loading the shared 16px typography baseline. It now uses `--els-body-font`, `--els-body-size`, and `--els-body-leading` so its body type matches Chapters 1–8.

### Why the Applications header layout was not mass-replaced

The hub, A and B provide four-arrow course-style navigation; individual C/FFT and D labs use their own lesson tabs and stage workflows, with a compact header. Replacing all ten C/D headers with another row of arrows was **not** authorized by the observed functional findings and could increase phone chrome or introduce duplicate navigation. This is a **remaining design-system difference**, not a passed uniformity claim. A deliberate navigation design decision would be required to harmonize it.

### Final regression result

**44 / 44 page-viewport cases passed.** All pages have a rendered header, language and theme selectors, valid theme ordering, no document-width overflow, and a noncollapsed main content region. Chapter pages retain their navigation sidebar and four-arrow header. The test additionally validates that the Ch5 menu starts closed and opens within the phone viewport.

This automated geometry audit is not a classroom usability study. It does not establish uniform pixel-by-pixel aesthetics, keyboard navigation quality in every task, or correctness of every mathematical plot.
