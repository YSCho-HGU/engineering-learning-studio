# Engineering Learning Studio

Interactive learning hub for engineering courses (GitHub Pages).

## Courses

- **C Programming** — [course overview](./c-programming/): concept learning, guided execution, interactive models, C coding practice and published chapter catalog.
- **Signals & Systems** — [visual lab](https://yscho-hgu.github.io/signals-systems-visual-lab/).
- Logic Design — introductory interactive logic exercises.
- Digital Signal Processing, Python Programming, AI / AX — planned or expanding.

## C Programming authoring standard

**[C_PROGRAMMING_AUTHORING_STANDARD.md](./docs/C_PROGRAMMING_AUTHORING_STANDARD.md)** is the source of truth for authoring and reviewing future C chapters.

- No fixed **number of lessons**, no fixed **number of coding tasks**; plan content from independent learning objectives.
- Core vs Optional is defined by `coreCount` when needed.
- Before/In/After are instructional activity stages, not a mandate to fill three separate concept lessons.
- Use the example file [`c-programming/_template/data.js`](./c-programming/_template/data.js) as an editable starting point, not an eight-step checklist.
- New course content is drafted with `published: false` in [`course-catalog.json`](./c-programming/course-catalog.json), then published after review using the [studio administrator](./admin/) or the catalog data.
- Code snippets should be valid GCC C11 examples and match their published output.

### Verification

```sh
node tests/c-authoring-policy.mjs
node tests/c-course-gcc.mjs
node tests/c-site-integrity.mjs
```

To inspect a specific drafted module (even before publication):

```sh
node tests/c-authoring-policy.mjs arrays
node tests/c-course-gcc.mjs arrays
```

Browser QA: `tests/c-four-chapters-browser.mjs`. CI workflow: `.github/workflows/c-four-chapters.yml`.

The authoring policy is a structural quality gate, not a substitute for instructor content review or actual browser QA.

## C Programming — Chapter Creation

New C chapters follow [the flexible authoring standard](docs/C_PROGRAMMING_AUTHORING_STANDARD.md). For the instructor evaluation of Chapters 151–181, see [the first-year Core/Optional review](docs/C_CH151_181_FIRST_YEAR_REVIEW.md).
Copy [the chapter data template](c-programming/_template/data.js), select the number of lessons and coding tasks **from learning objectives (never from a fixed numeric quota)**, validate with the shared tools, then publish via the [Course Manager](admin/).

```bash
node tests/c-authoring-policy.mjs
node tests/c-course-gcc.mjs
```

Continuous checks: [.github/workflows/c-authoring-policy.yml](.github/workflows/c-authoring-policy.yml). The CLI checks are complementary to browser and instructor review.

## Deployment

Static GitHub Pages site published from the repository root. Module data and browser learning experiences are independent; the admin writes course catalog data through authenticated GitHub APIs.

## Shared language standard for new courses

Use [PLATFORM_LANGUAGE_STANDARD.md](./docs/PLATFORM_LANGUAGE_STANDARD.md) for the common `ENG / 한국어 / ENG + 한국어` contract. New Python and Logic Design courses should include [`assets/els-language.js`](./assets/els-language.js) and follow the [example implementation](./docs/examples/course-language-example.js). The existing Studio, C and Signals & Systems pages already share `localStorage["els-language"]`; do not create a new preference key.

## Cross-course platform architecture

See [Platform Architecture Review & Migration Plan](./docs/PLATFORM_ARCHITECTURE_REVIEW.md) for the recommended modular structure covering language, theme, learning progress, assessment evidence, catalog publication, and administrator workflows. This is a design review; it does not migrate existing student data or replace the independent learning engines.

## Phase 0 — Preservation Baseline

The [Phase 0 Baseline Report](./docs/phase0/PHASE0_BASELINE_REPORT.md) documents source-derived localStorage access, pinned course revisions, read-only isolated Chromium fixtures, C/S&S regression results and remaining pre-existing CI issues. Avoid schema migrations until the Phase 0 compatibility gates remain green.
