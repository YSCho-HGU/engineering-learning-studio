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

## Follow-up verification: copy-to-plot integrity and copy trimming (Nov 27, 2026)

**Scope:** the 19-lab catalog remains A1–A6, B1–B3, C1–C8 (C8 optional), D1–D2. The existing controls, section structure and simulation algorithms remain intact except for one necessary D1 plot-range correction.

**Physical chart inconsistency found and corrected:**
- D1 Audio Filtering formerly calculated only FFT bins 0–249 for the displayed spectrum. With fs = 8,000 Hz and NFFT = 2,048, that limited the plot to 0–972.66 Hz, while the two-tone learning prompt explicitly asks students to compare peaks at 250 Hz and 1,950 Hz.
- D1 now plots the entire nonnegative 0–4,000 Hz FFT range (bins 0–1024). The browser pixel-evidence test exercises the actual filter UI and verifies that the 250 Hz and 1,950 Hz input/output peaks are present in the correct filter conditions. Low-pass preserves 250 Hz, high-pass preserves 1,950 Hz.
- The D2 independent browser evidence test verifies that a known target at 17 m or 27 m yields consistent two-way delay and estimated distance under a noise-free condition. The existing 90-state visual matrix also checks languages, themes and three viewport widths.

**Mathematical wording corrected:**
- A6 Sampling: a 1,500 Hz sine sampled at fs=2,000 Hz has signed alias −500 Hz (not +500 Hz with an unchanged sine phase). Its magnitude spectrum displays a 500 Hz peak; exact sample-sequence equivalence requires attention to sign and phase. The old claim that the 1,500 Hz and +500 Hz sources generate exactly the same samples without qualification has been removed.

**Selective shortening without new UI:**
- D1 and D2 Step 3 introductions no longer repeat the entire Step 2→3 relation already shown in the live-settings bridge.
- D1 and D2 summary lines now convey the core physical conclusion rather than paraphrasing the procedural instructions.
- D1's dynamic time-domain hint now varies with low-/high-/band-pass selection, directing students to an actual waveform change rather than repeating the graph caption.
- D2 optional glossary invitation was condensed; the optional theory and samplewise correlation remain available.
- Part A (6), Part B (3), and Part C (8) in-card descriptions were refined in their existing text dictionaries. No global inquiry banner, card insertion, layout restructure or new visual container was introduced.

**QA interpretation:**
- The D1/D2 physical browser-evidence tests and native Part D interaction/visual checks establish the numerical/visual findings above.
- Legacy global browser test failures referencing old markup, above-fold graph assumptions and versions are a separate QA maintenance issue, not evidence that all existing labs passed end-to-end. Do not conflate scoped evidence checks with 19-lab numerical certification.
