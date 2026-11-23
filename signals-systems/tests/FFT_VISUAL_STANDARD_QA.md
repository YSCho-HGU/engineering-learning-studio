# FFT Applications — Unified Visual Standard & Browser QA

**Date:** 2026-11-23  
**Coverage:** all six core FFT Applications and the optional seventh Chirp/STFT module.  
**CI evidence:** [passing Chromium run 45189934957](https://github.com/YSCho-HGU/engineering-learning-studio/actions/runs/45189934957)  
**Visual screenshots artifact:** `fft-seven-visual-standard-screenshots` (21 PNG screenshots and `measured-layout.json`).

## Design principles

- **One CSS contract:** `signals-systems/assets/ss-app-fft-visual-standard.css` is linked last, after each page's existing styles. It defines common presentation variables; it does not alter FFT algorithms, signal samples, plot data, SVG viewBox geometry, or lab event handlers.
- **Standard site header:** retain existing Studio / Signals & Systems shared header, theme selector, language selector, and common FFT module picker. Do not reintroduce Presentation mode.
- **Desktop:** panel padding 14px, panel radius 12px, gap 12px, plot title 16px, minimum select/button/text input height 40px, displayed formulas approximately 18.85px at 1366px viewport, body text 14–15px.
- **Mobile (390px):** panel padding 12px, gap 10px, plot title 15px, the same 40px minimum control height, formulas 17px, equations scroll locally as needed.
- **Graph semantics:** preserve native SVG coordinate systems, frequency labels, spectrum peaks, and chart-specific datasets; plot title/tick/axis font roles inherit common typography variables. Keep time and frequency graphs side by side where there is sufficient desktop space.
- **Mathematics:** retain KaTeX rendering and baselines; wide display formulas use internal horizontal scrolling, not document-level overflow.
- **Theme:** test both Neutral Dark and White Clean; use existing theme tokens for borders and background, not hard-coded white/black cards.

## Real Chromium verification

The GitHub Actions workflow runs existing FFT numerical and interactive browser regression suites plus:

```bash
node tests/applications-fft-visual-standard.mjs
```

At **1366 × 850** and **390 × 844**, the test checks actual computed CSS values for all seven pages.

| Computed value | Desktop dark | Desktop white | 390px mobile |
| --- | --- | --- | --- |
| Panel padding | 14px | 14px | 12px |
| Panel radius | 12px | 12px | 12px |
| Plot heading | 16px | 16px | 15px |
| Minimum select height | 40px | 40px | 40px |
| Formula font size | ~18.85px | ~18.85px | 17px |
| Gap token | 12px | 12px | 10px |
| Document-level horizontal overflow | 0px | 0px | 0px |

All seven pages passed all three view/theme variants, with no JavaScript page errors or KaTeX errors. Existing tests for direct DFT vs FFT, 8-point Butterfly, 7-module navigation, sound fingerprint, DTMF, audio/sensor CSV FFT, and Chirp/STFT also passed.

## Visual screenshot inspection

The 21 PNGs were downloaded and inspected as dark, white, and mobile contact sheets. Verified:

- Standard header and module picker remain in place.
- Same panel border radius and content padding across seven labs.
- Larger, consistent chart headings even on the DFT-vs-FFT and Sound Fingerprint pages, which use `h3` internally.
- Paired time and FFT graphs remain adjacent on desktop in the sample and resolution lessons.
- Math areas do not push their pages wider than the viewport.
- Neutral Dark/White Clean use matching structural spacing without unusual light-on-dark or black polygon overlays.
- The 390px viewport is free of global horizontal scrolling.

**Known limitation:** wide viewBox SVG plots shrink proportionally on a 390px phone, so some axis annotations are still small even though panel spacing and document width are correct. This task deliberately does not warp data coordinates or add scrolling-only graphs. A later optional tap-to-expand / graph zoom interaction would improve mobile reading. Likewise, the real-data upload module intentionally displays blank plots until a file or demo is selected; that is not a rendering failure.

## Reproducibility

Source: `tests/applications-fft-visual-standard.mjs` and `.github/workflows/applications-dft-fft.yml`; screenshot artifact: `fft-seven-visual-standard-screenshots`. The test records `measured-layout.json` with module, viewport, theme, card, plot, and math measurements.

**Scope boundary:** testing was conducted on checked-out source in actual headless Chromium. GitHub Pages CDN propagation, non-Chromium rendering, and real-device hardware behavior were not independently verified.
