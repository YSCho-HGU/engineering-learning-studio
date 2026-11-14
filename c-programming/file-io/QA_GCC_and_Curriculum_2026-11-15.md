# File I/O: GCC Verification and Textbook-to-Web Gap Analysis

Date: 2026-11-15  
Source: Google Drive `171_C_File_IO_Rev8.docx`  
Web: `c-programming/file-io/index.html` and `app.js`

## Q1. GCC verification

Test environment: GCC 14.2.0, `-std=c11 -Wall -Wextra -Wpedantic -Werror`.

| Representative web example | Compilation | Runtime check | Result |
|---|---|---|---|
| 7.3 read with `fgets`/`fputs` | PASS | 25.0 and 26.5 printed | PASS |
| 7.3 append with `fprintf` | PASS | preserves old lines, appends 27.2 | PASS |
| 7.4.4 `fscanf("%d", &x) == 1` | PASS | normal, malformed, empty inputs | PASS |
| 7.5.1 Student structure save/reload | PASS | prints `101 Mina 92.5` | PASS |
| 7.5.3 sensor threshold/mean | PASS | `ALERT 0.3: 3.82`; `Average = 2.840` | PASS |

Five representative complete programs compiled with zero warnings and seven runtime assertions passed. These were reconstructed from the published page; they are not a claim that every inline code fragment or every UI interaction was compiled or browser-tested.

### Technical findings

1. **Correct**: `fscanf(fp, "%d", &x) == 1` checks whether one integer conversion succeeded. EOF and matching failure are distinct; this condition handles both by ending the loop.
2. **Improvement needed**: the 7.4.4 example checks `ferror(fp)`, but does not distinguish malformed input from clean EOF. After the loop, check `feof(fp)` and report a format error when neither EOF nor stream error is set.
3. **Improvement needed**: the 7.5.1 record example does not report a failed or partial three-field conversion. Check the return value explicitly, and show an error path.
4. **Improvement needed**: the 7.5.3 sensor example similarly stops at a malformed pair without reporting the data-format error. Consider a stricter record/line parser for real sensor logs.
5. **Important scope**: `fgets` reads up to buffer capacity, not always a complete line. The teaching sample's short lines fit the 80-byte buffer. Teach long-line handling separately.
6. **Simulator scope**: a JavaScript model is not a C runtime. Test the UI controls and state transitions independently of GCC compilation.

## Q3. Textbook-to-web comparison

| Textbook section | Web coverage | Gap and next action | Priority |
|---|---|---|---|
| 7.1 Foundations, persistence | Stage 1 | Add prediction-before-reset and file-vs-memory check | Medium |
| 7.2 Streams, `FILE *`, standard streams | Stage 2 | Add stream redirection and `printf` vs `fprintf` comparison | Medium |
| 7.3 `fopen`, `fclose`, modes, paths | Stage 3 | Add missing-file, wrong working-directory, `NULL`, close failures | High |
| 7.4 `fprintf`, `fscanf`, `fgets`, `fputs`, `fgetc`, `fputc` | Stages 4–5 | `fputc` has no interactive activity; add long-line and partial conversion cases | High |
| 7.4.4 EOF and safe loops | Stage 5 | Add explicit EOF vs matching failure diagnostics | High |
| 7.5.1 Structure records | Stage 6 | Add malformed record, multiple records, capacity and bounds checks | High |
| 7.5.2 File I/O with functions | Not a dedicated lesson | Add `saveRecords()`/`loadRecords()` decomposition | High |
| 7.5.3 Sensor Log | Stage 7 | Add output `alerts.txt`, error cases, actual file format examples | High |
| 7.6 CSV, binary files, common mistakes | Not systematically covered | Add concise optional previews and error-debugging lab | Medium |
| 7.7.2 Six Check Yourself prompts | Partially covered by eight multiple-choice checks | Add short written explanations and code-tracing questions | Medium |
| 7.7.3 P1–P6 practical programming | Not implemented as six graded coding tasks | Add progressive coding practice with test cases | Critical |
| 7.7.4 Persistent Record Manager | Brief mini-challenge only | Build integrated save/load project | High |
| 7.7.5 Link to Chapter 8 | Not explicit | Add dynamic-memory transition | Low |
| 7.7.6 AI-assisted practice | Not explicit | Add critique-first, answer-later reflection prompt | Low |

## Recommended development order

1. Fix diagnostics for malformed numeric input and malformed records; add regression tests.
2. Implement P1–P3 as self-checking exercises (write numbers, average, copy lines).
3. Implement P4–P6 (structure array, highest score, sensor alert file) and file I/O functions.
4. Add optional CSV/binary preview and an integrated Persistent Record Manager.
5. Validate every UI button and control state in a real browser; repeat GCC checks on every source update.

## Pedagogical acceptance criteria

For each chapter task: **explain the goal → predict outcome → interact/execute → inspect C return values → debug a wrong case → complete code → self-check**. A correct multiple-choice response alone does not establish C programming proficiency.
