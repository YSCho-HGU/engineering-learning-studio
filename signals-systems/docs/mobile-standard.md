# Signals & Systems — Chapter 4 mobile layout standard

## Scope and ownership

Chapters 1–8 share **Chapter 4's mobile navigation and content geometry**, without rewriting any Chapter's mathematics, signals, canvas/SVG drawings, simulation controls, language logic or saved progress.

- Mobile CSS authority: `signals-systems/assets/ss-mobile-ch4-standard.css`, linked last on each Chapter page.
- Header geometry observer: `signals-systems/assets/ss-mobile-ch4-standard.js`, used by Chapters 1–8.
- Sidebar card, navigation and collapse authority: `ss-sidebar-layout.css` and `ss-sidebar-toggle.js`.
- Core header and section arrows: `ss-common-header.css` and `ss-common-header.js`.
- Native Chapter layouts retain the structure of each experiment; the shared file overrides **responsive geometry only**.

Do not reintroduce a chapter-specific fixed 46px header, a block-layout override in the 601–780px tablet range, or any mobile rule that pushes the content beneath a saved collapsed rail.

## Chapter 4 acceptance criteria

| Area | Shared rule |
| --- | --- |
| Mobile viewport | 360px, 390px and 430px |
| Tablet viewport | 768px |
| Expanded phone sidebar | Above main, max-height 205px, scrolls internally |
| Collapsed sidebar | 52px rail alongside a fully visible main, including after reload |
| Tablet expanded sidebar | Two-column layout with navigation left and content right |
| Header | Same chapter/menu/arrows/language/theme order; real height measured into `--ss-layout-header` |
| Navigation cards | 13px text, min-height 52px, 30px number badges, 6px spacing; Chapter 4 colors and radius |
| Learning stages | Predict → Change → Observe → Explain; controls and plots stack on phone |
| Graphs and equations | Responsive graph width; long math scrolls within its own container, never pushes page horizontally |
| Themes and language | white-clean / warm-neutral / warm-dark / navy-dark / neutral-dark and en / ko / mixed |
| Functional protection | Section selection, sidebar toggle/restore, persistence, chart rendering and lesson state unchanged |

## Continuous visual and behavioral regression

- Workflow: `.github/workflows/ss-ch4-mobile-standard.yml`; triggers on relevant **main pushes**, **pull requests**, and **workflow_dispatch**. Superseded runs on the same ref are cancelled.
- Browser script: `tests/ss-ch4-mobile-standard-browser.mjs` uses Chapter 4's computed card metrics as the comparison baseline.
- At 390px, tests navigate **every Section in all 8 Chapters**. At other widths, they inspect the first, middle and last Sections.
- Each run also checks every Chapter's 5 themes and 3 language modes at 390px, header control containment/overlap, empty pages, clipped graphs, document horizontal overflow, and persisted collapsed state across reload.
- Each run publishes screenshots and a JSON report in the `ss-ch4-mobile-ux-report` GitHub Actions artifact.
- Existing mathematical audit and Chapter-level functional tests are separate and must continue to protect educational content.

Local reproduction (after installing the project's browser dependencies):

```sh
python3 -m http.server 8765 --bind 127.0.0.1
# In a second terminal:
node tests/ss-ch4-mobile-standard-browser.mjs
```

If changing a Chapter's mobile UI, edit **the shared standard** rather than creating a new chapter-specific override, and run the browser test before deployment.
