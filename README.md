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

## Deployment

Static GitHub Pages site published from the repository root. Module data and browser learning experiences are independent; the admin writes course catalog data through authenticated GitHub APIs.
