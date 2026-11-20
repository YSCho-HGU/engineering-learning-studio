# Engineering Learning Studio · Unified Quality Standard v1.0

**Scope:** Signals & Systems (8 chapters, 62 labs), C Programming (18 planned, 8 published), and Logic Design (gate mini-lab prototype, future full course).

## Common quality gates

| Gate | Common meaning | Signals & Systems | C Programming | Logic Design prototype |
|---|---|---|---|---|
| G0 | Catalog and source contract | Chapter IDs, 62 lab IDs | 18 planned, 8 published; C learning data | Five gate types, mini-lab HTML |
| G1 | Independent reference results | Sampling, DTFT-specific oracles | GCC C11 compile and expected stdout | 5 gates × 4 input combinations |
| G2 | Browser interaction | Sliders, graphs, 6.1, other lab navigations | 8 chapter pages and learning controls | A/B input toggles, gate selection |
| G3 | Theme/language/a11y | ENG/KR/Mixed + theme | ENG/KR/Mixed + theme | Host mini-lab theme and language |
| G4 | Learning interaction | Predict/Observe/Interpret, sonification | Code tracing, coding exercises | Immediate truth-table output |
| G5 | State preservation | 62 stored progress IDs | Stored C source drafts, progress, unknown keys | **NOT_RUN** until a persistent Logic course exists |
| G6 | Screenshot/viewport | 248 states | 8 published units × 2 widths × 2 themes = 32 | 2 widths × 2 themes = 4 pilot screenshots |
| G7 | Evidence + release status | Read-only QA JSON + manual pending | Read-only QA JSON + manual pending | Pilot snapshot, future course explicitly NOT_RUN |

**Do not interpret equal gate names as identical test implementations.** Only G0–G7 definitions are shared. Specific independent oracles and validators remain course-specific.

## Status and approval rules

- `PASS` means the *named automated test actually ran and passed*. `FAIL` means it ran and failed. `NOT_RUN` means it was not run/does not exist; it **never** counts as PASS.
- Automatic green result is `AUTOMATED_PASS_MANUAL_PENDING`, not final educational approval.
- Manual M1 graph/code review, M2 independent technical reference, and M3 student learning clarity remain `PENDING` until signed off.
- Logic Design mini-lab may earn `PILOT_PASS_FUTURE_COURSE_PENDING` after exact truth tables and visual checks; this does **not** imply a completed 2027 Logic Design curriculum.
- Never overwrite or migrate `els-journey-*`, `els-code-*`, `els-code-evidence-*`, `els-ss-lab-progress-v1`, or unrelated localStorage keys.

## Evidence and data flow

S&S publishes `qa-dashboard/latest.json` in its own repository. C and Logic publish `qa-dashboard/c-latest.json` and `qa-dashboard/logic-latest.json` in the Studio repository. The unified `/admin/` view reads these public, *sanitized* data snapshots without using the GitHub editing token.

Each GitHub Actions run stores detailed test evidence as an artifact. Published snapshots contain status, timestamps, chapter IDs, counts, error messages, commit hashes and report links only. Never include passwords, saved source drafts, tokens, individual progress, personal data, or screenshots containing such data.

**Chapter/unit status must be grounded in that unit's observed tests.** A successful course-level check is not automatically a unit-level pass unless it actually enumerated that unit.

## New Logic Design chapters (future)

When a `logic-design/course-catalog.json` is created, implement and register the same eight gates per *published* module, including reference truth tables for combinational circuits and state-transition traces for sequential circuits. Add reset/clock/preset propagation and register timing checks, with explicit assumptions about edge-triggering and propagation delays. Keep all unimplemented content `NOT_RUN`.

## CI release protocol

1. Add exact expected outputs for the changed concept, run the targeted unit tests and maintain unaffected course baselines.
2. Run the full relevant snapshot workflow (GitHub Actions G0–G7), capturing screenshots and logs.
3. Publish an immutable run link and the updated public snapshot; the administrator reads the latest published snapshot on refresh.
4. Require manual M1–M3 review before marking educational content approved.

Reference: [S&S detailed QA standard](https://github.com/YSCho-HGU/signals-systems-visual-lab/blob/main/docs/qa/SS_QA_STANDARD.md).
