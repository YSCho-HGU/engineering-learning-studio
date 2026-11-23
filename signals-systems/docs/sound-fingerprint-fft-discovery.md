# Sound Fingerprint · Piano, Guitar and Voice FFT Discovery

## Student Eureka objective
A student hears three sounds (A/B/C) at one nominal fundamental frequency but cannot confidently identify them from pitch alone. They inspect the single-window FFT, predict the source, and then reveal the labels and **relative distribution across harmonic orders**. The key discovery is that **same fundamental frequency does not imply same timbre**.

## Lesson
1. **Listen & predict:** Play three hidden sounds A/B/C, select one, record a prediction. The UI does not reveal correctness until the student explicitly selects Reveal.
2. **Observe:** View the selected waveform and one-sided FFT. Choose a reference fundamental (110, 220 or 330 Hz), N=2048/4096/8192, Hann/Rectangular window, and sample interval position. Both a short-time observation and the actual computed FFT are updated.
3. **Reveal & compare:** Show the three models/recordings, and compare 10 harmonic magnitudes, normalized as shares of the **sum of those 10 magnitudes**, not dB or absolute loudness. All three use the same sampling frequency and FFT configuration.
4. **Explain:** Answer why signals of the same reference f0 can sound different. Harmonic balance is one reason; attack, decay, phase behavior, formants and recording conditions also affect timbre.

## Data provenance: synthetic versus real

**Default A/B/C examples are *not* authentic piano, guitar or human voice recordings.** They are deterministic originally synthesized harmonic models with envelopes chosen to illustrate three distinct distributions:
- Piano-like: stronger first harmonic and moderately decaying overtones, slow exponential decay
- Guitar-like: comparatively stronger higher harmonics and faster plucked decay
- Voice-like: a synthetic vowel-inspired spectral envelope with prominent formant-like harmonic groups and slight periodic modulation

These are simplified models, not authoritative predictions of how particular instruments, performers or vowels must sound. The instrument identities are revealed as **-like** labels.

**Optional real recording mode:** Each model can be replaced independently with a locally selected browser-decodable audio file, preferably three recordings of the *same sustained note*. The audio is downmixed and resampled to the common analysis rate of 16 kHz. Decoded files are capped at a short segment and remain in the page memory; the browser never sends files to a server. Students must check and align f0, recording segment and loudness before drawing conclusions. The shared f0 selector is a **reference**: no fundamental frequency tracker or pitch correction is applied to uploaded files.

## Signal processing
- Common sample rate: 16,000 Hz
- Default f0: 220 Hz
- FFT N=2048, 4096, or 8192, with bin spacing fs/N
- Hann or Rectangular coherent-gain normalized, one-sided FFT magnitude
- For each harmonic order h=1..10, the local spectral maximum in a narrow vicinity of h f0 is sampled
- Percent share is `100 * A_h / sum(A_1..A_10)`; this describes harmonic magnitude ratios only, not physical acoustic energy or perceived timbre quantitatively

## Limits and instructional accuracy
- Playing instrument notes at a nominal common f0 does not ensure that acoustic waveforms have identical exact fundamentals, especially if tuning and onset differ.
- Pitch, temporal envelope, formants, inharmonicity, reverberation, playback and microphone response may also distinguish sources. The selected FFT does not describe all time dynamics.
- The synthesized examples are clean controlled demonstrations. Results from real recordings are demonstrations of **particular sampled recordings**, not broad facts about all piano/guitar/voice sounds.
- This activity does not classify a real recording automatically: the labels attached to uploaded files come from the uploader's choice, and source identification is a student hypothesis.

## Automated quality assurance
`tests/ss-sound-fingerprint-browser.mjs` exercises FFT values and 10-harmonic normalized profiles across the three models; pitch and FFT resolution changes; hidden A/B/C listening hypothesis and reveal gating; uploaded WAV decoding; quiz feedback; EN/KO/Mixed localization; all five themes; desktop/mobile rendering and Presentation Mode. It is enforced in `.github/workflows/ss-applications-browser.yml`.

This lesson fits after DTMF Mystery Decoder and before FFT upload in Part C.
