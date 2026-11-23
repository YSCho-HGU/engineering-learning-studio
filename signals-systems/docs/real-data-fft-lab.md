# Applications Part C — FFT of real audio, music and sensor data

## Scope
This laboratory is **FFT only**. It imports an audio recording or sensor CSV locally in the browser, selects a single observation segment, and displays its waveform and **one-sided amplitude FFT**. It does not compute STFT or Spectrogram.

## Four student steps
1. **Load actual samples** — choose WAV, MP3, OGG or another audio codec supported by the browser, or CSV/TXT containing sensor readings. Sensor CSV may contain a numeric `time_s`, `time_ms`, `timestamp` or analogous column and multiple value channels. Choose a sensor column to analyze. Uploads are processed in the browser and are not sent to a server.
2. **Select N samples** — choose N=256…8192, an analysis region, and Rectangular or Hann window. The shaded section of the waveform is the exact FFT input. The default removes the segment mean, suppressing DC. The underlying original waveform is not modified.
3. **Compute FFT** — the plotted spectrum is a one-sided amplitude spectrum with coherent-gain normalization. Inspect the dominant non-DC peak and top five separated local spectral peaks. The largest peak may **not** be a fundamental, particularly for harmonic-rich music or periodic sensor data.
4. **Explain frequency units** — if the sampling frequency is known, a bin corresponds to (f_k=k f_s/N) Hz; otherwise, use the normalized frequency (
u_k=k/N) cycles/sample. FFT samples alone cannot determine the scale in Hz.

## Input provenance
- Audio files are decoded by the browser's Web Audio API. The effective **decoded** sample rate is used for frequency mapping, including if the browser has resampled an input file. Stereo/multichannel audio is averaged to mono. The first at most 3,000,000 decoded samples are available for selection. The file-size limit is 25 MB.
- CSV with a consistently spaced numeric time column can infer (f_s) from the median positive step. Irregular or non-monotonic time stamps do **not** establish a uniform (f_s), and students should not interpret an irregularly sampled sensor sequence as if it were a regular recording without appropriate resampling.
- Single-column CSV has no physical sampling-rate metadata. Students can manually provide an established (f_s), or set it to 0 (unknown) and use cycles/sample.
- The maximum parsed sensor dataset length is 300,000 valid rows. Non-numeric or blank values are skipped, and file information reports skipped rows.
- All signals remain within the current browser document. There is no server upload action or persistent file storage.

## Correct interpretation
The bin spacing is (f_s/N) when (f_s) is known, and (1/N) cycles/sample otherwise. This is a **selected-window FFT**, not an FFT of the complete recording. The duration of that selection is (N/f_s) only if (f_s) is available. Windowing trades leakage against main-lobe width. Mean removal means the reported DC bin is intentionally suppressed. Spectral amplitudes are not calibrated PSD estimates.

## QA
`tests/ss-fft-upload-browser.mjs` verifies known-tone bin/frequency/amplitude, a two-harmonic spectrum, inference of (f_s) from CSV time stamps, unknown-(f_s) normalization, changing selected intervals, selecting different IoT channels, local WAV upload and spectrum, EN/KO/Mixed, five themes, math rendering, and 1366px/390px overflow. This is part of the Applications GitHub Actions workflow.
