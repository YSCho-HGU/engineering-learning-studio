# Lecture Presentation Mode and shared plot typography

## Presentation Mode

The opt-in `ss-presentation-mode.js` and `ss-presentation-mode.css` are included in every Chapter 1–8 and Applications page. The button is added to the shared header without modifying lesson-specific HTML or scripts.

- Activate with the button or keyboard **P** when not editing an input; exit using **Esc** or the same button.
- Visual presentation state lives only in the current document (`data-ss-presentation="on"`). Existing language/theme, learning progress, slider and selection data remain unchanged.
- A wide projector view prioritizes the graph region while keeping the controls present; two FFT graphs remain side by side when there is sufficient horizontal space.
- On narrow screens it reverts to a legible single-column presentation.
- A resize event prompts chapters which respond to viewport changes to redraw their canvases.
- All instructional content stays accessible by normal page scrolling; the button is not a browser fullscreen toggle.

## Graph typography

`ss-plot-typography.css` defines shared size tokens for plot titles (15 px), SVG axis labels (13 px), ticks (12 px), legends (13 px), and display equations (responsive 17–21 px), with larger presentation and 1920px values and smaller phone values. It operates on recognizable existing class names rather than forcing all SVG text to one size. This protects equation glyphs and detailed plot annotations.

The Part A Canvas plot-axis routine uses 12px tick text and 13px axis titles. Other canvas graphs retain their native renderers where changing drawing routines would risk altering plotted geometry or hit-testing; future graph renderers should read these tokens and keep axis symbols, labels, and scientific units semantically correct.

## QA

The browser regression visits 1920, 1366, 768, and 390px layouts, Chapters 1–8, and Applications. At 1920px it exercises the Presentation Mode control, tests accessibility pressed state, checks layout overflow and returns with Esc. Existing Section-level regression separately covers all 62 Sections across language and theme modes.

This is layout and visual typography QA rather than a full numerical audit of every plotting parameter.
