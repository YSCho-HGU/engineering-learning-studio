# Chapter 171 — File I/O UI/UX and Required-Learning Review

**Review date:** 2026-11-16  
**Audience:** First-year C Programming learners  
**Scope:** `c-programming/file-io/` (8 concept stages), `practice/` (P1–P6 + M1), browser-based conceptual explorers, mobile layout and learning-flow consistency.

## Outcome

Core learning sequence: **01–05 concepts and file-return behavior → 06–08 applications and checks → P1 write → P2 read/average → M1 fgets/fputs one-line copy**. P3–P6 remain optional extensions. This sequencing expresses minimum mastery without requiring additional concepts merely to reach a fixed count.

## Problems found and corrections

| Observation | Change | Rationale |
|---|---|---|
| Large hero and three-phase cards pushed the lesson below the fold | Compact header; replace always-visible three-phase cards with compact required-path links and expandable detailed roadmap | Reach lesson and core tasks sooner |
| Core I/O practice was buried among seven tasks | Add P1/P2/M1 first-level shortcuts | Reduce navigation/choice burden |
| Full task sidebar restricted code-editor width | Collapse the complete seven-task list and use a single-column practice editor layout | More usable source editing, especially desktop and mobile |
| M1 instructions appeared even on P1/P2 | Show M1 download/instructions only when M1 is selected | Avoid irrelevant context |
| Long warning occupied space above the actual task | Keep warning content accessible in an expandable details section | Preserve technical caveats without blocking work |
| Phase and assignment guidance inconsistently emphasized P1–P6 | Standardize core sequence P1 → P2 → M1, mark P3–P6 optional | Accurate first-year workload expectations |
| Eight-step side menu was tall at mobile sizes | Compact labels, four columns on small screens, accessible step buttons | More of the active lesson visible |
| Existing M1/P1/P2 browser tests clicked now-collapsed task list | Update selectors to visible core shortcuts; add dedicated UX regression | Protect restored navigation and task switch behavior |

## What was intentionally preserved

- All **eight** Chapter 17 learning stages and original navigation `data-nav=0..7`.
- Existing detailed file-mode, EOF, sensor trace and transfer experiments, rubric and concept checks.
- P1–P6 plus M1 task definitions, identifiers, download and static check behavior.
- Original browser localStorage keys and stored C code drafts; no deletion or renumbering.
- P1/P2 educational flow explorer and M1 buffer explorer, each visibly differentiated from actual GCC execution.
- Theme choices and Neutral Dark visual tokens; changes rely on CSS overrides rather than replacing the page engine.

## Required learning checkpoints

1. **Read/write purpose:** Distinguish volatile process state and persistent file content.
2. **Stream model:** Know `stdin`, `stdout`, `stderr`, `FILE *` as appropriate.
3. **Open modes:** Predict `r`, `w`, `a` and `fopen` failure behavior.
4. **Read/write functions:** Select `fprintf`, `fscanf`, `fgets` for the data type.
5. **EOF versus malformed input:** Understand `fscanf` success count 1 or 2, 0 conversion failure, EOF, `ferror` and empty file.
6. **Structured records and applications:** Reason about `struct` values and safe I/O.
7. **Sensor data:** Trace a realistic measurement log.
8. **Consolidation:** Explain file mode, return-value checks and cleanup.
9. **Core code practice:** P1 → P2 → M1, then compile and inspect actual file contents with GCC.

**Optional:** Additional P3 full-line copy, P4/P5 structured record storage, P6 sensor alerts, deeper implementation/error scenarios.

## Technical validation

**Static verification performed:** 8 Chapter sections and nav buttons preserved; 2 lesson jump actions and 3 core task links present; expandable roadmap and task list present; P1/P2/M1 visualization containers remain linked; JavaScript syntax checked for the two page controllers; all changes committed to GitHub.

**Automated browser regression added/updated:**
- `tests/c-fileio-ux-browser.mjs`: 390px, 768px, 1280px; compact navigation, stage shortcut, P1/P2/M1 switching, optional list, code draft preservation and horizontal overflow
- `tests/c-fileio-core-browser.mjs`: P1/P2 normal and error state models
- `tests/c-fileio-buffer-browser.mjs`: M1 scenarios and step controls
- Workflow `.github/workflows/c-fileio-buffer.yml`

**Limitation:** The GitHub Actions and real browser test run results were not independently obtained in this session. Passing JavaScript syntax and static DOM checks do not establish responsive screenshot quality or successful end-to-end browser behavior. The learning models are not GCC runtimes.

## Future improvement priority

- Inspect mobile screenshots and keyboard/screen-reader behavior after CI runs.
- Validate real GCC output for example code, especially malformed input, EOF and fclose outcomes.
- Optionally integrate a single small instructor-observed coding check after P1/P2/M1, rather than adding more first-year theory lessons.
