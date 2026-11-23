# Applications common mathematical typography and rendering standard

## One rendering path

All Applications pages (hub, Part A labs and FFT labs, including future labs) use:

1. KaTeX CSS and deferred KaTeX JS, pinned to the same version.
2. \`ss-math-core.js\` for explicit \`data-ss-math\` sources and rendering/auditing.
3. \`ss-applications-math.js\` for prose conversion in the page's \`<main>\`, including dynamically inserted nodes after a lab or language switch.
4. \`ss-applications-math.css\` for the same inline/display typography, spacing, fallback, and overflow rules.

Load the scripts in that order. The adapter calls \`SSMathCore.install({beforeRender: enhance})\`. It scans all of \`main\` rather than maintaining a fragile list of Chapter or lab roots. It skips code blocks, form inputs, SVG labels, KaTeX descendants and already-authored mathematical nodes.

## Authoring

**Prefer explicit math sources for equations or ambiguous notation.**

- Inline: \`<span data-ss-math="\nu_k=\frac{k}{N}" data-ss-math-display="inline" data-ss-math-fallback="νk=k/N"></span>\`
- Display: \`<div data-ss-math="\Delta f=\frac{f_s}{N}" data-ss-math-display="block" data-ss-math-fallback="Δf=fs/N"></div>\`
- Dynamic prose: \`\\(f_k=kf_s/N\\)\` or \`\\[\Delta f=f_s/N\\]\`, written as literal delimiters in rendered text.
- A small, controlled dictionary also converts the commonly used inline tokens \`x[n]\`, \`X[k]\`, \`fₛ\`, \`Δf\`, \`2π\`, etc.
- Provide a text fallback. Never invent a physical unit when the sample rate is unknown.
- Native graph/SVG axis text stays plain, to avoid interfering with graph geometry; label semantics should remain consistent.

**Do not manually run a second independent KaTeX renderer on newly added prose.** Use \`window.SSMathCore?.queue?.()\` after rewriting content (the observer also handles ordinary DOM changes).

For future pages, include the four shared dependencies above and put educational content inside \`<main>\`. No custom root selector or lab-specific adapter changes are needed. The existing legacy Part A plot-equation renderer may remain for backwards compatibility; the common audit checks that its source was rendered.

## Regression contract

\`tests/ss-applications-math-audit.mjs\` visits the Applications hub's four parts, the six Part A labs, and both FFT labs in English/Korean/Mixed modes. It rejects missing/invalid explicit formulas, unrendered KaTeX, raw LaTeX visible in prose and browser errors. It also inserts and removes a **future dynamic card** containing inline LaTeX and an automatically recognized token, verifying both are rendered without per-lab changes.

GitHub Actions runs this alongside the independent functional browser suites and publishes a machine-readable audit artifact. It does not validate scientific correctness of every formula, so formula changes still require conceptual review.
