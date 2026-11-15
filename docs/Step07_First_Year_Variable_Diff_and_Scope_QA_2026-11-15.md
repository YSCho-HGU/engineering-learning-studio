# Step 07 — First-Year C Learning: Variable Before/After & Learning Scope

**Date:** 2026-11-15  
**Status:** Implemented in GitHub default branch; static/deterministic regression checks passed; deployed browser E2E not verified.  
**Source basis:** `171_C_File_IO_Rev8.docx` (7.3–7.7), especially 7.5.3 Sensor Log. The textbook introduces sensor logs as practical text-based data, not a requirement to build a production-grade numerical parser.

## Q1. Before and After variable comparisons

New module: `c-programming/file-io/sensor-variable-diff.js`.

- Each selected C statement in the Sensor Log simulator shows previous and current values of `fields`, `time_s`, `value`, `sum`, and `count`.
- `sum/count` and the alert indicator are labeled **derived teaching displays**, not additional C variables.
- Status labels are explicit: **값 변경**, **변화 없음**, **재대입 · 값 동일**. This avoids using color alone to express differences.
- Partial conversion `fscanf(...) == 1`: `time_s` is updated and `value` retains its previous value. A failed assignment must not invent a new sensor value.
- `sum += value` and `count++` are two distinct steps: while sum changes, count does not; after count++, sum remains the same.
- Error/EOF and stdout/stderr paths remain available. Source mapping is based on the unchanged `sensor_log_analyzer.c` listing.
- The browser remains a pedagogical JavaScript **simulation**, not actual GCC execution.

## Q3. Difficulty review — first-year C course

### Main finding

The current sensor lesson contains much more than first-year students need in a single mandatory unit. A full 47-line source listing, fine-grained execution trace, robust line-by-line parsing with `fgets`, `strtod`, `errno`, floating-point finiteness checks, and malformed line assessments are useful extensions but can overwhelm beginners when presented all at once.

### Essential learning (recommended 20–25 min; classroom estimate, not measured)

1. Interpret `sensor_log.txt`: 2 text fields per record, parsed as `double`.
2. Understand `FILE *fp = fopen(...)`, `NULL` check and `fclose`.
3. Predict whether `fscanf(fp,"%lf %lf",...)` yields 2 on a valid record, and understand clean EOF.
4. Inspect a **single first-record execution**: `fscanf` → `sum += value` → `count++` → threshold condition.
5. Edit one measurement, run the simulated example, explain the average/alert difference.

**Minimum success evidence:** Student can explain why count changes, how average is calculated, and why a `double` is used. This is not evidence of independent coding mastery.

### Suggested additional core practice (when time allows)

- Select “필수 확장” to trace all records, alert branch, final average.
- Apply a small variation to the threshold or record values.
- Try a simple malformed field and predict the returned number of successful conversions.

### Optional advanced learning (recommended 20–30 min; optional)

- Open “선택 심화” section for `fgets` → `strtod` → validate line → process.
- Explain why `fscanf` may pair values across newlines but a strict line parser rejects the same data.
- Recognize a partial conversion, malformed record, extra column, and overlong record.
- Compare output/diagnostics and answer three formative questions with written reasoning.
- No expectation that every first-year student independently writes `strtod`/ `errno` / `isfinite` handling in this File I/O introduction.

### Student-facing changes

- Above the exercise, essential and advanced scopes are explicitly separated.
- The original complete C source is preserved but collapsed behind a labelled details control (available for reference/download).
- Part A default mode shows only **four statements of the first successful read**; users can switch to the full basic process or an advanced full error-path trace.
- Part B robust parsing and assessment are preserved inside **closed by default** optional details.
- No change to existing P1–P6 assignment requirements or official grading policy.

## Verification

**14/14 targeted deterministic/static checks passed:**
- All required JS files parse.
- All HTML IDs are unique and referenced trace UI IDs exist.
- First-year mode has 4 C-statement snapshots (read, sum, count, condition).
- Core and detailed traces contain 21 and 26 snapshots, respectively, for default sensor data.
- Partial fscanf correctly updates only `time_s`, not `value`.
- Both advanced and complete source details sections are available and collapsed.
- Assessment and comparison links are preserved.
- Current CSS and JS versions are loaded.

**Open quality gates:**
- Browser screenshot QA in manual/system light and dark modes, desktop and mobile; 200% zoom.
- Keyboard navigation and screen-reader announcements for changed variables.
- A 5–8-student usability pilot and 1st-year learning outcome assessments.

## Recommended teaching allocation

Use Step 07 as a **20–25 minute essential learning activity** within the File I/O unit. Offer a **20–30 minute optional engineering challenge** to students ready for more rigorous file validation. Distinguish estimated instructional time from measured learner behavior.

Do not equate browser simulated success or completion clicks with independent C coding proficiency.
