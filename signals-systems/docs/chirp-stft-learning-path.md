# Applications Part C · Chirp, STFT, and Spectrogram

## Four-step interactive learning path

1. **Chirp signal** — adjust the initial and final instantaneous frequencies. A linear chirp uses phase \(2\pi[f_0t+(f_1-f_0)t^2/(2T)]\), so the instantaneous frequency is \(f_0+(f_1-f_0)t/T\).
2. **Global FFT** — inspect a complete-record FFT and recognize that its magnitude spectrum cannot indicate *when* an individual frequency occurred.
3. **Moving-window FFT** — select a frame on the waveform or through the frame slider. The short-time FFT changes as the local instantaneous frequency changes.
4. **Spectrogram** — every time column is obtained from an actual M-point FFT of one windowed length-L segment. The selected frame is highlighted in the waveform, local FFT and spectrogram.

## Calculation and display conventions

- Default \(f_s=512\) Hz, \(T=2\) s, \(f_0=20\) Hz and \(f_1=180\) Hz, with \(N=1024\) samples.
- Default Hann window of L=128 samples, 75% overlap, and hop H=32 samples (62.5 ms). There are 29 valid complete frames.
- Full FFT uses the N original samples and is normalized by N. Local FFT uses the selected analysis window and coherent-gain normalization (sum of window coefficients).
- The STFT is computed with a radix-2 FFT. M can be L or 2L. Zero padding changes displayed bin grid \(f_s/M\) but does not change original \(f_s/L\) or the captured window length.
- The spectrogram uses \(20\log_{10}(|X(m,k)|/\max|X|)\), clipped to [-60,0] dB. This is a **relative magnitude dB display** of STFT magnitude, not a calibrated physical PSD. The mathematical power spectrogram is \(|X(m,k)|^2\).
- The frequency axis is in Hz; data generation requires frequencies below Nyquist. The line through the local spectrum marks the *theoretical instantaneous frequency*, while the measured STFT maximum is displayed separately.
- The frame slider and spectrogram click selection are linked; language modes EN, KO and Mixed, five shared themes, KaTeX and Presentation Mode are supported.

## Pedagogical cautions

- A full-record magnitude FFT describes spectral content but cannot reliably communicate temporal order. Contrast it with the time-ordered STFT.
- A shorter analysis window offers better temporal localization at the expense of frequency discrimination. Overlap/hop changes how densely the STFT is sampled along the time axis, **not** the observation window length or its intrinsic frequency resolution.
- For a chirp, the finite window contains more than one instantaneous frequency; a broad local peak is not necessarily a computational error.
- Longer windows and overlap generate more image detail, but do not create missing information from the original recorded samples.

## QA and regression

`tests/ss-chirp-stft-browser.mjs` verifies FFT of a known pure tone, chirp ridge direction, exact frame duration/hop/bin spacing, zero-padding invariants, interactive frame controls, mission feedback, math, language/theme, narrow responsive rendering and Presentation Mode. The test is part of `ss-applications-browser.yml` and the new lab is included in the common Applications math audit.

The workflow compares representative rendered pages and numerical invariants, not a certified STFT library at every parameter setting.

## Extended exercises: frequency patterns and resolution comparison (2026-11-23)

**Q2 — Three signal patterns.** The `Frequency pattern` control now selects:
- Rising linear chirp: (f(t)=f_0+(f_1-f_0)t/T), with a continuous quadratic phase.
- Falling linear chirp: (f(t)=f_1+(f_0-f_1)t/T), with a continuous quadratic phase.
- Step-frequency signal: (f(t)=f_0) before (T/2) and (f(t)=f_1) from (T/2) onward. The signal phase is integrated **continuously** across the transition; the phase does not reset when the frequency jumps.

The full FFT, selected-frame FFT and spectrogram are all computed from the newly generated samples, not a fixed image or shifted drawing. The equations and explanatory text are updated for the selected signal. Both frequency controls are relabeled to make their roles in the falling and step signals clear.

**Q1 — Controlled time–frequency comparison.** A comparison section shows two actual STFT heatmaps with one shared magnitude-dB color reference. Both panels always start from the **same sampled signal**, with precisely one analysis variable family changed.

| Experiment | Left | Right | Correct interpretation |
|---|---|---|---|
| Window duration | L=64, 75% overlap | L=256, 75% overlap | At 512Hz, 125ms / 8Hz vs 500ms / 2Hz original bin spacing |
| Frame overlap | L=128, 0% overlap | L=128, 75% overlap | At 512Hz, H=128 vs H=32; both retain 250ms / 4Hz window and bin spacing |

The student can compare visible sharpness of a sudden frequency transition and density of time samples, and inspect displayed window duration, bin spacing, hop and frame count. The overlap experiment must **not** be described as improving intrinsic frequency resolution. FFT zero-padding also remains separate from true acquisition-time resolution.

The browser suite `tests/ss-chirp-stft-browser.mjs` now tests increasing/decreasing ridge direction, piecewise step transition and phase continuity, the exact short/long-window and overlap invariants, live controls and the three language modes.
