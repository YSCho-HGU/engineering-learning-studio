# Engineering Learning Studio — Eye Comfort Theme v2

**Release date:** 2026-11-15  
**Default for new visitors:** Neutral Dark  
**Available choices:** Neutral Dark, Warm Dark, Navy Dark, Warm Neutral

## Cross-course behavior
- Shared selection key: `localStorage["els-theme-v2"]`.
- The Studio portal, C Programming home and lessons, three coding-practice editors, integrated C dashboard, and Signals & Systems home use the same four palette names.
- Both repositories are hosted beneath the same `yscho-hgu.github.io` origin, so browser localStorage is shared between them. This does not synchronize across other browsers/devices.
- A bootstrap snippet applies the selected palette **before first paint**.
- Selecting a palette changes CSS variables without reloading the current page. S&S forwards the light/dark scheme and palette to its embedded chapter iframe without regenerating the experiment.
- A pre-existing explicit saved light/dark preference is mapped to Warm Neutral/Navy Dark when no v2 selection exists. Otherwise the default is Neutral Dark.
- Chart series colors and numeric computation are left intact; the palette mostly affects surfaces, code, headings and navigation.

## Default colors
| Role | Color |
|---|---|
| Page | `#101010` |
| Panel | `#1C1C1C` |
| Text | `#F0F0ED` |
| Muted text | `#C1C5C1` |
| Border | `#565B57` |
| Accent/link | `#B9D7C8` |
| Editor background | `#171819` |

## Numeric contrast checks
Computed sRGB WCAG contrast (general text target >= 4.5:1):
- Neutral Dark body vs page: **16.66:1**
- Neutral Dark muted vs page: **10.89:1**
- Neutral Dark body vs panel: **14.93:1**
- Other supported palettes' foreground vs page: Warm Dark 12.98:1, Navy Dark 15.91:1, Warm Neutral 12.36:1.

These are design-token checks, **not a claim of sitewide WCAG compliance or proven reduction in eye fatigue**.

## QA and release gates
- ELS: `tests/els-theme-qa.mjs` integrated into `.github/workflows/c-journey-qa.yml`; covers all 9 Studio/C HTML routes, 390px/1280px viewport checks, palette choices, persistence, JS errors and theme contrast.
- S&S: `tests/ss-theme-qa.mjs` with `.github/workflows/ss-theme-qa.yml`; checks live selector changes and embedded Chapter 1 lab state preservation.
- **Source validation performed:** all nine ELS routes include the same shared palette assets and early theme bootstrap; S&S has the theme bridge and iframe palette stylesheet; shared CSS/JS are byte-identical across repos; JavaScript syntax parsed; a mock runtime confirmed defaults, persistence and migration; WCAG design-token contrast calculated.
- **Remaining gate:** review real Chromium run logs, screenshots and the deployed GitHub Pages output. This environment was unable to access the live GitHub Pages URLs directly.

## Non-destructive migration
The implementation does not clear course progress, coding drafts, answer selections, signal graph state, or previously saved language setting.
