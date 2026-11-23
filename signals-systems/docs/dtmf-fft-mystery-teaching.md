# Applications Part C · DTMF Mystery Decoder

## Learning objective and Eureka moment
A student hears a mysterious telephone keypad sound and cannot identify the digit reliably from the waveform. By running FFT on the actually generated sound and matching **one low-frequency peak** plus **one high-frequency peak** against the DTMF table, the student recovers the hidden key. The answer is not revealed until the student submits the correct key.

## Lesson structure
1. **Predict:** Listen to a local, originally synthesized keypad sound. The identity of the pressed key remains hidden in the UI.
2. **Observe:** Run the FFT, view the two prominent peaks and adjust observation-window position, length N (256, 512, 1024, 2048), and Hann or Rectangular window.
3. **Decode:** Read the low-frequency row and high-frequency column in the DTMF reference map; pick a telephone key. Answer checking is disabled until an FFT is actually displayed. Incorrect guesses get a hint rather than the answer.
4. **Explain:** Discuss the relation between the sum of two sinusoids and two Fourier peaks, non-bin-centered frequencies, bin spacing `fs/N`, and what happens when several keys occur in sequence.

A basic challenge has one mystery key. An extended challenge has **three successive mystery keys**, each with its own sound and FFT, followed by a final reflection on why a single FFT of a concatenated sequence cannot determine digit order.

## DTMF standard
The conventional 12-key pad (0–9, * and #) uses low-frequency rows 697, 770, 852, 941 Hz and high-frequency columns 1209, 1336, 1477 Hz, with one frequency from each group per key. The wider ITU-T Q.23 system also has a 1633 Hz high-frequency column for A/B/C/D, but the classroom activity deliberately uses only the familiar 12-key subset.

Reference: [ITU-T Recommendation Q.23](https://www.itu.int/rec/dologin_pub.asp?id=T-REC-Q.23-198811-I%21%21PDF-E&lang=e&type=items); [ETSI TS 101 235-1](https://www.etsi.org/deliver/etsi_ts/101200_101299/10123501/01.01.01_60/ts_10123501v010101p.pdf).

## Calculation integrity
- Local synthesizer: `fs = 8000` Hz, 0.46 second sample record, two **simultaneous** sinusoids with a short fade at either end to prevent switching clicks.
- FFT uses a radix-2 Cooley–Tukey implementation on the **actual selected N samples** with Hann or Rectangular window.
- One-sided magnitude spectrum and low/high group maximum peaks are computed from the FFT; optional quadratic interpolation in log amplitude refines frequency display without changing FFT bins.
- These are instructional synthesized tones, not recordings of real telephones; no sound is downloaded and no user audio is uploaded.
- Avoid equating the detected sub-bin peak with exact frequency resolution. Varying N changes sampling of the underlying spectrum and leakage pattern; the peaks may not align with discrete bins.

## Student assessment
- Correctly identify both frequency groups and decode the hidden keypad digit.
- Explain why time-domain appearance is less transparent than two frequency peaks.
- Compare FFT bin spacing at N=256 and N=2048.
- Independently decode three consecutive tones; explain why each segment must be selected separately to retain order.

## Regression
`tests/ss-dtmf-decoder-browser.mjs` checks all 12 keys at four FFT sizes (48 numerical cases), secret concealment, interactive wrong/correct guesses and sequence challenge, EN/KO/Mixed language modes, five themes, KaTeX, desktop/mobile rendering and Presentation Mode. The existing Applications workflow must enforce its outcome as part of the combined QA.
