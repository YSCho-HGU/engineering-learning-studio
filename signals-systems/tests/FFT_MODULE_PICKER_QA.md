# FFT Applications — Unified Module Navigation QA

**Date:** 2026-11-23  
**Scope:** All seven Part C FFT pages in `signals-systems/`  
**Design:** Module selector + Previous/Next. No second contents button or decorative stage-navigation strips.

## Student-facing navigation

One compact navigation area is inserted below the existing Studio / Signals & Systems standard header on each page.

- **Current module title is the selector:** click or press Enter/Space to open an accessible `<details>` list of six core modules (01–06), one explicitly labelled *Optional Extension* (Chirp/STFT), and a single link to the Part C contents.
- **Previous / Next:** direct adjacent-module links, with noninteractive disabled placeholders on the first and last lessons. No duplicated footer links or separate FFT Contents button.
- **Language:** shared EN / KR / Mixed modes applied to the selector, active module and Prev/Next labels. The current menu link has `aria-current="page"`.
- **Accessibility:** native disclosure summary, Escape to close and restore focus, outside click to dismiss, clear focus outlines, bounded menu height and scroll, mobile title truncation to avoid horizontal overflow.
- **Responsive:** a single compact bar at desktop and mobile widths while leaving the Studio standard header alone.

## Redundant navigation removed

| Page | Removed redundant UI | Kept intact |
| --- | --- | --- |
| 01 FFT from Sample Data | decorative 4-stage roadmap, additional Part C back button, duplicate chapter arrows, duplicate lower Next card | input samples, FFT/DFT calculation, time and spectrum graphs, table, practice and checkpoint |
| 02 Frequency Bins & Resolution | decorative 4-stage strip and lower previous/next navigation | true experiment selector, window, fs, N, plots, challenge and quiz |
| 03 DFT vs FFT | replaced standalone contents button in shared path | Same Result / Butterfly / Speed experiment tabs and all existing calculations |
| 04 DTMF Decoder | duplicate four-link header outline and lower previous/catalog links | Listen / FFT / Decode interactive controls and section headings |
| 05 Sound Fingerprint | duplicate four-link header outline and lower previous/next/catalog links | sound prediction, FFT profiles, compare and quiz |
| 06 Real Audio & Sensor FFT | lower previous/catalog links | real audio/sensor uploads, frequency plots and harmonic hypotheses |
| 07 Chirp & STFT (optional) | duplicate four-link top outline and lower previous/catalog links | moving FFT frame controls, time/frequency plots and spectrogram |

Orphaned translation entries and page-specific CSS rules for removed elements were deleted rather than merely hidden.

## Automated verification

**GitHub Actions:** [FFT curriculum and lab QA — successful run 45187420114](https://github.com/YSCho-HGU/engineering-learning-studio/actions/runs/45187420114).

In real headless Chromium, the following checks passed:

1. Part C catalog retains 6 core working labs, 1 optional extension and 4 future topics.
2. Every lesson renders exactly one shared module selector with seven entries and the correct `aria-current="page"` and module number.
3. Previous and Next destinations are correct, including first/last disabled boundaries.
4. The entire menu opens, Escape closes it, and a direct link from the menu navigates to DFT vs FFT.
5. EN/KR changes the selector label correctly; the standard course header remains visible.
6. The 390px mobile page has no horizontal overflow; extra step strips and footer navigation are absent.
7. Existing direct DFT/FFT, all twelve 8-point butterflies, numeric invariants and six other FFT lab-specific browser scenarios remain passing.
8. Browser screenshots are stored as workflow artifacts `fft-butterfly-browser-screenshots` and `fft-six-lessons-browser-screenshots`.

### Local commands
```bash
node tests/fft-butterfly-invariants.mjs
node tests/fft-content-invariants.mjs
node tests/applications-dft-fft-regression.mjs
node tests/applications-fft-path-regression.mjs
node tests/applications-fft-six-browser-regression.mjs
```

### Verification limit

The tests run the checked-out source in actual Chromium and verify interactions and layout assertions. They do not separately verify propagation to every GitHub Pages CDN edge, or pixel-perfect rendering in browsers beyond the tested Chromium environment.
