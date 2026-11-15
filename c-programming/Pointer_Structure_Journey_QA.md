# C Programming — Pointer & Structure Journey QA and release gates

## Delivered scope
- Pointer: 8 essential stages, 6 after-class coding prompts, memory models, prediction before revealing reference outputs, independent transfer questions, progress retained in local storage.
- Structure: 8 essential stages, 6 coding prompts, record/member/copy/array/function/sizeof/CSV model, same learning interface.
- Existing File I/O Journey and Quick Labs remain unchanged.
- C Programming home and roadmap navigate to the new journeys.
- C11 code listings are reference examples; the interactive models use JavaScript, **not a live C compiler**.

## Three-phase teaching structure
**Before class:** understand the need and concept; predict output first.
**In class:** manipulate parameters, inspect models and code, reconcile prediction with reference, explain why.
**After class:** complete P1–P6 in an external GCC C11 environment; test cases are not proof that starter code was compiled.

## Cross-verification matrix
| Gate | Required evidence | Current status |
|---|---|---|
| A. Content structure | 8 unique stages + 6 practices per course + concept/quiz/transfer | PASS, connector-based independent data parsing (2026-11-15) |
| B. Answer-key mapping | Correct index points to expected output; positions not all identical | PASS, connector-based parsing |
| C. Navigation/source | Links, data scripts, DOM IDs, stored progress | PASS for source structure; runtime verification pending |
| D. C11 oracle | Compile each of 16 lessons with GCC `-Wall -Wextra -Wpedantic -Werror`; execute and compare expected stdout | **PENDING CI execution** |
| E. Browser | Both course pages × mobile 390/desktop 1280 × light/dark; navigation, quiz feedback and overflow | **PENDING CI execution** |
| F. Pedagogical pilot | First-year student can predict, explain pointer aliasing/struct copies and transfer to unseen C code | **PENDING student evidence** |

## Designed preventive checks
1. Reference outputs are explicitly labeled. Do not confuse the UI model with running C.
2. `sizeof(struct)`, actual pointer values, and C ABI layout are platform dependent. Never mark one absolute byte count/address as universally correct.
3. Avoid undefined behavior: invalid index, uninitialized pointer, expired lifetime, dereferencing NULL.
4. Distinguish pointer-by-value parameter passing from the indirect modification of the caller's object.
5. Explain structure member copying versus deep copying of owned memory.
6. Test responsive horizontal overflow, console errors, keyboard focus, and light/dark modes.
7. Progress markers indicate activity review, **not proven coding mastery**.
8. Record failing chapter/step, scenario, observed/expected, fix SHA and rerun status before certifying.

## Automated reproduction
From the repository root, with Node 22, GCC and Chromium:
```sh
npm install --no-save playwright@1.56.0
npx playwright install chromium
C_JOURNEY_BROWSER=1 node tests/c-journey-qa.mjs
```
For source + C11 only:
```sh
node tests/c-journey-qa.mjs
```
GitHub Actions: `.github/workflows/c-journey-qa.yml`; results in `qa-output/c-journey-qa.json`.

**Release policy:** neither source-level PASS nor successful automated browser checks alone establish pedagogical effectiveness. Only mark runtime VERIFIED after inspecting actual workflow artifacts. Do not assert student competency without student work.
