# Phase 0 — Baseline and Preservation Gate

**Recorded:** 2026-11-16 (Asia/Seoul)  
**Purpose:** Protect deployed C Programming and Signals & Systems before any platform-wide data or UI migration.

## Completed deliverables

| Deliverable | Repository/path | Verified |
|---|---|---|
| C units and storage contract snapshot | `docs/phase0/c-storage-baseline.json` | 18 planned / 8 published / 7 data-driven + File I/O |
| S&S course and storage contract | [SS `docs/phase0/ss-storage-baseline.json`](https://github.com/YSCho-HGU/signals-systems-visual-lab/blob/main/docs/phase0/ss-storage-baseline.json) | 8 chapters, 62 lab IDs |
| Source-only storage access inventory | `tests/phase0-storage-scan.mjs` in each repo | Both CI scans pass |
| C baseline browser regression | `tests/phase0-c-baseline.mjs` | 124/124 checks, Chromium desktop + mobile |
| S&S baseline browser regression | [SS `tests/phase0-ss-baseline.mjs`](https://github.com/YSCho-HGU/signals-systems-visual-lab/blob/main/tests/phase0-ss-baseline.mjs) | 53/53 checks, Chromium desktop + mobile |
| Repeatable CI and evidence artifacts | `.github/workflows/phase0-c-baseline.yml` and [SS phase0 workflow](https://github.com/YSCho-HGU/signals-systems-visual-lab/blob/main/.github/workflows/phase0-ss-baseline.yml) | Automated push/manual checks, JSON + screenshots |

### Passing reference runs

- [C/Studio Phase 0 run **43867641190**](https://github.com/YSCho-HGU/engineering-learning-studio/actions/runs/43867641190): 124/124 checks; source inventory 97 storage-access references (7 literal keys and 16 dynamic key-expression forms found by the scanner).
- [S&S Phase 0 run **43867654674**](https://github.com/YSCho-HGU/signals-systems-visual-lab/actions/runs/43867654674): 53/53 checks; source inventory 12 storage-access references (3 literal keys and 3 dynamic forms found by the scanner).
- S&S legacy visual regression suite also has a green [248-screen run **43858742127**](https://github.com/YSCho-HGU/signals-systems-visual-lab/actions/runs/43858742127) and a more recent green [visual audit **43866318252**](https://github.com/YSCho-HGU/signals-systems-visual-lab/actions/runs/43866318252).

**The scanner counts *source-code call sites*, not the number of students, actual browser records or unique runtime keys.** Dynamic values are represented as key expressions and must be reconciled with the manual contract. No student's actual browser storage is fetched, uploaded or enumerated.

## Baseline safeguards

1. **Non-destructive:** Tests use a new isolated Chromium profile with simulated records; no read, deletion or overwrite of actual student localStorage, drafts or notes.
2. **Semantics:** Activity reviewed, concept answer correct, draft saved, GCC self-report and verified execution are different evidence types.
3. **Compatibility:** Maintain existing versioned C keys and File I/O legacy keys. S&S `chapter:experiment` IDs remain valid across the 62 labs.
4. **Navigation/publication:** The existing C catalog's 18 planned and 8 published units, plus the S&S 8 published chapters, are the current reference. `published:false` hides navigation only, not direct access.
5. **Visual/interaction:** Exercise entry routes, editor restoration, local progress summaries, theme/language changes and mobile layout are exercised by smoke tests; detailed S&S visuals remain covered by the 248-screen audit.
6. **Backwards compatibility:** Do not perform data migrations in Phase 0. Any future schema migration needs an export/backup path, read-old/write-new transition, rollback and matching test fixtures.
7. **Security/privacy:** localStorage is origin-wide browser storage, not an authenticated cross-device gradebook. Admin catalog writes require separate authorized GitHub workflow and must never expose credentials to students.

## Existing test-suite audit

The C repository already contains tests for chapter authoring, pointer/structure, File I/O, Chapter 181, visual layouts, and admin flows. On 2026-11-16 many existing CI jobs initially failed **before executing tests** because the runner moved to Ubuntu 26.04 while pinned Playwright 1.56.x did not support that OS. Eight existing C workflows were pinned to `ubuntu-24.04` (the supported runner), without modifying course calculations.

After restoring CI execution, some older tests exposed stale content assumptions and/or test script defects. Fixes limited to **test assertions/scripts** include:
- `c-advanced-review.mjs` checks current P1/P2/M1 essential guidance instead of an obsolete exact phrase.
- `c-fileio-mini-lab.mjs` accepts the current visible M1 practice label.
- `c-journey-qa.mjs` checks a valid quiz answer index rather than incorrectly assuming every quiz asks for exact program output.
- File I/O browser QA scripts had invalid nested selector string quoting, which was repaired.

**Important:** Not every pre-existing C workflow was green at the time of this report. Existing red jobs must be triaged individually, not hidden by relaxing broad tests. The new independent Phase 0 smoke gates are green and are the minimal preservation baseline, **not** proof that all 8 C lessons are pedagogically or computationally perfect.

## Commands and repeatability

On a checkout of the C repository:

```sh
npm install --no-save playwright@1.56.1
npx playwright install chromium
node tests/phase0-c-baseline.mjs
node tests/phase0-storage-scan.mjs
```

In the Signals & Systems repository:

```sh
npm install
npx playwright install chromium
node tests/phase0-ss-baseline.mjs
node tests/phase0-storage-scan.mjs
npm run qa:learning
npm run qa:visual
node tests/quality-gates.mjs
```

Use GitHub Actions for reproducible Ubuntu 24.04 + Node 22 execution. Outputs are attached to the corresponding workflow run as `qa-phase0/*.json` and screenshots; the scanner output contains **source-code locations only**.

## Go/no-go recommendation before Phase 1

**Phase 0 minimal preservation gate: PASS.** The new C and S&S baseline tests and inventory generation pass.

**Additional quality gate: requires review.** The older C test-suite regressions and mathematical correctness of subject demonstrations are separate issues. Before making Phase 1/2 changes to common progress storage, re-run the full tests and classify every red legacy check as either: (a) obsolete test expectation, (b) genuine product regression, or (c) CI infrastructure error. Do not delete students' existing records or rename keys solely to satisfy a test.

### Explicit acceptance checklist

- [x] C and S&S storage contracts documented.
- [x] Versioned published content baselines pinned.
- [x] Automatic source inventory and isolated browser smoke checks created.
- [x] C 124/124 and S&S 53/53 baseline checks passed.
- [x] Existing C workflow runner compatibility restored.
- [ ] All pre-existing C extended CI workflows green (not yet established).
- [ ] Real-device iOS/Android and full course mathematical review (out of scope of automated Phase 0 smoke).
