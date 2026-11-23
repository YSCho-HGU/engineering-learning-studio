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
