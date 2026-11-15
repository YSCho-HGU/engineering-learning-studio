# File I/O Code Style and Editable Sensor Log QA — 2026-11-15

**Scope:** File I/O Learning Journey Steps 01–08 and interactive Sensor Log (Step 07).  
**Reference:** Google Drive `171_C_File_IO_Rev8.docx`; `docs/C_File_IO_Code_Style_Guide_v1.0.md`.  
**Last development stage:** `sensor-model.js`, `app.js`, `index.html`, `unified-course.css`.

## Q1. Full eight-step style review

| Step | Code level / form | Review and change |
|---|---|---|
| 01 Persistence | Beginner, complete C code | Replaced unchecked illustration with `FILE *fp;` followed by `fp = fopen(...)`, NULL check, write return, fclose return; downloadable `persistence_beginner.c` |
| 02 Streams | Conceptual fragment | `fprintf(stdout,...)` illustrates routing; file-stream examples assume `fp` was previously opened; not a standalone runnable sample |
| 03 File Modes | Guided simulation; mode-specific C listing | Keep declaration/assignment separated; single code path per mode; explicitly SIMULATED |
| 04 Text I/O | Function-selection fragments | Explicitly labeled partial code assuming `fp` already open; select function by input format, return count, and destination |
| 05 EOF / errors | Intermediate complete simulated C listing | Verify `fscanf(...) == 1`, `feof()`, `ferror()`; simulator models return 1, 0, EOF separately |
| 06 Structure | Intermediate full C example | `FILE *fp = fopen(...)`; added explicit `perror()` on opening/closing failures; downloadable `student_record_middle.c` |
| 07 Sensor Log | Practical complete C11 example | Clear variables, `fopen` check, fscanf count==2, differentiated partial conversion, clean EOF, ferror, fclose; actual sample and downloadable code |
| 08 Transfer | Deliberately incomplete learner code | Improved indentation/braces and labeled **PRACTICE FRAGMENT** instead of a complete production-ready program; select return-value condition then extend errors as challenge |

**Educational progression**: explicit open→check→use→close first; mid-course declaration-with-initializer; later diagnostics and resource management. This is a maintainability-focused recommendation, not a measured industry popularity statistic.

## Q2. Student-editable sensor_log.txt
- Editable text content, six selectable presets, restore-original, current sensor file download.
- `threshold` slider modifies the model and also the displayed/downloadable C source's `const double threshold` value.
- `Simulate Run` shows parsed record count, mean, threshold alerts, stdout, stderr, return-value trace, exit code.
- Bad second field and truncated final record return 1 (one field converted); invalid first field returns 0; normal empty/finished input returns EOF.
- Whitespace including newline is separated by scanf; a pair can span lines. This is explicitly documented as a subtle format behavior.
- Failures are marked; partial results are diagnostic rather than incorrectly shown as a successful mean.
- No attempt to execute arbitrary C code in GitHub Pages. Browser experiment labeled SIMULATED.

## Validation performed

**GCC 14.2.0 / C11:** `-std=c11 -Wall -Wextra -Wpedantic -Werror -O0`. 3 representative complete programs compiled without warnings: Step 01 persistence, Step 06 structure, Step 07 sensor analyzer. 8 output/behavior checks passed including save/reload, valid sensor file, more alerts, malformed token, missing value, empty file, and a record split over lines.

**Deterministic model:** 10 scenario tests passed: canonical sample, increased alerts, malformed/partial input, empty file, newline whitespace, invalid first field, threshold boundary, unsupported number, 20k text cap.

**Static integration QA:** 8 stages preserved; no duplicate HTML IDs; no missing IDs in `app.js`; app, sensor model, integrated lab JS all parse. Displayed sensor sample equals tracked `data/sensor_log.txt`; initial displayed C source equals tracked `examples/sensor_log_analyzer.c`.

## Known limitations / remaining quality gates
- Browser E2E/UI visual inspection, keyboard-only operation and mobile screen rendering not independently completed; WCAG 2.2 AA claim remains a design target, not a certified audit.
- The browser parser supports bounded finite decimal and exponent notation and is not a byte-for-byte clone of every C library `fscanf` floating-point grammar. NaN, Inf and hex forms are explicitly unsupported.
- Input is capped at 20,000 characters, with no server-side files or persistence.
- The C example uses a token-based `fscanf` loop. It is a pedagogical program, not a production sensor ingestion parser. A production version may use `fgets` and strict line-level validation.
- One displayed Step 08 exercise is intentionally a fragment and is not a fully validated production program. M3/M4 browser controls use deterministic models rather than real GCC.
- A configurable threshold in the browser is reflected in the displayed C program and can be downloaded, but the browser run is still JavaScript emulation. For actual C output, download both `sensor_log.txt` and current `sensor_log_analyzer.c` into the same directory and compile.
