# C Programming · Eight Published Units — Educational & Technical Review

**Scope:** published 131, 132, 133, 141, 151, 161, 171, 181; university first-year learners; GCC C11.
**Review date:** 2026-11-20. **Evidence:** the current authored `data.js`, `file-io/index.html`, `file-io/practice/app.js`, `docs/C_PROGRAMMING_AUTHORING_STANDARD.md`; automated CI `Unified Studio Quality G0-G7`; machine-generated source audit `qa-review/c-curriculum-audit.json` (GitHub Actions artifact).

## Conclusion and approval boundary

**Technically strong baseline; educational review still open.** The course has a coherent conceptual progression, full working C references for the seven common-engine chapters, and isolated first-year Core/Optional markers in the three advanced units. The current automated G0–G7 report covers the eight published C unit landing pages in 32 viewport/theme combinations, GCC compilation/output checks where supported, coding-guide structure, local student state protection, and the five-gate Logic pilot. It is **not** a proof of all C algorithms, arbitrary student programs, output under all inputs, or the effectiveness of instruction.

The key unfinished work is connecting **concept → change a variable → predict → trace → independent coding → interpret an error** instead of repeatedly using output-prediction questions and generic five-case scenarios.

### Evidence-based unit evaluation

| Unit | Structure / sequence | Accuracy observations | First-year learning judgment | Action |
|---|---|---|---|---|
| **131 Arrays** (7 lessons, 6 tasks) | declaration → indexes → loop → maximum → frequency → 2-D → sensors | Valid index boundaries and frequency precondition explicitly stated; reference output compilation tested | Good progression from simple arrays to meaningful sensor application | **P1:** add negative-only max interactive case; show the exact difference between `max=0` and `max=a[0]` |
| **132 Strings** (7, 6) | character arrays → terminator → sizeof/strlen → strcmp → traverse → capacity → copy | Null terminator and size_t are accurately distinguished; `fgets` caveats acknowledged | The safe-input coding task appears after a lesson whose working program only prints a fixed string | **P1:** actual `fgets` worked example with bounded buffer, return check, retained newline; varied `strcmp` outcomes |
| **133 Standard Library** (6, 6) | stdlib → sqrt → pow → ctype → rand → fabs | Random output is not fixed across implementations; `isdigit` normalized with `!=0`; `abs(INT_MIN)` and `% n` caveats present | API density manageable; needs concrete distinction between result *type* and display format | **DONE:** Korean `toupper/isdigit` answer explanation now distinguishes printable character from Boolean result |
| **141 Functions** (8, 6) | purpose → prototype → arguments → return → copy → scope → array argument → composition | Prototype/call and array count examples align with C11 | Well sequenced, but last simulation says *Menu-Driven* without actual menu code | **P2:** rename model Function Composition; put menu/CLI in a separate transfer challenge |
| **151 Pointers** (6 Core + 2 Optional; 6 tasks/4 Core) | address → declare/deref → mutate → swap → arithmetic → safety → const → double pointer | No fixed numeric addresses; one-past pointer not dereferenced; pass-by-value is explained | Focused essential core. The first mental-model barrier is distinction between pointer's value and pointee value | **P2:** add memory-state sketches before/after `*p`, including invalid/NULL as conceptual, not runnable C |
| **161 Structures** (6 Core + 2 Optional; 6 tasks/5 Core) | record → typedef → . vs -> → array → functions → copy → padding → file text | ABI-dependent `sizeof` not hard-coded; `typedef struct Tag` difference correct | Practical student-record domain; transition to I/O is well chosen | **P2:** reinforce shallow pointer-member copy vs independent scalar members; keep padding Optional |
| **171 File I/O** (7 Core + 1 Optional; 7 practice tasks plus 3 introductory labs) | persistence → stream → modes → text → EOF → records → optional sensor → integration | `fscanf` return-count / EOF distinction and width-limited `%39s` discussed | Good real-world relevance. Separate basic copy/record lab precedes optional sensor complexity | **P2:** compact optional sensor screen; keep prediction optional for manipulation and expose essential steps without forced submission |
| **181 Dynamic Memory** (4 Core + 4 Optional; 6 tasks/3 Core) | need → malloc+sizeof → indexed use → free → calloc → realloc → error patterns → sensor records | Checks NULL, never reads uninitialized `malloc` memory, `free` safety; proper temporary pointer for `realloc` | The four Core quizzes mostly repeat expected-output prediction rather than test memory safety decisions | **P1:** change Core Check Yourself to reasoning about NULL, bytes, lifetime and unsafe alias pointers; keep outputs in Predict |

