# Chapters 1–8 — Graph typography contract

## Canvas rendering (Chapters 1–6)

A single `SSCanvasTypography` utility in `assets/ss-canvas-typography.js` reads the responsive CSS variables from `ss-plot-typography.css` **at draw time**. Chapter 1–4 distinguishes tick and axis-title font roles; Chapters 5–6 apply the same roles and add separate annotations and minor markers.

| Role | Notebook 1366px | Projector 1920px | Tablet ≤860px | Phone ≤600px | Presentation Mode on wide screens |
|---|---:|---:|---:|---:|---:|
| Canvas axis ticks | 13px | 14px | 12px | 11px | 15px |
| Canvas axis labels | 15px | 16px | 14px | 13px | 18px |
| Canvas annotations | 12px | 13px | 12px | 11px | 14px |
| Minor plot marks | 11px | 12px | 11px | 10px | 12px |
| HTML legends | 13px | 14px | 12px | 12px | 15px |

Values are for ordinary learning mode unless the Presentation Mode column is selected. Special math-axis KaTeX overlays use the shared `--ss-plot-axis-size` variable and continue to fit within the graph.

**Scientific integrity:** x/y coordinate transforms, signal synthesis, axes locations and figure data remain unchanged. Text font roles are changed without shifting plot origins. Screen-reader labels and the existing theme palette are preserved.

## SVG rendering (Chapters 7–8)

Native SVG plots now distinguish `ss-plot-tick` and `ss-plot-axis-title` in generated markup. This allows font size to follow the same shared tokens in the CSS; the original SVG viewBox and numerical tick values are unchanged. `.plot-card .legend` and `.axis-key` use the shared legend size.

## Regression

The browser test `tests/ss-plot-typography-browser.mjs` intercepts actual Canvas text draw calls, records requested font sizes and transform-space positions, and audits native SVG tick/axis elements at projector, desktop, tablet and phone widths. It visits every Chapter Section at projector and phone sizes and chapter bookends at intermediate sizes, with representative screenshots and machine-readable results.

The test detects font sizes below 10px, text anchor coordinates far beyond Canvas bounds, missing SVG axes/ticks and horizontal overflow. This does not replace a human review of visual attractiveness or mathematical accuracy of every plotted curve. It also does not yet assert pixel-perfect collision-free typography for every possible graph state.
