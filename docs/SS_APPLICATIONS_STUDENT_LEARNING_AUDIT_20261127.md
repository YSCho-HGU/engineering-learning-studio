# Applications — Student Learning Experience Audit
_Date: 2026-11-27 · Scope: Engineering Learning Studio > Signals & Systems > Applications_

## Purpose
Audit existing content from the student's viewpoint against the Chapter 1–8 cycle:
**Predict → Change → Observe → Explain**, followed by **Apply / Check** in Applications.
Preserve the existing simulations, media handling, graphs, and part-specific workflows.
A shared learning **contract** does not require identical page layouts.

## Confirmed published inventory
- **Part A, Signals:** six interactive labs — Harmonics, Chirp, Complex Exponential Helix, Beats, AM/FM, Sampling & Aliasing.
- **Part B, Systems:** three interactive labs — RC, Moving Average, matched-cutoff Same-Input Comparison; four additional topics planned.
- **Part C, FFT:** seven core labs — Sample Data, Bins & Resolution, DFT vs FFT, DTMF, Sound Fingerprint, Audio/Sensor Upload, 2D Image FFT. One optional Chirp & STFT extension; three other topics planned.
- **Part D:** six proposed integrated scenarios, not interactive labs.

## Evidence-based findings

| Area | Existing strength | Student-facing gap | Recommended change |
|---|---|---|---|
| Part A: Harmonics / Beats / Sampling | Shared inquiry module has pre-prediction, controlled A/B presets, displayed evidence, a transfer question and checked explanation | The remaining three Part A labs use passive step lists; students encounter two different learning styles within the same part | Extend the inquiry pattern to Chirp, Helix and AM/FM with lab-specific pre-prediction, two comparable states, metric evidence and transfer check |
| Part A: Chirp | Waveform spacing, instantaneous frequency and FFT spectrogram are synchronized | STFT concepts appear in Part A before FFT foundations; the hub previously described unsupported exponential sweep | Call STFT a visual preview, focus core task on frequency change. Optional detail can link to C8; hub wording corrected |
| Part B: RC / Moving Average | Circuit voltages and FIR convolution tap-by-tap inspector make computation tangible | The page begins with controls / Observe / Connect / Explain / Test, without a prior prediction; the numbered stages conflict semantically with Ch1–8's ①–④ | Add one explicit pre-change question; map output graph to ③ and equation/physical model to ④; retain circuit and tap inspectors |
| Part B: Same Input Comparison | Shares one input and compares cutoff, phase, response delay | Many controls and graphs arrive together; students can change multiple variables before interpreting the first comparison | Start with a fixed matched-cutoff preset and one evidence question; place advanced scope/probe and model assumptions behind a clearly labelled expansion |
| Part C: FFT sample data | Separates normalized digital frequency from physical Hz when fs is unknown | No common visual pattern for prediction and concluding transfer across C modules | One sentence: predict; one focal control; one observable signature; one formula with current values; one transfer question |
| Part C: Bins & Resolution | Correctly distinguishes record length from zero-padding | Windowing, leakage and zero-padding are available on a single page | Teach them sequentially with single-variable changes and a visible `N`, `fs`, `T`, `NFFT` and `Δf` summary |
| Part C: DFT vs FFT | Direct-DFT/FFT equality and butterfly are demonstrable | Computational detail can distract students before they trust the equal numerical results | Verify equal complex coefficients first, then reveal butterfly/speed; leave trace as optional depth |
| Part C: DTMF / Fingerprint | Evidence selection gates encourage students to interpret peaks before revealing an answer | Conclusion may not explicitly transfer the insight to a new input | Add a short new-signal / different N or f0 transfer question, not an extra long derivation |
| Part C: Real Audio / Sensor | Allows real local samples and optional fs; avoids fabricating Hz | Students may confuse k/N with Hz or mistake FFT bin accuracy for actual frequency resolution | Always label `cycles/sample` when fs unknown, and make record duration, window and peak uncertainty visible |
| Part C: 2D Image FFT | Kernel scanner, FFT2 row/column pipeline and notch filter connect 1D/2D ideas | High initial cognitive load: four external stages and additional nested processing controls | Keep four main stages but expose the 3×3 kernel and row/column FFT internally as optional deeper inspections; core observation is the changing peak/pattern and reconstructed image |
| Part C: optional STFT | Actual windowed FFT results, local spectrum, full spectrogram and controlled comparison | Static equation previously showed fs/L as FFT bin spacing even when M=2L; plotted color is relative magnitude dB | Distinguish observation-limited resolution (~fs/L), display grid fs/M, hop H/fs; match the dB equation. Source corrected |
| Part D | All six topics are correctly presented as planned proposals | Cannot be assessed for complete student execution | Keep clearly labelled planned status; future labs must include direct inputs/outputs, evidence and transfer check |

