# Part C FFT Navigation Simplification — Implementation and QA (2026-11-23)

## User-facing curriculum
Part C now shows direct, full-row links (no accordion cards) grouped as:
- **FFT Fundamentals:** 01 FFT from Sample Data; 02 Frequency Bins & Resolution; 03 DFT vs FFT.
- **FFT Discovery:** 04 DTMF Decoder; 05 Sound Fingerprint; 06 Real Audio & Sensor FFT.
- **Optional Extension:** 07 Chirp & STFT.
- **Future Modules:** four roadmap topics behind a single collapsed disclosure, not mixed with the seven interactive labs.

The core learning route remains intact. The verbose repeated card questions and Part C banner were removed. One line of description is retained per module.

## Shared lesson navigation
`assets/ss-app-fft-path.js` and `assets/ss-app-fft-path.css` provide a compact module name and **Previous · FFT Contents · Next** action only. The old row of 7 progress numerals and the long explanatory route strip are removed. On mobile the three links fit in a two-row layout while the site header stays standard.

## DFT vs FFT page
The old multipurpose DFT vs FFT page was rewritten as three essential experiments:
1. **Same Result:** direct complex DFT vs radix-2 FFT on the same samples, two adjacent time/frequency plots, numeric complex error and an optional coefficient comparison table.
2. **Butterfly:** existing 8-point radix-2 butterfly engine, 3 stages, 12 operations, twiddle factors, selected pair detail, bit-reversed input and final direct DFT proof.
3. **Speed:** student-adjustable N, real browser runtime measurements and the theoretical N² and N log₂ N growth curves.

FFT bin resolution/windowing/zero-padding and complete audio-sensor uploads are linked to their own existing modules rather than repeated as deeply nested stages. The mathematical engines are preserved in `ss-app-fft-butterfly-core.js` and `ss-app-dft-fft-core.js`.

## Standard headers and presentation mode
- Header remains the existing `ss-common-header` with Studio navigation, Signals & Systems chapter selector, shared language and five themes (White Clean to Neutral Dark).
- Retired **Presentation mode** references were removed from Chapter 1–8, Applications, and all seven FFT pages. Unused `ss-presentation-mode.js` and `.css` files were deleted rather than hidden.
- No changes were made to course content or calculations in Chapters 1–8.

## Verification
Regression commands in `.github/workflows/applications-dft-fft.yml`:
```bash
node tests/fft-butterfly-invariants.mjs
node tests/fft-content-invariants.mjs
node tests/applications-dft-fft-regression.mjs
node tests/applications-fft-path-regression.mjs
node tests/applications-fft-six-browser-regression.mjs
```
The focused Chromium suite verifies Part C direct links (7), 3 learning groups, 4 planned roadmap items, no redundant accordion, module navigation and a standard header, all three FFT experiments and live numerical comparisons, bilingual labels, theme switches, and 390px viewport.

**Evidence:** See the [FFT learning QA workflow](https://github.com/YSCho-HGU/engineering-learning-studio/actions/workflows/applications-dft-fft.yml). Browser screenshots are attached as `fft-butterfly-browser-screenshots` and `fft-six-lessons-browser-screenshots` artifacts. The Chromium runner also installs `fonts-noto-cjk` so Korean screenshot glyphs can be visually inspected.

**Deployment boundary:** CI exercises checked-out source in real Chromium. This does not separately guarantee every GitHub Pages CDN edge has propagated at the moment the main branch is updated.
