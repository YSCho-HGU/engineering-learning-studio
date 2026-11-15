# C Programming Learning Studio — Curriculum & Accuracy Review
**Review date:** 2026-11-15  
**Audience:** First-year university students  
**Scope:** Course landing page, all 18 planned chapter entries, the 8 published chapter routes, and the newly authored 131/132/133/141 interactive lessons.

## 1. Instructional direction
- **Progression:** Arrays (131) → Strings (132) → Standard Library Functions (133) → User-Defined Functions (141) → Pointers (151) → Structures (161) → File I/O (171) → Dynamic Memory (181).
- **Five-step practice:** Understand → Predict → Explore/Trace → Practice → Check; directly supports concept comprehension rather than memorizing syntax.
- **Published chapters appear in chapter-number order**, independently of the development/commit sequence.
- **Unfinished chapters remain visible only in Course Overview**, not the first-page available-chapter cards.
- The reviewed chapters have **7, 7, 6 and 8 learning steps**, with 6 coding tasks per chapter (**28 lessons and 24 tasks**). Code-editor hints do not claim compilation.

## 2. Four newly built chapters
| Unit | Main learning outcomes | Real-world relevance |
|---|---|---|
| **131 Arrays** | initialization, safe indexing, loops, max/frequency counts, 2D arrays, sensor average | signal/sensor measurements |
| **132 Strings** | char arrays, null terminator, sizeof vs strlen, strcmp, iteration, buffer capacity, safe fgets, copying | labels, command input, IoT protocols |
| **133 Standard Library** | stdlib.h/abs, math.h/sqrt/pow/fabs, ctype.h/toupper, rand/srand, string.h/strlen | basic numeric and text processing |
| **141 Functions** | prototypes, parameters, return values, pass-by-value, scope, array parameters, composed functions | modular embedded programs |

## 3. Accuracy corrections applied
1. **Chapter numbering:** An earlier File I/O view incorrectly showed "Chapter 7"; changed its visible page heading/metadata to **Chapter 17**, consistent with unit 171.
2. **Array curriculum:** Removed function-array parameter material from Chapter 131 in favor of **2D arrays**, since user-defined functions are addressed in Chapter 141.
3. **String safety:** Separated buffer capacity from actual stdin reads; the fixed example has deterministic output, and P5 uses `fgets` with a concrete input/output comparison.
4. **Interactive correctness:** Replaced generic shared simulation results with **28 lesson-specific parameterized conceptual scenarios**. Each scenario is explicitly labeled as a pedagogical model, **not an actual C interpreter**.
5. **Math linking:** Added GCC `-lm` instruction where standard-library math exercises may require it.
6. **Value-dependent outputs:** `rand` exercises test only defined range/repeatability properties, **not a specific implementation-dependent random number**.
7. **Null termination:** String examples distinguish the logical length (`strlen`) from array capacity (`sizeof`) and reserve storage for `'\\0'`.

## 4. Verification and regression coverage
- **Static content inspection performed:** eight published chapter paths, lesson and exercise counts, mandatory quiz/model/trace fields, matching trace substrings, and 18-entry catalog structure.
- **Automated GCC C11 suite added:** `tests/c-four-chapters.mjs` compiles all 28 revised C reference examples with `-std=c11 -Wall -Wextra -Wpedantic -Werror -lm`, compares actual stdout with published expected results, and validates 24 practice prompts. Results require running the workflow and checking the outcome.
- **Automated browser suite added:** `tests/c-four-chapters-browser.mjs` checks two widths, eight lesson steps per chapter, models, quizzes, six practice editors, and home-card counts.
- **Whole-course integrity suite added:** `tests/c-site-integrity.mjs` checks catalog IDs, published routes, 18 chapter entries, metadata, and legacy numbering.
- GitHub Actions workflow: `.github/workflows/c-four-chapters.yml`.

**Execution status:** Eight representative reference programs were independently compiled and executed with local GCC C11 (`-std=c11 -Wall -Wextra -Wpedantic -Werror -lm`) and matched their expected outputs:

| Example | Verified stdout |
|---|---|
| 131 2D array | `6` |
| 131 frequency count | `3` |
| 132 string copying including NUL | `ABC` |
| 132 buffer capacity | `10 IoT` |
| 133 `sqrt(81.0)` | `9.0` |
| 133 repeatable `srand(1)` sequence | `1` |
| 141 pass-by-value | `5` |
| 141 array argument sum | `6` |

These eight local checks passed. **Remaining 20 new examples and complete browser QA still require confirmation from the GitHub Actions workflow.** Static checks are not evidence of actual browser execution.

## 5. Remaining caveats / educational guardrails
- Simulator output is illustrative; **a browser static check is not an authentic GCC compilation**.
- `rand()` does not promise identical numeric sequences across different implementations; `rand()%n` can have modulo bias and is not security-grade.
- Actual `sizeof` sizes and memory addresses may depend on C implementation/architecture.
- `fgets` can retain the newline and must be checked for failure.
- `file-io/` uses an earlier independent implementation. Keep its existing behavior intact when standardizing visuals/navigation.
- Completion/progress stored in localStorage is personal self-study evidence, not a formal assessment result.
- Unfinished Chapters 101–123 and other planned units should remain hidden from the available-chapter landing cards until their lessons are genuinely ready.

## 6. Next quality gate
Before describing the whole platform as verified, confirm the GitHub Actions **GCC and browser workflows pass**, review 390px and 1280px screenshots, and perform a human reading pass for content clarity and expected student work time.


## 2026-11-15 Instructor revision: outcome-based lesson counts

New first-year curriculum review removes the mandatory eight-step format.
- 131 Arrays: **7 lessons** — array updates integrated into indexing/initialization; 2D arrays, frequency counts and sensor application remain.
- 132 Strings: **7 lessons** — duplicate sensor-name comparison merged with strcmp; null terminator, length, buffer capacity and copying remain.
- 133 Standard Library: **6 lessons** — duplicate strlen omitted; rand/srand and toupper/isdigit paired by teaching purpose.
- 141 User-Defined Functions: **8 lessons retained** because prototypes, parameters, returns, pass-by-value, scope, array parameters and composition are distinct outcomes.

New total: **28 concept lessons**, plus **24 coding exercises**. The earlier 32-lesson count refers to the prior version.
Lesson navigation, progress bars, phase classification and quiz checks now derive from the current chapter lesson count.
Concept quizzes and transfer questions have been rewritten to assess specific learning outcomes; an estimated concept-study time is displayed for each step.
Previous progress records for the redesigned chapters are versioned to prevent mapping completion to a different lesson.
New QA requires the GCC C11 and browser workflow to run with the dynamic 7/7/6/8 counts. Test registrations and JavaScript syntax checks are not equivalent to passing real browser or compiler runs.
