# Signals & Systems — Integrated Learning Map, Chapter 1–8 → Applications

_Date: 2026-11-27_

## Purpose
Help second-year students answer three questions independently:
1. Why is this chapter important?
2. Which engineering problem makes the concept observable?
3. Which experiment should I try next?

This is a **learning guide**, not a strict chain of prerequisites. In particular, Ch5 (CT Laplace/ROC) and Ch8 (DT Z/ROC) are complementary system-analysis branches; neither is mandatory before introductory FFT experiments.

## What changed
- The #map route in `signals-systems/index.html` now begins with a chapter-to-application overview instead of an outdated, duplicated four-stage chapter summary.
- A diagram explicitly shows **Ch1/2 as shared foundations** and separates:
  - Part A: Fourier, waveform and sampling observations
  - Part B: CT/DT systems, filters and response
  - Part C: finite records, DFT/FFT and sampled measurements
- Three student goals become interactive selections. Each selection reveals a six-stage path of direct chapter/lab links, an explanation of why to do each step and the learning outcome.
- An eight-card catalogue answers one question per chapter and links directly to relevant live Applications experiments.
- The complete existing mathematical Transform Relationship Explorer is preserved below the student map, including its relationship conditions, parameter controls, transform family, ROC, sampling, and decision support.
- The outdated Applications-only-planned copy was removed; the map correctly marks Part A (6), Part B (3), and Part C (7 core FFT + optional 1 STFT) as implemented, Part D as planned.
- All new material is re-rendered via the existing three language modes (Mixed English→Korean, English-only, Korean-only). Changing modes preserves the route selection. Styling uses the shared theme variables and responsive layout.

## Suggested student journeys

### A. Hear and see signals
Ch1 Signals → Ch3 Fourier Series → Harmonics → Ch4 CTFT → Ch7 Sampling → Chirp / AM/FM / Sampling.
Outcome: connect time patterns, harmonic spectra, and sampled/aliased signals.
Related native lab links also appear on all eight chapter cards (e.g., Ch1 Helix & Beats).

### B. Understand and compare systems
Ch1 → Ch2 Convolution → RC Filter → Ch5/6/8 **as needed** → Moving Average → Same-Input RC vs MA Comparison.
Outcome: explain output, cutoff and delay; understand that matching cutoff does not imply equal phase/delay.

### C. Discover FFT and analyze data
Ch3/4 Fourier → Ch6/7 DTFT/Sampling → optional beginner FFT guide → FFT from Samples → Resolution / DFT vs FFT → DTMF / Sound Fingerprints / Audio or Sensor Upload / 2D Image FFT.
Outcome: distinguish cycles/sample and physical Hz, interpret the meaning of peaks, and understand what FFT changes (computation, not the mathematical transform).

## Mathematical and pedagogical cautions
- `y=x*h` belongs to LTI convolution; `Y=HX` holds where the relevant transforms exist.
- CTFS/DTFS, CTFT/DTFT, Laplace/Z, DFT/FFT are related but distinct mathematical operations, not one interchangeable transform.
- DFT and FFT produce the same complex coefficients for identical inputs, up to finite precision.
- A finite record's normalized frequency is `k/N`; labeling frequency in Hz requires known `fs`.
- Pole/zero and ROC determine causal/stability interpretations; a point's location alone does not supply the full inverse transform without ROC.
- Part D cards remain curriculum plans; do not mark them as runnable labs.

## Implementation files
- `signals-systems/index.html` — map root, page title/entry and unchanged `#map-full`.
- `signals-systems/assets/ss-learning-journey.js` — authored route, chapter and application definitions, language-aware rendering and navigation.
- `signals-systems/assets/ss-learning-journey.css` — responsive cards, route diagram and shared theme styling.
- `tests/ss-learning-map-curriculum-contract.mjs` — static content, routes, file links, syntax and preservation checks.
- `tests/ss-learning-map-browser.mjs` — Playwright check for 3 languages × 2 screen widths, route changes, link population, unchanged transform details, and layout.
- `.github/workflows/ss-learning-map-qa.yml` — CI source contract and Chromium QA.

## Verification and status
- Native file existence for all eight chapters and the 11 unique Applications/FFT-theory page paths was confirmed using connected GitHub access.
- Content model was evaluated: 8 chapters, 3 routes, 17 named destinations (16 interactive labs + FFT theory); static source structure checks passed.
- The changed index's inline JavaScript syntax was verified before commit.
- Browser end-to-end validation has been authored, but **a successful Chromium run and deployment screenshot verification are not yet confirmed**. The GitHub Actions workflow and its artifacts are the authoritative records for those checks.

## Future extensions (not part of this release)
- Avoid duplicating the preexisting transform explorer's mathematical detail in the new map.
- If a Ch9/Part D lab becomes available, add it to the existing route data and update the static contract counts.
- Maintain all three languages for every new chapter/application label, question and navigation link.
