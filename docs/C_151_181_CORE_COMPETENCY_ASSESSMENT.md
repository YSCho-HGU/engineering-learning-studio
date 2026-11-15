# C Programming 151–181 · Core-Only Programming Competency Assessment

**Review:** 2026-11-16  
**Audience:** First-year university students  
**Sources inspected:** `151/pointer/data.js`, `161/structure/data.js`, `171/file-io/index.html`, `171/file-io/practice/app.js`, `181/dynamic-memory/data.js` and `C_CH151_181_FIRST_YEAR_REVIEW.md`.

## Executive conclusion

**Core 151–181 is sufficient as an introduction to practical intermediate C topics, but does not by itself prove basic C programming independence.** It can be considered a reasonable end-of-semester *skill scope* **if** students have already mastered expressions, branches, loops, arrays/strings and functions (Ch101–141) **and** pass an independent compile/run/debug assessment.

The site currently offers stepwise interactive examples and starter-code TODO tasks. These are good formative practice but are **not independent evidence** that a learner can design a complete new program. Online text checks are regex-based hints, not C11 compilation, runtime correctness or memory safety checks.

### Core scope examined

| Chapter | Core conceptual lessons | Core coding tasks | Independent capability that should emerge | Current evidence strength |
|---|---:|---:|---|---|
| **151 Pointers** | 6 | 4 | Distinguish value/address/dereference, modify caller via pointer, traverse array safely, prevent out-of-range access | Adequate *guided* evidence; independent creation untested |
| **161 Structures** | 6 | 5 | Model a student/sensor record, update through pointer, process record arrays, explain copy semantics | Adequate *guided* evidence; integration and input validation limited |
| **171 File I/O** | 8 topic stages (with Core/Optional elements embedded) | **P1–P2 recommended priority** | Open/close streams, write/read text, check I/O success, distinguish EOF from malformed input, compute summary | Good conceptual breadth; two prioritized practical tasks do not cover all text-file use cases |
| **181 Dynamic Memory** | 4 | 3 | Allocate `n` ints with `malloc`, check NULL, initialize/read/write within bounds, `free` once before losing ownership | Sound minimum for introductory heap usage; independent lifecycle debugging untested |

**Total unique guiding steps:** 24 Core lessons (151:6 + 161:6 + 171:8 + 181:4).  
**Core code assignments:** 14 priority tasks (151:4 + 161:5 + 171:2 + 181:3).  
These are **learning activities and practice coverage counts**, not a measured proficiency score. The 171 lessons include optional content within the eight displayed stages.

## Competency matrix

| Observable competency | Core coverage | Evaluation |
|---|---|---|
| C syntax, variables, expressions, `if`, loops | Prerequisite Ch101–123, not newly taught by Ch151–181 | **Must confirm prerequisites** |
| 1D arrays, strings, functions and prototypes | Prerequisite Ch131–141 | **Must confirm prerequisites** |
| Pointers and pass-address-to-function | Ch151 P1–P4; Ch161 P2 | **Covered**, test independent implementation |
| Safe pointer indexing and object lifetime | Ch151 P4; Ch181 P2–P3 | **Covered conceptually**, untrusted input handling limited |
| Modeling and processing arrays of structures | Ch161 P1–P5 | **Covered**, verify one independent integrated task |
| Persistent text-file read and write | Ch171 P1–P2 | **Covered minimally**, error behavior needs explicit checks |
| Character/line-based input via `fgets` | Ch171 concept; P3 optional | **Gap for practical text-file breadth**; recommend promoting a short `fgets` exercise to a required micro-lab, without adding a full six-task project |
| Runtime-sized arrays with `malloc` and `free` | Ch181 P1–P3 | **Covered**, check NULL and ownership independently |
| Multiple errors handled consistently | Spread across Ch151/171/181 | **Partial**; require at least one missing-file/malformed-input and one failed-allocation reasoning case |
| Independent problem decomposition and debugging | Guided TODO tasks only | **Not established**; standalone GCC assessment required |
| Effective input/output record integration | Ch161 and Ch171 separately | **Not established**; one capstone challenge required |

## What constitutes "basic C programming competence"?

