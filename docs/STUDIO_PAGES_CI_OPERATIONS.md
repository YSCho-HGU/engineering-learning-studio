# Studio Pages deployment and QA operations

Updated: 2026-11-24

## Production deployment

- Single workflow: `.github/workflows/pages-deploy.yml`.
- Deploy only `main` changes touching published static-site paths. Changes to QA reports, tests, and documentation **do not** trigger a production deployment.
- `workflow_dispatch` is available for a controlled republish.
- Deploy concurrency uses `studio-pages-production` and `cancel-in-progress: false`. A running deployment is never intentionally aborted by this policy. **GitHub may still replace an older pending run with a newer pending run**; batch related edits into a single commit to reduce that risk.
- Publish via `actions/configure-pages@v5`, `actions/upload-pages-artifact@v3`, and `actions/deploy-pages@v4`; no bot commit or force push.
- Preflight checks critical entrypoints and core header scripts. This is not a complete browser regression.
- Required GitHub repository setting: **Settings > Pages > Build and deployment > Source: GitHub Actions**. This setting cannot be inferred from workflow source alone. When transitioning away from branch publishing, switch the setting to avoid simultaneous publishing models. The workflow will not become authoritative until GitHub Actions is selected.
- GitHub Actions environment `github-pages` must permit deployment from `main`.
- Validate the `Studio Pages - production` run's deployment URL and test C Arrays and S&S Chapter 2 after changing the Pages setting.

## QA is deliberately separate from deployment

The following workflows remain independently useful and retain their existing test commands. Their per-workflow concurrency uses `cancel-in-progress: true` to replace obsolete QA runs **without canceling production Pages deployments**.

| Workflow | Purpose | Deployment behavior |
| --- | --- | --- |
| `studio-shared-design-qa.yml` | Studio header, themes, math | Read-only |
| `phase0-c-baseline.yml` | C baseline and student-storage contract | Read-only |
| `c-journey-qa.yml` | C journeys, navigation, learning contract | Read-only |
| `c-authoring-policy.yml` | C authoring rules and GCC checks | Read-only |
| `c-fileio-buffer.yml` | File I/O focused Chromium tests | Read-only |
| `ss-applications-browser.yml` | SS Applications browser tests | Read-only, artifact-only QA report |
| `applications-dft-fft.yml` | FFT and image-FFT learning invariants | Read-only, already had QA concurrency |
| `unified-quality.yml` | C G0-G7 combined test and QA snapshots | Read-only, no main-branch publishing, Logic Design excluded from mandatory QA |
| `deploy-owner-worker.yml` | Cloudflare Owner Worker deployment | Manual, separate environment and concurrency |

Some path overlap is intentional: focused file I/O QA and broader C integration tests cover distinct assertions, and FFT numeric invariants differ from Applications end-to-end behavior. Heavy browser tests are **not** executed as a prerequisite for each production Pages deployment.

## Identified sources of repeated deployment triggers

1. Rapid, separate commits for each changed chapter cause repeated `main` push events. Batch a coherent change set.
2. The previous SS Applications QA workflow pushed `qa/fft-browser-last-run.json` back to `main`; this was removed in favor of an Actions artifact.
3. Historical bot commits changed `qa-dashboard/*-latest.json` three times in one unified QA run. The publisher was located in `.github/workflows/unified-quality.yml` (G0-G7) and removed. QA dashboard snapshots now remain in the Actions artifact rather than producing new `main` commits. The Pages workflow also excludes `qa-dashboard/**`.

## Deployment acceptance criteria

1. One intentional site change on `main` produces one production workflow invocation (unless another distinct site change is pushed).
2. No QA workflow writes result JSON to `main`.
3. Current production deployment finishes successfully and reports the expected Git SHA.
4. C Arrays and S&S Chapter 2 load from the production URL with a visible 4-arrow navigation group.
5. A QA-only commit does not start `Studio Pages - production`.

**Status caveat:** Repository code changes do not establish that the GitHub Pages source setting was switched or that production was successfully deployed. Check the Actions deployment run separately.

## Scope of Logic Design

Logic Design is not yet a published Studio course. The unified C browser test and G6 required evidence gate now exclude the earlier Logic Design prototype, and QA summaries mark that course `NOT_RUN` rather than failing the C quality gate.

## Full production header regression (2026-11-24)

After production publication, `tests/pages-production-smoke.mjs` now checks all nine active C chapter entrypoints and S&S Chapters 1–8 (17 pages) at desktop, tablet, and mobile viewports of 1280, 768, and 390 pixels (51 cases). Checks include status 200, navigation SVG count, semantic chapter/section controls, theme/language dropdowns, arrow visibility, 34px geometry, centered group, viewport overflow, same-row grouping, and safe in-Studio chapter links. On 1280px, when a sidebar has two or more sections, it also checks that the Next Section button is enabled, clicks it, and checks for the next active sidebar item when active state is available. All tests use an isolated browser profile.

The deployment workflow records the machine-readable `pages-smoke-report.json` and failure screenshots as a GitHub Actions artifact, even when checks fail. A deployment is not marked verified solely because `actions/deploy-pages` returned a URL.

**Verification state:** Source code and workflow wiring have been inspected. An actual completed Pages workflow run and browser report have not yet been retrieved through the connected GitHub interface. Live production success therefore remains unverified until the new workflow runs and its 51-case report passes.
