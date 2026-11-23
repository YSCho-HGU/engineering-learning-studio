# Applications Part C — Beginner-First FFT Learning Path

## Teaching principle

**Interpret real sample data before teaching FFT algorithm details.** The first interactive lab is **FFT from Sample Data** at `signals-systems/applications-fft-lab.html`. Existing curriculum-only cards follow it in progressively more demanding stages.

The main learner question is: *What can we determine from a numeric sample sequence, and what additional physical meaning becomes available when the sampling rate is supplied?*

## Stage 1 · Samples and FFT bins (interactive now)

1. Look at an array of 8–128 real-valued samples `x[n]`. The horizontal axis is **sample index n**, not seconds.
2. Paste sample values or choose a prepared dataset: 16-point coherent tone, 32-point two-tone, 32-point non-bin-centered sinusoid, 16-point impulse.
3. Compute the DFT spectrum. A radix-2 FFT runs for power-of-two sample counts; otherwise a transparent direct-DFT fallback gives **the same transform definition**, not a fake FFT.
4. Interpret bin index `k`, normalized frequency `k/N` cycles/sample, and one-sided amplitude from the complex FFT coefficients. The table also shows raw `|X[k]|` so normalization is not confused with the underlying DFT.
5. **No sampling rate:** amplitude, normalized frequency, bins, and digital angular frequency can be determined; the physical frequency in Hz, sampling interval in seconds, recording duration and Nyquist frequency in Hz **cannot**.
6. **Sampling rate supplied:** `f_k = k f_s/N` Hz, bin spacing `Δf = f_s/N`, record duration `T = N/f_s`, Nyquist frequency `f_s/2`. Compare exactly the same 16 samples interpreted with `f_s=8,000` and `f_s=16,000`: bin 3 remains bin 3, but 1,500 Hz becomes 3,000 Hz.
7. Distinguish a **frequency-bin peak** from a definitive analog frequency: spectral leakage, aliasing, nonstationarity and noise can limit identification. The system does **not infer a missing `f_s` from the data**.

### Baseline numerical expectations

- `N=16, x[n]=sin(2π·3n/16)`: largest non-DC positive-frequency bin `k=3`; one-sided amplitude approximately 1.
- `f_s` unknown: normalized `3/16 = 0.1875` cycles/sample.
- `f_s=8000` Hz: bin spacing 500 Hz and peak at 1500 Hz.
- `f_s=16000` Hz: bin spacing 1000 Hz and peak at 3000 Hz. `X[k]` is exactly unchanged.
- `N=32, 0.85sin(2π·3n/32)+0.5sin(2π·7n/32)`: dominant bins 3 and 7; amplitudes near 0.85 and 0.5.
- Non-bin-centered 3.4-cycle signal: leakage across bins; the maximum bin is not an exact tone-frequency estimator.
- A single unit impulse: flat raw `|X[k]|` spectrum; do not label an arbitrary bin as the single dominant tone. One-sided display normalization doubles interior bins.
- `N=12` arbitrary values: use direct DFT transparently rather than incorrectly claiming radix-2 FFT ran.

## Stage 2 · Resolution, leakage and zero padding (interactive now)

The second interactive lab is `signals-systems/applications-fft-resolution.html`, linked from the first FFT lab and the Applications Part C catalog. It compares: two nearby tones with variable N and fs; off-bin tones with Rectangular/Hann windows; 1× versus 4× transform length with the same actual observations. It distinguishes the nominal bin spacing fs/N from the post-padding plotted grid fs/M. Zero padding adds no measured information. Hann lowers sidelobes at the cost of a wider main lobe. Two-tone separation is illustrative rather than guaranteed by bin spacing alone.

## Stage 3 · Distinguish DFT from FFT (planned)

- Why FFT is an algorithm that calculates the DFT, not a different frequency transform.
- What complex coefficients `X[k]` mean and why magnitude/phase both matter.
- A small `N=8` manual calculation and simple butterfly visualization (not the first experience).

## Stage 4 · Interpret spectral analysis reliably (planned)

- Observation duration versus bin spacing; distinguish actual frequency resolving power from denser plotting.
- Spectral leakage: rectangular versus Hann window and coherent versus noncoherent records.
- Single-sided amplitude, FFT normalization and phase.
- Zero padding: smoother frequency sampling of the spectrum without creating new signal information.
- Difference between choosing a sampling rate at acquisition and merely changing the label of already acquired samples.

## Stage 5 · Time-varying, audio and sensor signals (planned)

- Full-record FFT versus STFT: why a moving tone's temporal location disappears in a single FFT.
- Chirp/spectrogram and analysis of sound harmonics.
- Example sensor measurements, FFT bins, record timing and interference.

