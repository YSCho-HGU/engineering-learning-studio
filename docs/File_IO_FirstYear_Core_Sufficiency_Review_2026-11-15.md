# File I/O First-Year Core Learning Sufficiency Review — 2026-11-15

**Project:** Engineering Learning Studio / C Programming / Chapter 7 File I/O  
**Target learners:** first-year university students, not second-year engineering specialists  
**Basis:** the actual connected Google Drive textbook `171_C_File_IO_Rev8.docx` (particularly §§7.1.1, 7.3, 7.4, 7.5.2, 7.5.3 and 7.7), current eight-step GitHub lessons and the P1–P6 practice requirements.  
**Status:** Source changes checked into GitHub; browser rendering and student learning gains have not been independently measured.

## Findings before changes

The existing eight-step core explained persistence, stream handles, r/w/a modes, text I/O functions, EOF, struct records, sensor logs and integration. Existing prediction/simulation activities were conceptually useful.

However, **concept recognition was not yet consistently supported by a short, independent code-application task**:

| Lesson | Important gap in required practice | Remedy in this change |
|---|---|---|
| 03 | File modes practiced, but direct code decision after failed fopen weak | Two choices covering fp==NULL and missing-file behavior |
| 04 | Function-name recognition without independently applying line-vs-token boundary | Two choices on fscanf(%s) versus fgets(), and conversion count |
| 05 | EOF cases simulated but incorrect while(!feof(fp)) not directly compared | Two choices on read-return loop and when EOF is flagged |
| 06 | Save/load simulated, but textbook §7.5.2 "File I/O with Functions" not in required exercises | Two choices on saveStudent(s) delegation and function responsibilities |
| 08 | Fragment completion did not require interpreting a new malformed input | Independent trace of 4.0, 6.0, ABC; count/sum and matching-failure vs EOF |

**No extra required material was added to lessons 01, 02 and 07:** their existing essential activities already covered persistence, stream routing and sensor computation/trace. Long source listings and robust parser are still optional.

## Implementation

- Five `필수 적용` panels added to Steps 03, 04, 05, 06, 08.
- Each panel contains a *small labeled C fragment*, two first-year-friendly reasoning questions, a `적용 결과 확인` button, reset, delayed feedback and two short, specific explanations.
- The core transfer exercises have **10 questions total**; they are formative practice and **not** independent GCC compile/run tests or a certification of coding mastery.
- Answers are withheld until both selections are submitted.
- Basic conceptual feedback is available without a server; the page is static GitHub Pages.
- Student progress remains the existing 8-step activity indicator; these new exercises are **not improperly counted as a mastery badge**.
- The last step now explicitly recommends doing P1 Write Numbers and P2 Read and Average as minimum actual C writing practice; P3–P6 remain available in the Practice Lab per course guidance.
- Shared light/dark design system tokens and responsive layouts apply to the new panels.
- Original M3/M4 prediction simulation, sensor variable trace, robust fgets optional module, and student worksheets are preserved.

### Conceptual answer key

| Step | Q1 | Q2 | Why |
|---|---|---|---|
| 03 | B | B | test `fp == NULL`; r does not create a missing file |
| 04 | A | B | token stops at whitespace; 2 conversions return 2 |
| 05 | C | A | use `fscanf(...) == 1`; EOF is observed only after a failed read |
| 06 | A | B | `main` calls helper, helper manages file resources |
| 08 | B | C | malformed third token stops at count=2/sum=10.0, matching failure is not clean EOF |

## Educational recommendation and completion criteria

A first-year learner has a **credible conceptual foundation** when they can independently explain and transfer:
1. Persistence and stream abstraction.
2. fopen/fclose plus NULL checks and mode selection.
3. A read/write call's expected return value.
4. Why a safe input loop tests conversion success and does not pre-test feof.
5. How struct records become text and how file logic can be organized into functions.
6. How a simple sensor log aggregates valid records and triggers alerts.

However, **reading and clicking through the site alone is insufficient evidence of independent C programming skill**. At least one file-writing task and one file-reading task should be submitted and GCC-tested, including a missing-file or malformed-input test. The Practice Lab currently offers static pattern-based hints, not actual compilation.

## Quality check and limitations

Source inspection confirmed eight stage elements, eight core guidance panels and five new transfer panels. All ten multiple-choice entries, their associated buttons and IDs, script links and relevant JavaScript syntax are statically checked in this turn. Existing scripts and links are preserved.

Not yet verified: deployed GitHub Pages/browser E2E flow, human screen-reader support, 200% zoom and student usability test. Strict WCAG 2.2 AA conformance has not been independently certified.

## Next student-pilot metrics

Use a pre-/post concept test and a two-task independent coding exercise. Proposed evidence: select the safe fopen branch, explain why fgets handles spaces, distinguish EOF from a matching failure, implement P1 and P2 with correct open/close, and explain two different test inputs. Compare correct GCC execution outcomes, not just button clicks.