An appropriate, testable exit criterion is that a student, **without starter code**, can:

1. Read a short specification and divide it into input, computation and output stages.
2. Declare suitable arrays/structures and choose appropriate functions.
3. Use pointers safely, including a function that changes an existing object through an address.
4. Read or write a text file using `fopen`/`fclose`, check conversions or line-read results, and handle a missing file without a crash.
5. Allocate a requested positive number of elements, initialize them before reading, and release the memory exactly once.
6. Compile with GCC C11, interpret compiler diagnostics and verify output on normal and one edge-case input.

If students can only complete the provided TODO regions with repeated hints, that is *guided proficiency*, not the above independent outcome.

## Proposed exit assessment — 100 points, roughly 60–80 minutes

Do **not** enlarge every chapter to force more theory. Use targeted proof of transfer after Core study.

| Exercise | Skill tested | Points |
|---|---|---:|
| **A. Pointer & Function (15–20 min)**: from scratch, implement `swap(int *a,int *b)`, invoke it and check a boundary-safe array lookup | 151 Core, functions prerequisite | 20 |
| **B. Student Records (15–20 min)**: define `Student`, initialize 3 entries, select top score, implement a function that updates one record by pointer | 161 Core, arrays/functions prerequisite | 25 |
| **C. File Summary (20–25 min)**: read three or more numeric lines from a supplied text file, print count and average, safely handle missing/empty/malformed file and close it | 171 Core | 30 |
| **D. Dynamic Array (15–20 min)**: allocate `n=5` ints via `malloc(n*sizeof *p)`, test NULL, initialize/sum, print and `free`; explain why use-after-free is invalid | 181 Core | 25 |

Suggested rubric across problems: **correct behavior 55%**, **proper C constructs and clear decomposition 20%**, **error/edge handling 15%**, **GCC compile/warnings and resource cleanup 10%**. A suggested passing criterion is **70/100 overall AND at least 50% on each problem**, with **no unchecked critical invalid access**. This criterion is an instructor-defined proposal, not an existing grading policy.

### One optional integrated capstone (after, not inside mandatory lesson count)

**Sensor Report:** read a count from input; allocate an array of sensor records sized to that count; populate valid readings; compute average using a function; write a summary to a text file; close and free resources on all relevant paths. Provide a fixed small input scenario and one malformed-file case. This can replace, not supplement, the separate exit test if class time is limited. For 1st year, supply only the specification and target output, not full starter logic; complexity and runtime input size must remain controlled.

## Targeted corrections and decisions

- **151:** Keep 6 Core + 2 Optional lessons. Keep 4 Core coding tasks; output-parameter and sensor extra work can remain Optional.
- **161:** Keep 6 Core + 2 Optional. **Fixed P5**: earlier text asked to modify the original through a pointer, but starter and reference output only demonstrate independent copying; now the prompt matches `b.score=90`, leaving `a.score=70`. Pointer updates are already exercised by P2.
- **171:** Keep current 8 distinct stages and their independent interactive models. P1 and P2 are Core practice priorities; **recommend one short required `fgets`/`fputs` micro-exercise** if the intended exit outcome includes copying/processing lines. Keep full P3–P6 as optional extensions. **Fixed Chapter number** on the coding-practice page: 7 → 17.
- **181:** Keep 4 Core + 4 Optional. `malloc`/`free`, `NULL`, element initialization and correct lifetime are sufficient for the basic goal. Do not require `calloc`/`realloc` or size-overflow arithmetic in the first Core coding assessment.
- **Progress interpretation:** a checked activity or browser self-reported GCC confirmation **does not certify independent proficiency**. Use an externally proctored or in-class compiled program as proof.

## Verification status

Reviewed current source files and lesson metadata directly from GitHub; content-to-task alignment and critical Core coverage inspected. JavaScript-generated feedback and interactive simulations are not actual compiler execution.

Changes during this review: corrected Structures P5 wording, refreshed its practice data version, and corrected File I/O practice Chapter heading. This report is a **curriculum/assessment judgment**, not an empirical student learning outcome study. Comprehensive CI, browser QA, and all individual GCC samples were **not** rerun in this review.
