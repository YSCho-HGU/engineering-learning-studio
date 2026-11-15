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


## 2026-11-15 Follow-up: Q1/Q2/Q3 source review and trace controls

- Fixed Pointer/Structure runtime initialization bug: missing `back-link` target no longer aborts `init()`.
- Added line-highlighted **Guided Execution** with Previous/Next/Restart, manually verified variable/memory snapshots, and no C-code interpreter claims. Source mapping contains **34 pointer trace steps and 27 structure trace steps**, all resolving to the lesson C listings.
- Improved introductory prediction question distractors: correct answers distributed across positions; alternatives now represent likely output misinterpretations instead of generic compile-failure placeholders.
- Fixed illustrative `&x` address marker (previously mislabeled as `&p`). Model addresses remain purely illustrative.
- Prevented initial trace rendering from scrolling learners past the introduction.
- Extended Chromium QA to capture 12 screenshots: Pointer, Structure, File I/O × 390/1280 widths × light/dark, plus Pointer/Structure trace next/previous interactions and existing navigation/quiz checks.
- **Source checks completed** (GitHub connector review): 16/16 lessons have 61/61 source-matched trace steps, 16/16 distinct quiz-option sets, 16/16 expected-answer mappings, shared renderer JavaScript syntax parses. This is not the same as live browser confirmation.
- **Runtime status:** GCC cross-check and real browser screenshot workflow created but run output/artifacts have not been retrieved and examined. Do not mark production browser QA VERIFIED until results and representative screenshots have been reviewed.

### Reviewer priorities after the first complete Chromium run
1. Each course first screen versus File I/O header/3-phase/left navigation and code card in both themes.
2. Guided trace active line remains visible on mobile without page-level horizontal overflow.
3. Select quiz answer and verify on-screen explanation, then navigate forward/back without state corruption.
4. Code text is not cut at 390px and copy-starter link provides the whole C11 starter.
5. Verify GCC expected output across all 16 examples and verify student explanations for pointer aliasing and structure-copy semantics.

## Q1/Q2 follow-up: runtime evidence and memory visualization

- Added labeled memory diagram cards directly to each step of the C source walkthrough, with **virtual addresses**, value labels and pointer arrows (never actual runtime addresses).
- Retained line highlighting, Previous/Next/Restart, and scope disclaimers.
- Added responsive styling for phone width and updated the browser regression suite to assert diagram presence and memory-state changes during step navigation.
- Confirmed source files on `main`: JavaScript renderer parses and all 16 lessons retain source-matched trace steps (13/13 targeted source predicates passed in this review).
- **Important:** GitHub source changes are verified, but GitHub Pages URLs and workflow output were inaccessible from the available browser/network tools. Local Chromium/GCC binaries exist in the runtime, but repository checkout failed due DNS restrictions. Do **not** claim a successful real Chromium screenshot inspection or production deployment.
- Release gate **Q1 browser verification: PENDING** until 12 screenshots and report from `c-journey-qa` are actually available and reviewed.
- Release gate **Q2 memory diagram implementation: SOURCE VERIFIED**, interactive presentation pending Chromium confirmation.