## Stage 6 · Image and video (planned)

- 2D image FFT: horizontal/vertical stripes, spatial frequency orientation and magnitude/phase.
- FFT filtering and reconstruction with a real image.
- Frame-wise brightness trace FFT: temporal flicker, vibration and frame-rate aliasing.
- Video distinction: spatial 2D FFT of each frame versus 1D time FFT of a pixel or ROI; separate the axes and physical units.

## Rules shared across Applications

- All prose and card math uses `data-ss-math` + `SSMathCore` + KaTeX, matching Chapters 5–8. Native inline `\(...\)` and display `\[...\]` delimiters are supported in dynamic cards. Keep readable text fallback if KaTeX is blocked.
- Do not replace valid equations with plain ASCII text and do not interpret unknown units as known.
- English mode has English only; Mixed mode adds Korean after English; Korean mode uses Korean.
- Five ELS themes, horizontal-safe formulas, responsive plots, accessible labels and tabular data.
- Stage 1 and the new Stage 2 interactive lab are operational; remaining Part C modules stay labeled planned until implemented and tested.

## Acceptance checks

- `tests/ss-fft-foundations-browser.mjs`: 16/32 point FFT, known/unknown `f_s`, validation, leakage, DFT fallback, dynamic KaTeX, all language/theme modes and mobile width
- `tests/ss-applications-browser.mjs` and `tests/ss-extra-labs-browser.mjs`: preserve Part A functionality
- `.github/workflows/ss-applications-browser.yml`: integration test runner

Actual GHz/Hz and image/video examples must not be presented as measured data unless backed by known acquisition metadata.

## Interactive frequency guides and formative assessment (2026-11-23)

The resolution/leakage spectrum overlays **solid physical tone-frequency markers** (one for a single tone, two for the nearby-tone experiment) and **dashed nearby DFT-bin markers**. Guides correspond to the currently selected transform length M; after zero padding, the displayed grid is fs/M while actual observation-based nominal spacing remains fs/N. Marker labels carry Hz units.

Two formative questions appear in the first sample-data FFT lesson: unknown-fs interpretation and the known-fs bin-to-Hz mapping. The follow-up lesson has one question per experiment (resolution, leakage, padding). Students choose answers explicitly; feedback indicates correctness and provides a causal explanation for correct responses, without auto-revealing the correct answer after an incorrect attempt. Language modes remain synchronized with the Studio language controller. No scores or user data are persisted.

Regression test `tests/ss-fft-foundations-browser.mjs` now asserts graph guide counts and all five concept checks in addition to numerical FFT behavior, theme, language and viewport checks. Actual browser execution is still required to claim end-to-end passing status.

## Interactive graph missions and Chapter-5 visual QA — 2026-11-23

### Graph-driven missions (added)
- **Sample Data FFT**: create two peaks at bins k=3/k=7 with fs unknown; then make the first coherent tone map to 1500 Hz with N=16 and fs=8000 Hz.
- **Frequency resolution**: set fs=256 Hz, N>=128, tone separation 4 Hz, and verify original Δf<=2 Hz. This is an observation-length challenge, not a claim of guaranteed physical two-tone separability.
- **Spectral leakage**: set fs=256 Hz, N=64, 0.35-bin offset and Hann window; compare true-tone marker and FFT-bin guides, and observe lobe shape.
- **Zero padding**: set fs=256 Hz, N=64, 4× padding; confirm T=250 ms and original Δf=4 Hz while the visual grid step becomes 1 Hz.

Each mission requires explicit "verify" interaction, reports current measured values, and provides differentiated success/failure feedback. The five preexisting conceptual multiple-choice checks remain separate. Mission completion is not persisted or treated as a grade.

### Common design and regression QA
- Both FFT pages now include `ss-four-step-standard.css` and the shared `ss-fft-lab-standard.css`, following Chapter 5/6 component spacing, step chips, typographic scale, formula scrolling, themed borders/backgrounds, accessible controls and responsive graphs.
- Graph reference markers remain solid for known signal frequencies and dashed for nearby FFT bins.
- The test `tests/ss-fft-foundations-browser.mjs` checks the two foundation missions, three follow-up missions, all preexisting quiz answers, numeric ground truth, language/theme modes, responsive widths and math.
- JavaScript parsing and pure numerical evaluation passed: bin k=3 at 1500 Hz with amplitude 1, two-tone bins 3/7, nominal bin spacing 4→2 Hz when N doubles at fs=256 Hz, zero-padding display grid 1 Hz with unchanged 4 Hz nominal spacing and 250 ms observation.
- Chromium execution and screenshot-based visual QA remain **not verified** in the current runtime; passing syntax and numerical tests must not be represented as browser QA.
