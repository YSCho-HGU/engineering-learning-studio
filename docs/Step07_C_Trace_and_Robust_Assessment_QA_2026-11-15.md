# Step 07 — C-Line Execution Trace and Robust I/O Assessment QA

**Date:** 2026-11-15  
**Implementation:** Engineering Learning Studio / C Programming / File I/O / Step 07  
**Status:** repository implementation and deterministic tests complete; browser visual & classroom evaluation pending.

## Q1 — C-statement synchronized learning view

Added `sensor-code-trace.js` and changed `sensor-trace-ui.js`. The Step 07 Part A uses the original, unchanged `sensor_log_analyzer.c`, and automatically displays its exact source in a line-numbered code panel. It highlights a source line as students traverse snapshots using **First / Previous statement / Next C statement / Last**.

Tracked C semantics:
1. `fscanf(fp, "%lf %lf", &time_s, &value)` assigns only successfully converted fields and returns 2, 1, 0 or EOF.
2. On a two-field conversion, `sum += value` happens before `count++`.
3. The threshold condition is evaluated after both updates; `printf` is only traversed when true.
4. EOF and mismatches stop the loop; `sum` and `count` stay unchanged for unsuccessful reads.
5. `ferror`/invalid conversion check, `fclose`, final average and return status are shown in execution order.
6. Current stdout/stderr is accumulated only when the corresponding C statement executes.
7. The separately displayed `sum/count` is a teaching aid, not a separate C variable.

Input highlights show the text segment consumed on each `fscanf` call. Source highlighting is generated from exact identifiers in the displayed C program and not from a fabricated simplified listing.

**Explicit approximation:** No real GCC execution occurs inside the browser; the simulator models a bounded subset of the C numeric input grammar and assumes successful fopen/fclose and no injected OS read errors.

## Q2 — Student assessment of fscanf versus fgets/strtod

The existing Part B side-by-side experiment remains. Under it, added three prediction and design-selection questions plus a required written justification:
- Q1: split lines (`0.0\n2.51\n0.1 2.55`) and cross-line token consumption.
- Q2: selecting line-based strict two-value validation.
- Q3: partial conversion when `0.1 ERROR` appears on line 2.

Answer key: **Q1 B, Q2 B, Q3 A**. Students must select all three and submit a written explanation of at least 20 characters before revealing explanations. Feedback reports per-item reasoning rather than only a score. The written explanation is not automatically judged for accuracy. Attempts may be reset, and localStorage stores the last submission in the user's browser.

**Important:** This is formative conceptual assessment, not a validated rubric for independently writing robust C code.

## Regression evidence

8 new source-to-snapshot tests passed:
- Every highlighted statement maps to the displayed source.
- `sum` update precedes `count` update, with separate snapshots.
- Alert output occurs only after threshold true.
- EOF preserves last successfully converted `time_s` and `value`.
- A partially successful conversion updates `time_s` without overwriting `value`.
- Failed record does not print a successful average.
- Empty input prints `No sensor records`.
- Original and robust C sample links and assessment elements are preserved.

Static source QA:
- No duplicate HTML IDs.
- Every constant DOM ID in the Step 07 trace UI exists.
- JavaScript files parse successfully.
- `sensor_log_analyzer.c` remains unchanged; `sensor_log_robust_fgets.c` remains separate.

## Open acceptance items

- Browser-based visual review in dark and light modes and mobile size.
- Keyboard focus order, screen-reader narration of code highlighting, and tab-index review.
- Actual GCC compilation of the new **UI-generated** threshold-altered download (previous source program was verified but this UI path has not yet been independently compiled).
- Student usability and learning-effect pilot.

## Release decision

The two learning activities are designed to be consecutive: **Understand the actual fscanf loop at the statement level → experiment with its limitations → choose and justify line-by-line robust parsing.** No existing C code path is replaced.
