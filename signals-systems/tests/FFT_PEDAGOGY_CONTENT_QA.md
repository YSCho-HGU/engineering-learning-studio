# FFT Applications — pedagogical content and mathematical QA

**Review date:** 2026-11-23  
**Basis:** actual HTML and JavaScript in `signals-systems/`, including every Part C interactive FFT lesson.  
**Goal:** keep one primary learning outcome per lesson, preserve exploratory experiments, remove repeated *planned* modules, and distinguish observed signals from physical interpretation.

## Findings by lesson

| # | Unique core outcome / what students must demonstrate | Evidence in the source | Overlap policy / changes |
| --- | --- | --- | --- |
| 01 FFT from Sample Data | Given a finite array, compute FFT and report bin index k and normalized frequency k/N; without fs, do **not** claim Hz. | Presets, editable real samples, DFT/FFT algorithm choice, sample plot, frequency plot, frequency table, practice and checkpoint. | Keep the first practical lightweight. Non-power-of-two N is evaluated by **direct DFT**, not mislabeled as radix-2 FFT. |
| 02 Frequency Bins & Resolution | Explain **T=N/fs** versus FFT grid **fs/M**, use two nearby tones to test resolution, and compare Rectangular/Hann and padding. | Controls for fs, N, separation, off-bin offset, window, M; paired graphs, challenges and multiple-choice questions. | This is the **main home** for leakage, windows, and zero-padding. Their duplicate *planned* catalog cards were removed. Replaced direct DFT plotting calculation with actual radix-2 FFT for power-of-two M, preserving arbitrary-size fallback and numerical output. |
| 03 DFT vs FFT | Show that direct DFT and FFT compute the **same complex X[k]**, then explain butterflies and growth O(N²) vs O(N log₂N). | Direct complex-error metric, execution-time comparison, interactive 8-point radix-2 butterfly trace with live twiddle factors, complex intermediate values, stage-by-stage graph, direct DFT proof table, and operation-growth curves. | Added assessed concept checks for equivalence and growth. The bin/padding tools are labelled as **review / transfer**, not new core theory. Uploaded-file exercise is a preview linking to lesson 06. The enhanced butterfly view computes and reveals **every complex twiddle product and two outputs** for all 12 butterflies. |
| 04 DTMF Mystery Decoder | Infer a telephone symbol from **two** frequency bands using FFT; relate peak detection to a code table. | 12 DTMF tone frequencies, synthesized mystery keys, spectral peaks, single/three-key challenge and answer checking. | Unique *decoding* application, not another generic bin-frequency practice. A single full-record FFT does not reveal the order of successive keys. |
| 05 Sound Fingerprint | With common reference f0, interpret harmonic **relative amplitudes** as evidence relevant to timbre. | Synthesized piano-like / guitar-like / voice-like sounds, audio, FFT, ten-harmonic profiles, prediction/reveal and quiz; optional real recordings. | Distinct from DTMF: harmonic *structure* rather than two-tone symbol decoding. Models are **not actual instrument/voice recordings**. Corrected uploaded-recording time-axis duration and made **user-assumed f0, not detected pitch**, explicit near the results. |
| 06 Real Audio, Music & Sensor FFT | Select a real segment, choose/fs infer sampling rate if justified, interpret Hz vs cycles/sample, assess multiple peaks and harmonic **hypotheses**. | Local audio/CSV ingestion, time/value column handling, segment selection, Hann/Rect FFT, prominent peaks, conditional f0 candidates and warnings. | Dedicated full data-transfer application; do **not** infer original source, machine speed, musical pitch, or shaft RPM from one peak without additional assumptions. |
| 07 Chirp, STFT & Spectrogram — **optional** | Explain why global FFT cannot identify **when** a changing frequency occurred; compare local FFT windows. | Time-varying modeled chirps, full-record FFT, moving-window FFT, spectrogram, time-frequency comparison, targeted mission. | Optional after the core FFT path, not a prerequisite. Changed sampled time-graph axis to **x[n] (sampled)** instead of suggesting a continuous signal was directly measured. |

## Content allocation and duplication findings

**Necessary reuse:** Plotting x[n] and |X[k]|, bin-to-Hz mapping, and Hann windows recur because each investigation uses FFT. They are prior knowledge, not a repeated primary objective. The shared lesson strip now states a distinct objective for each of seven pages.

**Avoidable duplication removed:** Standalone planned cards "Spectral Leakage and Windows" and "Zero Padding and Spectral Detail" duplicated working exercises in lesson 02. They were removed from the Part C catalog rather than kept as inactive cards.

**Transfer vs full application:** Lesson 03 retains a compact uploaded-signal preview for conceptual transfer, with a link to the more complete local audio/IoT sensor workflow in lesson 06.

