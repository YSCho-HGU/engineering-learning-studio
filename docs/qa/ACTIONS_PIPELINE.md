# Engineering Learning Studio — Scoped GitHub Actions CI

Updated: 2026-11-24

## Design

The previous 31 workflow files frequently started independent Chromium installations for the same commits. The new architecture keeps **7 active workflow files**:

| Workflow | Purpose | Trigger |
|---|---|---|
| ci-studio.yml | Change-scoped CI with C, S&S Chapters, Applications, shared UI, and admin jobs | main push, PR to main, manual |
| pages-deploy.yml | GitHub Pages production release; never blocked by browser QA | main push / manual |
| pages-postdeploy-qa.yml | Live Pages integrity and screenshot QA | completed production deployment / manual |
| deploy-owner-worker.yml | Cloudflare Owner Worker release | manual only |
| unified-quality.yml | Deep G0–G7 audit and archived screenshots | manual only |
| fft-source-snapshot.yml | Exact FFT source snapshot for debugging | manual only |
| qa-backlog-recovery.yml | Obsolete-run cleanup (dry-run available) | manual only |

## Test retention

The CI workflow runs unchanged test scripts. Suite-specific obsolete workflow entrypoints were deleted; their content remains recoverable through Git history. No learning page, source code, or published asset was removed.

- **C static**: authoring, site/catalog integrity, pedagogy, GCC C11, mini lab, textbook links, C211 source, storage.
- **C browser**: published chapters, File I/O, C181, C211, learning journey, responsive landing page.
- **S&S Chapters**: mathematical expressions, all sections, 3-mode content, plots, tablet/mobile, sidebar/header.
- **Applications static**: FFT and 2D FFT numerical invariants, Part B numerical models.
- **Applications browser**: original labs, inquiry, filters, FFT, chirp/STFT, DTMF, sound fingerprint, image FFT.
- **Shared UI**: canonical asset inventory, migration, cross-course header, theme, navigation, progress.
- **Admin**: Owner Worker protocol, fail-closed access, admin browser checks.

## Performance and correctness

1. **One workflow per relevant push / PR**, not 25 separate QA workflows.
2. **Diff classifier** selects only the affected learning areas. Manual dispatch validates all.
3. Browser suites install Playwright/Chromium **once per job**, rather than once per legacy workflow.
4. Each job has a deadline and all same-branch obsolete runs are cancelled through concurrency.
5. Browser artifacts are stored on failure or deliberate full manual audit, not on every green check.
6. Production deployment and post-deployment verification remain independent from premerge QA.
7. On a GitHub compare result of 300 files or unknown change metadata, all suites are run to avoid missing changes.
8. Manual G0–G7 and exact FFT source snapshot are preserved for deeper diagnostics.

## Release verification

After CI runs, inspect `Studio CI - scoped quality gates` checks for each changed area. Compare the deployed `build-info.json` with the published commit. For an end-to-end audit, manually dispatch `Unified Studio Quality G0-G7`.

## Previous files

- `applications-abd-visual.yml` — replaced by `ci-studio.yml`
- `applications-dft-fft.yml` — replaced by `ci-studio.yml`
- `c-authoring-policy.yml` — replaced by `ci-studio.yml`
- `c-browser-regression.yml` — replaced by `ci-studio.yml`
- `c-fileio-buffer-browser.yml` — replaced by `ci-studio.yml`
- `c-fileio-buffer.yml` — replaced by `ci-studio.yml`
- `c-four-chapters.yml` — replaced by `ci-studio.yml`
- `c-journey-qa.yml` — replaced by `ci-studio.yml`
- `c-programming-visual.yml` — replaced by `ci-studio.yml`
- `c181-browser.yml` — replaced by `ci-studio.yml`
- `c211-version-qa.yml` — replaced by `ci-studio.yml`
- `els-deduplication.yml` — replaced by `ci-studio.yml`
- `phase0-c-baseline.yml` — replaced by `ci-studio.yml`
- `ss-applications-browser.yml` — replaced by `ci-studio.yml`
- `ss-ch4-mobile-standard.yml` — replaced by `ci-studio.yml`
- `ss-chapters-math-audit.yml` — replaced by `ci-studio.yml`
- `ss-header-language-theme.yml` — replaced by `ci-studio.yml`
- `ss-image-fft.yml` — replaced by `ci-studio.yml`
- `ss-inquiry-first-six-labs.yml` — replaced by `ci-studio.yml`
- `ss-partb-student-journeys.yml` — replaced by `ci-studio.yml`
- `studio-admin.yml` — replaced by `ci-studio.yml`
- `studio-deployed-smoke.yml` — replaced by `ci-studio.yml`
- `studio-monorepo-qa.yml` — replaced by `ci-studio.yml`
- `studio-shared-design-qa.yml` — replaced by `ci-studio.yml`
- `studio-shared-header.yml` — replaced by `ci-studio.yml`