**Counts are instructional structure, not quality scores.** The Core/Optional threshold used here is from the actual data, not an arbitrary fixed lesson quota. The mandatory `malloc/free` goal in 181 is correctly prioritized. The existing 171 File I/O stage order deliberately places the Optional sensor stage after core integration in navigation.

## Cross-course findings and priorities

**P1 — before considering instructional acceptance**
1. **Strings:** demonstration gap between buffer capacity and safe actual input. A deterministic `sizeof` illustration does not show `fgets` newline/EOF handling or successful reads.
2. **Strings:** only `strcmp(...)=0` cases in interactive model. Extend to sign outcomes with equal and unequal strings; C does not guarantee exactly ±1 for unequal cases.
3. **Arrays:** negative-only maximum case to observe why `max=0` is unsafe for all-negative arrays.
4. **Dynamic Memory:** evaluate conceptual hazards instead of merely restating printed values in all four Core quiz questions.

**P2 — high-return classroom usability**
5. **Functions:** align *Menu-Driven Calculator* model title with function-composition example (no actual menu/input/switch).
6. **Prerequisites:** earlier planned units 101–123 are not yet published; add a small prerequisite checkpoint and links to the professor's classroom foundation material rather than assuming it is on the public portal.
7. **File I/O:** the optional Sensor Log lesson is long and dense. Collapsing advanced panels and keeping the core learning objective on top improves the first-year experience.
8. **C Engineering applications:** reuse consistent sensor input → transform → summary → output examples across Arrays → Functions → Structures → File I/O → Dynamic Memory while making each chapter's *new skill* explicit (avoid restating the same example without a new outcome).

**P3 — enhancement**
9. Vary quiz modalities: predict, identify incorrect code, choose safe bounds, match memory diagram, explain a return value. Evaluate *transfer* against unseen input.
10. Introduce a single short integrative project: a small sensor record logger, initially with fixed arrays, then struct, text file, optionally malloc. Avoid new syntax beyond Core.

## Technical safeguards and what remains unverified

- **Automated evidence:** GCC `-std=c11 -Wall -Wextra -Wpedantic -Werror`; the shared-engine reference examples tested compile/run and match expected output. Input-dependent and external I/O cases need separate fixtures.
- **Logic correctness:** quiz correct-option indices and trace references are structurally validated; this does not independently evaluate the truth of every written rationale.
- **Coding tasks:** student starter programs are intentionally incomplete. Regex checklist matching cannot prove a valid solution, handle all input data, or detect all undefined behavior. Use a small GCC executable test fixture per coding task in any later formal approval pass.
- **Memory compatibility:** never renumber a lesson or alter `contentRevision`/stored progress inadvertently. Changes to explanations and optional scenario cases can preserve lesson indices.
- **Manual M1–M3:** reference accuracy, actual student comprehension, and effective workload remain `PENDING` until reviewed.

## Suggested acceptance sequence

1. Fix the four P1 learning gaps without changing lesson IDs, existing reference output contracts or localStorage keys. For changed quiz strings keep `en.js` in sync.
2. Add reference scenario assertions (negative maxima, `strcmp` sign, `fgets` success/EOF and newline), run GCC and browser QA.
3. Add boundary-case GCC fixtures for all seven common-course practice sets and File I/O-specific file fixtures as needed. The existing GCC check currently verifies *reference lessons*, not arbitrary practice solutions.
4. Review M1 technical diagrams, M2 reference correctness, M3 first-year learning clarity; record instructor approval per unit. Only then designate a unit educationally approved.

**Decision:** `AUTOMATED_PASS_MANUAL_PENDING` (where latest CI is green); educational P1/P2 flags are instructor review items and are **not** silently classified as software regressions.
