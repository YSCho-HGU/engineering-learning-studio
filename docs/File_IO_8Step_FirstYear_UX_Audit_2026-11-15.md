# File I/O — First-Year Student UX & Eight-Step Learning Scope Audit

**Date:** 2026-11-15  
**Audience:** 1st-year undergraduate C Programming learners.  
**Status:** GitHub source implementation and deterministic QA complete; deployed browser visual/keyboard testing pending.

## Goals

1. Reduce cognitive load in Step 07's C statement trace: make the next action and the changed variables easy to identify.
2. Apply a consistent *mandatory core + optional advanced* structure to **all eight steps** without deleting learning material, changing official assessment requirements, or claiming code simulations are GCC runs.

## Q1: Step 07 variable trace UX changes

- A compact **Before → After** summary appears above the variable table.
- **Changed or explicitly reassigned values** are visible first; unchanged variables are hidden by default.
- A checkbox **변화 없는 변수도 모두 표시** reveals all variable rows.
- The status is conveyed with text **값 변경 / 재대입 · 값 동일 / 변화 없음** as well as a border, not just color.
- The source statement and current-variable panel remain adjacent at desktop sizes and stack on mobile.
- Initial step controls are disabled until **Simulate Run**; modifying the dataset/threshold clears stale trace.
- The first-year default still traces only the first valid record's four basic statements (`fscanf → sum → count → condition`), with all-record trace and full EOF/error trace in optional modes.
- **Simulation boundary:** JavaScript behavior models selected C semantics; the original downloadable C source remains unchanged.

## Q2: Consistent core / optional scopes across all eight learning steps

| Step | Mandatory 1st-year objective | Optional extension |
|---|---|---|
| 01 | Explain why file contents persist beyond program memory | Examine full C error-handling source (collapsed by default) |
| 02 | Differentiate stdin, stdout, stderr and FILE * | Explore advanced redirection and stderr usage |
| 03 | Predict r/w/a effects on file contents | Change working directory and test missing-file behaviors |
| 04 | Select suitable text I/O functions and understand read counts | Examine complete open/read/write/close patterns |
| 05 | Distinguish clean EOF and invalid numeric input | Explore injected I/O failure, feof/ferror diagnostics |
| 06 | Serialize/load a Student structure as text | Examine full read/write code and advanced format checks (full example collapsed) |
| 07 | Interpret sensor_log.txt, compute count/sum/mean and alerts, trace first record | Compare fscanf with strict fgets/strtod, inspect errors and complete trace (advanced Part B collapsed) |
| 08 | Select correct file-processing order and loop condition | Persistent Record Manager and extended error-diagnosis checklist (collapsed) |

Each step now has exactly one **필수 학습** panel with an observable completion activity and one **선택 심화** information disclosure. Selected long source examples and advanced challenges are genuinely collapsed; conceptual quizzes and core exercises remain visible.

## Inclusive UI/UX considerations

- Uses existing `assets/design-system.css` semantic light/dark design tokens, explicit text labels and 44px-style interactive sizing.
- The optional content uses native HTML `details/summary`, which supports keyboard access without extra JavaScript.
- Updated Step 07 variable panel uses text labels as well as contrast/borders.
- In the changed-only view, secondary derived states (`sum/count`, alert flag) are distinguished from C variables, and prior value is shown beside the new value.
- The `sensor-variable-diff-list` no longer announces every individual row dynamically; one `role=status` summary announces the new state to reduce repetitive screen-reader announcements.
- Responsive variable grid and course-scope panels allow mobile use without side-by-side forced widths.

## Verification

**24/24 source-level and deterministic checks passed**:
- 8 stages and 8 mandatory + 8 optional guidance panels present.
- Default-closed advanced materials preserved and Practice Lab remains linked.
- All HTML ID references from main, integrated, and sensor JS exist; no duplicate IDs.
- JavaScript parsing succeeds for the relevant scripts.
- Step 07 source highlighting and changed-variable snapshots remain linked to the sensor model.
- `sum` updates separately from `count`; partial `fscanf` conversion changes time but not the previous value.
- New CSS and JS versions are loaded.

**Not yet verified:** real GitHub Pages browser render, focus sequence, WCAG 2.2 AA end-to-end, 200% zoom, mobile screenshot inspection, screen-reader user testing, and first-year student measured outcomes.

## Acceptance recommendation

Conduct 5–8 representative first-year student observations:
- Can students start Step 07 without being distracted by advanced code?
- Can they predict what happens to `sum` and `count` after one iteration?
- Can they find the changed-variable explanation in under a minute, without instructor help?
- Do they understand that `fscanf` simulation is not a real GCC execution?
- Can they identify optional advanced learning without feeling required to complete it?

This project should measure independent performance on a new file-I/O task rather than using course completion clicks as a proxy for C coding mastery.
