# FFT Applications — Six-Lesson Browser QA (2026-11-23)

**Status: PASS — verified by actual Chromium / GitHub Actions.**  
**Repository:** `YSCho-HGU/engineering-learning-studio`  
**Main merge:** `8e423cb7e5b1d8fbd1456c658d8e428338017f5e` (PR #4)  
**Last browser workflow:** [Applications FFT curriculum and lab QA — run 45178499086](https://github.com/YSCho-HGU/engineering-learning-studio/actions/runs/45178499086)

## Scope and methodology

Six FFT Applications outside the already-tested **DFT vs FFT / Butterfly** module:

| Lesson | Browser interaction scenarios | Result |
| --- | --- | --- |
| 01 — FFT from Sample Data | Sample selection, FFT plots, fs unknown versus known, Hz/normalized cycles/sample, invalid numeric input, reset, checkpoint feedback | PASS |
| 02 — Frequency Bins and Resolution | Frequency/observation metrics, Spectral Leakage and Hann window, Zero-padding 4×, SVG time/frequency plots, concept quiz | PASS |
| 04 — DTMF Mystery Decoder | FFT of a hidden keypad tone, low/high peaks, correct keypad decoding, three-symbol challenge, graph SVG line/axis fill | PASS |
| 05 — Sound Fingerprint | Harmonic spectra, note/window/FFT N changes, instrument/voice prediction and reveal, comparison, quiz | PASS |
| 06 — Real Audio, Music & Sensor FFT | Built-in FFT, fs=unknown cycles/sample, harmonic demo, manual f0 candidate, 2048-row time/value sensor CSV upload, plots, interpretation | PASS |
| 07 — Chirp, STFT & Spectrogram (optional) | Global/local FFT, spectrogram SVG cells, selected-frame movement, falling chirp, window shape and overlap comparison, mission feedback | PASS |

**Shared criteria applied to each lesson:**
- The learning-path bar appears exactly once and marks the correct position among 7 lessons.
- Plots are nonblank SVGs with visible width and height; no `.katex-error` rendered.
- English titles contain no Korean; changing to Korean produces Korean titles.
- White Clean and Neutral Dark change the actual document theme/background.
- The 390px mobile document has no horizontal overflow.
- Playwright captures desktop dark, desktop white and mobile screenshots (18 images).
- No uncaught JavaScript `pageerror` occurred during the tested interactions.

**Existing regression maintained:** direct DFT-versus-FFT / 8-point Butterfly browser checks, seven-module curriculum navigation and numerical invariants were run in the **same passing workflow**. These checks include uploaded sensor/audio data, mathematical input rules, complex-valued butterflies and calculation consistency.

## Browser screenshot QA and issue found

The first six-lesson full Chromium run successfully exercised all six pages. Visual inspection of the 18 screenshots identified a DTMF spectrum defect: a large **black triangular polygon** obscured part of the FFT graph.

**Root cause:** the `<path class="ss-dtmf-axis">` command used a connected vertical and horizontal axis without `fill="none"`. SVG defaults filled the open path, forming a triangular region. The independent spectrum line was already unfilled and was not the underlying cause.

**Changes:**
- `signals-systems/assets/ss-dtmf-decoder.js`: set `fill="none"` on trace and axes paths.
- `signals-systems/assets/ss-fft-dtmf.css`: set `fill:none` on the axis, plus defensive styles for spectrum/wave paths.
- `signals-systems/applications-fft-dtmf.html`: update CSS and JS cache-busting versions.
- `tests/applications-fft-six-browser-regression.mjs`: assert actual computed CSS `fill` is `none` for both trace and axis.

**Visual recheck:** downloaded the passing run’s screenshot artifact and verified that the black triangle is gone; peaks (e.g. a low-frequency DTMF peak and a high-frequency peak) and grid lines remain readable.

## Reproduction

```bash
npm install --no-save playwright@1.56.1
npx playwright install chromium
node tests/fft-butterfly-invariants.mjs
node tests/fft-content-invariants.mjs
node tests/applications-dft-fft-regression.mjs
node tests/applications-fft-path-regression.mjs
node tests/applications-fft-six-browser-regression.mjs
```

GitHub Actions workflow: `.github/workflows/applications-dft-fft.yml`, `ubuntu-24.04`, Node 22. Artifacts include `fft-six-lessons-browser-screenshots`, `fft-butterfly-browser-screenshots` and the DFT vs FFT source snapshot.

The six-lesson QA generated **18 screenshots** (6 lessons × 3 views). These are also available from the linked GitHub Actions run’s artifacts.

## Verification boundary

These assertions and screenshots are from **real headless Chromium** running checked-out repository source. Mathematical computations and actual UI interactions were exercised, not just source parsing. The results do **not** separately prove that the publicly deployed GitHub Pages CDN has finished updating or that every browser/OS combination has been inspected.

No additional standalone modules or changes to Chapters 1–8 were included. The optional STFT extension remains outside the core FFT path.