## Common contract for every interactive Application

1. **Problem and objective (one screenful):** What is the real phenomenon? What one distinction should students discover?
2. **Predict (before changing values):** one answerable hypothesis or A/B comparison. Never require a formula not yet introduced.
3. **Change:** provide one recommended starting preset; identify one control to change and what must remain fixed.
4. **Observe:** visible results must use the current simulation state; list at most two or three key measurements with units and physical meaning.
5. **Explain:** one relevant, correctly normalized equation plus *current values*; one concise conclusion whose content is not already repeated in the captions/guide.
6. **Apply / Check:** a new setting or context to test transfer of learning; feedback must cite observable evidence, not merely mark correct/incorrect.

### Relation to Chapter 1–8
- Ch1: signals, CT/DT, periodicity; A Harmonics / Beats / Helix.
- Ch2: convolution and LTI; B Moving Average / RC / Compare.
- Ch3/4: FS and CTFT, Fourier interpretations; A AM/FM and Part C harmonics.
- Ch6/7: DTFT and sampling; A Sampling and C bins/aliasing.
- Ch8: poles, stability and digital filters; B analog/digital filter comparisons.
- 2D image FFT: extend 1D Fourier to row and column operations; preserve explicit kernel boundary rules.

## Verified corrections in this audit
- Applications hub inventory standardized to 7 core FFT labs + 1 optional extension, 3 planned Part C topics, and clearly planned Part D.
- Part A Chirp catalog now accurately says linear chirp; STFT is identified as a preview rather than an assumed prerequisite.
- Optional STFT mathematical labels now distinguish `Δf_record ∼ fs/L` from zero-padded `Δf_grid=fs/M`; the spectrogram dB equation matches the relative magnitude visualization.

## Acceptance criteria for future content work
- All 6 Part A labs expose the same *learning behavior*, regardless of native controls.
- All 3 Part B labs request a prediction before the comparison and include an evidence-based transfer check.
- All 7 core Part C labs make the main task discoverable without requiring optional advanced panels.
- Every visible formula uses the actual native parameter state, units, and measurement convention (especially fs-known/unknown, sinc normalization, FFT grid vs record resolution, linear vs circular convolution).
- Language modes (Mixed English→Korean, English-only, Korean-only), white/dark themes and desktop/mobile widths are verified in real Chromium, including no formula/card/plot overlap.
- No claim of completed browser QA until a run report and screenshots have been checked.

## Suggested implementation order
1. **P1 — high impact:** Extend Part A inquiry to Chirp, Helix, AM/FM; add one Predict/Check loop in Part B; unify short contextual instructions across C1–C7.
2. **P1 — cognitive-load reduction:** Stage image FFT advanced processing behind optional expansion; focus Part B compare on one prepared matched-cutoff scenario.
3. **P2 — cross-topic transfer:** Add prerequisite/return links, new-case questions and formula-to-current-metric evidence panels.
4. **QA:** static formulas and language contracts, then full Playwright evaluation with user-level interactions.
