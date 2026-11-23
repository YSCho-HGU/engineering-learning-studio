# Part C · FFT Learning Path — Curriculum + QA

## Curriculum design
The complete Part C is **FFT-first**, with seven usable interactive labs in one sequential path, followed by a separate group of four future modules. The optional STFT lesson is the last step, not a prerequisite for FFT discovery.

| Step | Group | Lab | File |
| --- | --- | --- | --- |
| 01 | Core | FFT from Sample Data | applications-fft-lab.html |
| 02 | Core | Frequency Bins and Resolution | applications-fft-resolution.html |
| 03 | Core | DFT vs FFT | applications-dft-fft.html |
| 04 | Discovery | DTMF Mystery Decoder | applications-fft-dtmf.html |
| 05 | Discovery | Sound Fingerprint | applications-fft-sound-fingerprint.html |
| 06 | Discovery | Real Audio, Music & Sensor Data | applications-fft-upload.html |
| 07 | Optional | Chirp, STFT and Spectrogram | applications-chirp-stft.html |

The existing "Spectral Leakage and Windows" and "Zero Padding and Spectral Detail" **planned cards were removed**, not hidden: both topics already belong to the working Frequency Bins / Resolution and DFT vs FFT labs. Their demonstrations and learning content were retained. The future-only modules are Magnitude/Phase/IFFT, FFT-based convolution, 2D FFT of images and temporal FFT of video.

## Integration architecture
- `assets/ss-applications-hub.js` owns the canonical Part C card order and groups.
- `assets/ss-app-fft-path.js` owns the ordered navigation for the seven available HTML labs; `ss-app-fft-path.css` provides shared responsive styles.
- Every lab includes the shared navigation script and stylesheet. Existing footer URLs and translated labels were aligned with the same sequence.
- The cards show "interactive lab" or "planned" status even when collapsed; only the start-here card is expanded initially.
- Language modes follow the Studio shared `ELSLanguage` selector. Appearance uses `--els-*` theme tokens.
- Other Part A, Part B and Part D curricula were not reordered.

## QA
Automated browser regression:
```bash
npm install --no-save playwright@1.56.1
npx playwright install chromium
node tests/applications-dft-fft-regression.mjs
node tests/applications-fft-path-regression.mjs
```
GitHub Actions: `.github/workflows/applications-dft-fft.yml`.

The new regression checks the number and order of phase groups (3/3/1/4), seven working links, four roadmap items, removal of duplicated planned cards, internal navigation across seven pages, current position, and compact mobile navigation.

**Verification boundary:** source/readback and JavaScript syntax checks passed. The declared seven lab targets match the shared path sequence, and links were checked in the connected repository. Full headless-browser execution / GitHub Actions job outcome has not been confirmed in this session; do not call the browser suite passing without a run result.
