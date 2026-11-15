# Sensor Log Step Trace + Robust File I/O Extension — QA 2026-11-15

**Curriculum:** C Programming Chapter 7 / Step 07 · Sensor Log.  
**Original code preserved:** `c-programming/file-io/examples/sensor_log_analyzer.c` using `fscanf(fp, "%lf %lf", ...)`.  
**Additional code:** `c-programming/file-io/examples/sensor_log_robust_fgets.c`, using `fgets` and `strtod`.  
**Website:** `c-programming/file-io/index.html`, shared design tokens and Step 07 extensions.

## Q1 — Visualize the existing fscanf loop

- **Part A · Visual Trace** appears after the existing editable sensor run.
- Controls: First, Previous, Next Read, Last.
- Per attempted `fscanf`: actual return value (`2`, `1`, `0`, `EOF`), converted values, accumulated count/sum/average, alert status, selected input offset.
- A partially successful input `0.1 ERROR` displays `1` and the newly converted time but not an invented value for the failed second conversion.
- EOF is a separate read attempt, not a property automatically inferred after the last successful pair.
- Important note: `fscanf` reads a stream of tokens and may cross newline boundaries.
- All student-editable strings are inserted using textContent to avoid HTML/script interpretation.

## Q2 — Continue with robust file I/O, not replace it

- **Part B · Robust File I/O** introduces an independent `fgets` → `strtod` → validate line → process record example.
- Strict line policy in this advanced example: exactly two finite decimal numbers on each line; reject extra/missing fields, blank/malformed lines, overlong lines, invalid/overflow numeric values.
- If the line is invalid, report its line number to stderr and exit nonzero.
- The exercise uses the **same edited sensor_log.txt and threshold** as Part A.
- Side-by-side output comparison shows exit code, accepted record count, alert count, average, stdout, and stderr.
- Original fopen/fscanf code remains available and downloadable. The robust source is a separate additional file.
- This is not a universal production parser: line length cap, locale, numeric forms and I/O edge cases are explicit limitations.

## GCC validation
A local GCC C11 compilation was performed on the robust source algorithm, with:
`-std=c11 -Wall -Wextra -Wpedantic -Werror -O0 -lm`.

Observed results:
- Canonical four lines: `ALERT 0.3: 3.82`, `Count = 4`, `Average = 2.840`.
- Split first pair over two lines: nonzero exit, `Invalid record at line 1`.
- Empty file: `No sensor records` (success).
- Invalid second field on line 2: nonzero exit, `Invalid record at line 2`.

The original `fscanf` source was not changed. This local GCC test reproduces the committed robust algorithm; the live GitHub Pages user interface is not an actual GCC runner.

## JavaScript regression
- 10 comparison checks passed, including normal dataset agreement, cross-line discrepancy, malformed/partial/extra columns, long lines, empty file, threshold boundary, and intermediate variable snapshots.
- All four relevant JS files parsed without syntax errors.
- The new interactive elements have unique IDs and references exist in HTML.
- C semantics remain approximate in the JavaScript models: finite decimal/exponent notation and student-size bounded inputs, not exhaustive libc behavior.
- WCAG 2.2 AA is the shared design target. Dynamic themes, mobile/keyboard and full browser screenshot QA still need an actual browser acceptance test.

## Important educational finding

Input:
```text
0.0
2.51
0.1 2.55
```
- `fscanf("%lf %lf")`: treats line breaks as whitespace and successfully parses two pairs.
- `fgets` then `strtod` validation: rejects first physical line, which contains only one value.

Students should first learn why the simple technique works, then see a specific failure mode and justify a stricter format contract.

## Further limitations
- Students cannot run arbitrary C inside GitHub Pages; both visualization paths are clearly marked SIMULATED.
- OS-dependent error injection and true byte-exact fscanf grammar are not fully simulated.
- Error handling is intentionally fail-fast rather than attempting silent recovery from malformed sensor logs.
- A real study of student learning outcomes and browser UI still requires representative student observations.
