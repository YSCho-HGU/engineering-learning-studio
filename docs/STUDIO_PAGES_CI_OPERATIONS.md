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
| `deploy-owner-worker.yml` | Cloudflare Owner Worker deployment | Manual, separate environment and concurrency |

Some path overlap is intentional: focused file I/O QA and broader C integration tests cover distinct assertions, and FFT numeric invariants differ from Applications end-to-end behavior. Heavy browser tests are **not** executed as a prerequisite for each production Pages deployment.

## Identified sources of repeated deployment triggers

1. Rapid, separate commits for each changed chapter cause repeated `main` push events. Batch a coherent change set.
2. The previous SS Applications QA workflow pushed `qa/fft-browser-last-run.json` back to `main`; this was removed in favor of an Actions artifact.
3. Historical bot commits changed `qa-dashboard/*-latest.json` several times in one QA run. Their publisher has not yet been identified from the available workflow inventory. The dedicated Pages workflow excludes `qa-dashboard/**` so these writes no longer trigger **this** deployment workflow, but if such a publisher remains enabled it still produces unnecessary repository history and may trigger branch-source Pages publication until the Pages source is switched to GitHub Actions.

## Deployment acceptance criteria

1. One intentional site change on `main` produces one production workflow invocation (unless another distinct site change is pushed).
2. No QA workflow writes result JSON to `main`.
3. Current production deployment finishes successfully and reports the expected Git SHA.
4. C Arrays and S&S Chapter 2 load from the production URL with a visible 4-arrow navigation group.
5. A QA-only commit does not start `Studio Pages - production`.

**Status caveat:** Repository code changes do not establish that the GitHub Pages source setting was switched or that production was successfully deployed. Check the Actions deployment run separately.