**Model vs measurement:** Instrument-like and voice-like *syntheses* support controlled scientific comparison; uploading actual recordings introduces uncertain pitch, microphone, noise, phase and sample rate. The reference f0 in lesson 05 is a user hypothesis for real recordings.

## Mathematical check evidence

Source-level numerical checks performed during this review (in addition to the regression test file):
- **01:** 16-point FFT test has a dominant bin k=3; 8000 Hz metadata maps it to 1500 Hz but the same samples without fs do not support an Hz label; 15-point input correctly takes direct DFT fallback.
- **02:** Converting the plot calculation from direct DFT to radix-2 FFT changed the tested **1,692 one-sided amplitude values** by at most **5.20e-15**. Padding x4 leaves observation duration and original fs/N unchanged while reducing the displayed fs/M interval from 4 Hz to 1 Hz in the example.
- **03:** Direct DFT and radix-2 FFT give matching complex results at tested powers of two, and the 2N zero-padded FFT preserves original bins at even indices. Two newly added knowledge checks distinguish transform identity from computational complexity.
- **04:** All **12** modeled keypad symbols (`123456789*0#`) were decoded correctly in the numerical test.
- **05:** The three synthesized profiles yield different leading harmonic profiles (piano-like and guitar-like h=1, voice-like h=5) and shares sum to 100% up to rounding.
- **06:** A 64 Hz sinusoid at fs=1024 Hz reports 64 Hz; the same samples without fs report 0.0625 cycles/sample. A regular `time_s` CSV test infers fs=1000 Hz.
- **07:** Rising chirp frame-peak frequencies increase while falling chirp frame peaks decrease. Local observation uses sampled x[n].

**Reproducible numeric checks:** `node tests/fft-content-invariants.mjs` and `node tests/fft-butterfly-invariants.mjs` (Node 22; no Playwright dependency).  
**End-to-end browser checks:** `node tests/applications-dft-fft-regression.mjs` and `node tests/applications-fft-path-regression.mjs`. All three are configured in the GitHub Actions FFT QA workflow.

## Further improvements (not claimed complete)

1. Lesson 03 butterfly: the interactive 8-point complex trace is **implemented**. A possible later extension is student-entered complex (rather than real-only) input or independent operation prediction before revealing answers.
2. Lesson 05: real recording pitch is **not automatically detected or verified**; therefore modeled timbre conclusions must not be assigned to arbitrary recordings merely because the user selected a reference f0.
3. Lesson 06: noisy/nonstationary or multi-source recordings can defeat peak and harmonic heuristics. Any fundamental-frequency or machine-RPM interpretation remains **conditional**.
4. Lesson 07 is optional; Phase/IFFT reconstruction, 2D FFT, video temporal FFT, FFT convolution remain future modules and are **not** claimed as covered by the seven working labs.
5. This review verified source code, educational statements and numerical kernels. An all-seven-page, live-browser visual and interaction run was **not observed as passing** during this review.

## Design constraints

Preserve Studio common header, language modes, White Clean / Warm Neutral / Warm Dark / Navy Dark / Neutral Dark themes, adjacent controls and graphs, WCAG-oriented readability, and responsive presentation. Keep FFT Foundations focused on DFT/FFT; STFT remains clearly labelled an optional extension.

## Additional implementation — 8-point FFT complex butterfly (2026-11-23)
- **Location:** Applications Part C → DFT vs FFT → Step 03 Experiment → Radix-2 FFT butterfly laboratory.
- **Input:** ramp, impulse, 1-cycle cosine, and editable 8-real-number sequence (validated).
- **Algorithm:** radix-2 decimation-in-time, input bit-reversal order 0,4,2,6,1,5,3,7; length-2, length-4 and length-8 combinations.
- **Interactive tracing:** choose one of three stages and four operations; SVG dependency lines and the selected nodes are highlighted. Future stage values appear only after advancing.
- **Detailed math:** u, v, W_L^r, t=Wv, upper output u+t, lower output u−t, and all 4 butterfly results per stage.
- **Verification:** final 8 complex FFT coefficients and direct DFT values, per-bin complex absolute error and maximum absolute error.
- **Numerical evidence:** ramp, impulse, cosine and 40 deterministic additional input vectors were tested independently, with maximum complex discrepancy approximately 2.43e-14. Built-in W4^1=-j and W8^1=(1-j)/sqrt(2) cases also have explicit assertions.
- **Tests:** `tests/fft-butterfly-invariants.mjs` and added Playwright checks in `tests/applications-dft-fft-regression.mjs`. GitHub Actions workflow watches both the pure computation module and its test.
- **Remaining validation:** Chromium visual interaction and CI green status have **not** been independently confirmed during this chat. This report does not claim those tests executed successfully.
