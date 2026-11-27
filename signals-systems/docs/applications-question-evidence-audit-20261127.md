# Applications A–D: Question → Control → Evidence Audit

Date: 2026-11-27  
Scope: 19 implemented interactive labs: A=6, B=3, C=7 core+1 optional, D=2.

## Method
- Compared every student-facing discovery question in `ss-app-focus-guide.js` against each lab's real controls, built-in experiments, plots and native inquiry content.
- Corrected mismatches between the question's controlled-variable premise and the implemented experiment, notably **B1 RC** (hold R/C fixed; vary input frequency), **B2 Moving Average** (same step, M=3 vs 21) and **C3 DFT/FFT** (same spectral result first; computational speed as follow-up).
- Added a visible “Show the graph to inspect / 관찰할 그래프 바로 보기” link, using an existing target per lab instead of a new duplicate figure. The 19-target browser contract tests presence, multilingual rendering and mobile layout.
- The guidance does **not** fabricate numerical measurements and does not alter simulation or plots.

## Lab-by-lab evidence contract

| Lab | Student's main discovery | Action needed | Inspect actual evidence at |
|---|---|---|---|
| A1 Harmonics | Fixed f₀, added harmonics change timbre | Keep f₀ fixed, change harmonic preset/count | `#ss-al-graphs` |
| A2 Chirp | Raising end frequency increases midpoint instantaneous frequency | Fix start/duration; vary end frequency | `#ss-al-graphs` |
| A3 Helix | Sign of σ changes decay/growth envelope | Hold rotation frequency, vary σ | `#ss-al-graphs` |
| A4 Beats | Beat rate follows difference between two tones | Hold f₁, change Δf | `#ss-al-graphs` |
| A5 AM/FM | AM changes envelope and FM changes instantaneous frequency | Keep message and carrier fixed, switch mode | `#ss-al-graphs` |
| A6 Sampling | 1.5 kHz may alias to 0.5 kHz at fₛ=2 kHz | **Choose Sine**, fix 1.5 kHz; change fₛ | `#ss-al-graphs` |
| B1 RC | Fixed RC LP attenuates higher-frequency sine more | Hold R/C fixed, compare 0.4 vs 8 Hz | `#ss-sys-step-1` |
| B2 MA | Increasing M broadens step transition and adds memory/delay | **Choose Step**, compare M=3 vs M=21 | `#ss-sys-step-1` |
| B3 Same-input filters | Matched cutoff does not imply matching delay/noise response | Start with **Matched cutoffs** preset | `#cmp-time` |
| C1 FFT samples | FFT peaks reveal bin frequencies; fₛ maps to Hz | Compare one/two-tone input and sampling metadata | `#fft-spectrum-plot` |
| C2 Frequency resolution | Longer observation can distinguish close tones | Choose Two nearby tones, change observed N | `#fft-r-spectrum` |
| C3 DFT vs FFT | Identical input yields identical spectrum | Compare same-input DFT and FFT coefficients first | `#dft-spectrum-plot` |
| C4 DTMF | A low/high pair of FFT peaks identifies key | Choose One hidden key; press Analyze FFT | `#dtmf-spectrum` |
| C5 Fingerprint | Same pitch can have differing harmonic patterns | Keep note fixed; listen A/B and reveal spectra | `#finger-spectrum` |
| C6 Real audio/sensor | Without fₛ, a peak bin cannot be assigned physical Hz | Use built-in demo or file; set fₛ only when known | `#fft-upload-spectrum` |
| C7 2D image FFT | Stripe spacing/direction moves frequency peaks | Choose Adjustable stripes, change count/angle | `#image-spectrum-canvas` |
| C8 optional STFT | Local FFT reveals when chirp frequency changes | Compare whole-record and moving windows | `#stft-spectrogram` |
| D1 Audio filter | FIR frequency response determines surviving sound frequencies | Change one Step 2 FIR setting, inspect Step 3 | `#specplot` |
| D2 Chirp echo | Best matching delayed chirp gives round-trip travel time | Change Step 2 distance, find correlation peak in Step 3 | `#corr-plot` |

## Pedagogical findings

**Corrected:** B1 guide initially implied changing R/C, while Part B's controlled comparison fixes R/C and varies sine frequency. B2 originally talked about noise reduction, while the prepared inquiry compared M on the same step. C3 used an ambitious “same output and fewer operations” question, but the first evidence plot only directly establishes **same output**. C3 now treats the speed-up as the next, separately explained step.

**Clarified access:** A6 defaults to a Chirp in its native interface, so the focused 1.5 kHz alias question now tells students to select Sine first. C4 starts in mystery-key mode and the spectrum may not be visible until analysis; pressing Analyze FFT is now explicit. C6 recommends the built-in demo so students without an uploaded file can still investigate.

**No introduced content overload:** One main question per lab, three brief evidence-oriented prompts, and one link to the existing graph. The underlying discipline-specific instructions remain available in their existing sections.

## Validation distinction
- Automated QA checks that each guide loads, displays 3 language modes, fits mobile width, and links to a real page element.
- Existing lab-specific regression checks provide additional computations/interaction coverage (Part A canvas changes, Part B inquiry, Part C numerical and browser tests, Part D 90-state matrix).
- These checks do not prove every student interpreted every plot correctly; live student usability testing remains distinct from code correctness.
