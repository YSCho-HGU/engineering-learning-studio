# Integrated C Learning Journey — Release Review

**Scope:** Pointer 151 → Structure 161 → File I/O 171 (24 core lessons; 18 P1–P6 coding exercises).

## Q1: Three-dimensional learning evidence

- **Activity Reviewed (0–8):** records explicit review of a learning step. Not an assessment pass.
- **Concept Check Passed (0–8):** records a correct conceptual answer. Pointer/Structure use their existing three-choice code-output quiz; File I/O uses correct stage quiz and fully correct two-question transfer checks.
- **Coding (0–6):** separate **self-reported** GCC compilation and output-comparison confirmation per exercise. Any subsequent edit revokes that confirmation. Neither the browser nor a static hint certifies actual C code correctness.
- Browser localStorage only, with separate keys so progress from the existing File I/O course is not lost. File I/O existing activity semantics are preserved.
- The consolidated dashboard labels each evidence independently; unequal counts are valid.

## Q2: P1–P6 coding practice

- Created `c-programming/pointer/practice/` and `c-programming/structure/practice/`.
- Each has a C source editor, per-exercise draft autosave, six selectable exercises, static token hints, starter restoration, .c download and GCC self-report.
- Kept the existing dedicated `c-programming/file-io/practice/` editor and preserved its subject-specific assessments. Added per-exercise GCC self-report, autosave and reliable reset semantics there.
- Static code hints **cannot** verify compilation, semantic behavior, undefined behavior or correctness. The intended final test is GCC C11 with `-Wall -Wextra -Wpedantic -Werror` and comparison with the supplied reference.
- Coding self-reports must not be confused with either assessment results or verified compiler execution.

## Q3: Integrated navigation

- Created `c-programming/learning-journey/` as a common 3-chapter dashboard.
- Added a prominent entry to the C Programming home.
- Pointer → Structure → File I/O next-course sequence and integrated navigation; each step page preserves its existing eight-part learning material.
- Unified three-phase descriptions and common conceptual/coding status naming without rewriting the mature File I/O mission-specific code.

## Regression test source

- Existing `tests/c-journey-qa.mjs`: GCC compile/run for the 16 published Pointer/Structure reference snippets plus browser screenshots and prior UI assertions.
- New `tests/c-integrated-qa.mjs`: cross-course navigation and evidence source contracts, JavaScript syntax, Pointer/Structure quiz vs activity independence, coding editor autosave and confirmation revocation, File I/O concept and editor checks.
- GitHub Actions runs both scripts for relevant changes and captures reports.

## Verification record

- GitHub connector read-back confirmed: all three course routes, two new coding practice routes, integrated dashboard, and all expected script references exist.
- Source review confirmed five modified runtime JS files parse successfully; additional checks confirmed draft storage and GCC self-report revocation.
- **Actual Chromium CI jobs, GCC run artifacts, deployment propagation and screenshots were not available for inspection at this stage.** They must be reviewed before assigning a 'browser verified / release approved' status.

## Items to audit on first real browser run

1. Mobile 390px width: no clipping of code, code editor, navigation, memory diagrams.
2. Light/Dark: text contrast, focus styles, inputs, scrollbars.
3. Pointer/Structure quiz: correct answer increments only Concept; Activity advances only when explicitly reviewed.
4. Task editor: P1 draft survives P1→P2→P1 and page reload; code edit revokes GCC self-report.
5. File I/O lesson and sensor tracing remain working after separate concept status was added.
6. Integrated hub: 8/8 activity, 8/8 concept and 6/6 coding counts never conflate or overstate evidence.
