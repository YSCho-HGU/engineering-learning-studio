# Engineering Learning Studio — Design System v1.0.0

**Released:** 2026-11-15  
**Canonical source:** \`YSCho-HGU/engineering-learning-studio/assets/design-system.css\`  
**Mirrors:** \`YSCho-HGU/signals-systems-visual-lab/assets/design-system.css\`  
**Scope:** Existing and future C, Signals & Systems, Python, DSP, Logic Design, IoT and other engineering course websites.

## 1. Governing principles
1. **Learning first:** Prediction → interaction → observed evidence → explanation. Visual accents communicate meaning, never mere decoration.
2. **One semantic palette:** a single token contract, with system/light/dark support. Do not manually hardcode text/background pairs for each new lesson.
3. **Readable mathematics:** \`"Cambria Math",Cambria,"STIX Two Math",serif\`; no illegible equation wrapping, provide horizontal overflow for unusually long formulas.
4. **Readable code:** Consolas or Liberation Mono, ligatures OFF (ensure \`!=\`, \`==\` are visibly distinct).
5. **WCAG 2.2 AA as a target:** text contrast ≥ 4.5:1 for ordinary text, ≥ 3:1 for large text, 3:1 for meaningful UI boundaries/focus; test real combinations, not tokens alone.
6. **Accessible interaction:** button targets ideally ≥ 44 CSS px (WCAG 2.2 2.5.8 minimum is 24×24 CSS px with exceptions); visible keyboard focus, semantic labels, selected states with wording/shape beyond color; reduced-motion support.
7. **Plots are data, not ordinary cards:** keep trace colors, graph backgrounds, axis and legend contrast together. Always independently validate Light and Dark plots in a real browser.
8. **Truthful execution:** distinguish C program, simulation, reference expected output and student-run result.

## 2. Token API
Shared tokens in \`assets/design-system.css\`:
- Foundation: \`--els-page\`, \`--els-surface\`, \`--els-surface-alt\`, \`--els-ink\`, \`--els-muted\`, \`--els-border\`.
- Controls: \`--els-primary\`, \`--els-primary-text\`, \`--els-link\`, \`--els-focus\`.
- Meaning: \`--els-success\`, \`--els-warning\`, \`--els-info-bg\`, \`--els-info-ink\`.
- Developer content: \`--els-code-bg\`, \`--els-code-ink\`, \`--els-code-accent\`.
- Sizing: \`--els-radius\`, \`--els-space\`.

| Surface / text | Light | Dark |
|---|---|---|
| Page | #F5F8FC | #0F1B2B |
| Main card | #FFFFFF | #1D2C40 |
| Primary text | #14263A | #F1F7FF |
| Muted text | #455B70 | #C8D9EB |
| Border | #98AEC2 | #8199B4 |
| Focus ring | #085D95 | #FFDC79 |
| Primary control | #075A93 / white | #A1D7FF / #102338 |

**Example (course-specific component):**
~~~css
.course-card {
  background: var(--els-surface);
  color: var(--els-ink);
  border: 1px solid var(--els-border);
  border-radius: var(--els-radius);
}
.course-card a:focus-visible { outline: 3px solid var(--els-focus); outline-offset: 3px; }
~~~

## 3. Architecture: canonical + course adapters
- **Canonical file** lives at Engineering Learning Studio \`assets/design-system.css\`.
- Every published course repository **mirrors an exact copy** at \`assets/design-system.css\`. This preserves offline/local availability and avoids cross-domain CSS dependency.
- Course-specific adapter (e.g. \`assets/ss-site-theme.css\`, \`assets/ss-lab-theme.css\`) maps old styles to tokens; do not modify shared token values from course code unless explicitly approved as a versioned design decision.
- HTML includes design-system.css first, then legacy styles/adapter as appropriate. Verify CSS cascade order and explicit dark/light rules on real pages.
- Embedded iframe/srcdoc labs need theme CSS links inside the frame; theme switching must also update the frame theme attribute.
- Every future course should ship its own subject-specific adapter while keeping semantic color meanings stable.

## 4. Version and release workflow
- **SemVer:** PATCH = non-breaking contrast/CSS fix; MINOR = additive token/component API; MAJOR = removed/renamed token or changed behavior.
- Update \`assets/design-system.css\` and \`assets/design-system.version.json\` in the canonical repository first.
- Copy **identical bytes** to each live course mirror and update their version manifests. Verify token names and local site assets load.
- Preserve existing course adaptations; do not change simulation math or graphs during a design-system-only release.
- Record the release with commit SHA, theme contrast calculation, browser screenshots, keyboard/mobile accessibility checks, and any known exceptions.
- For future repos, use the starter template and adoption checklist. This release does not automatically update repositories that do not yet exist.

## 5. Accessibility and content QA gates
1. Check normal/secondary/link/button text/background contrast in both themes; enforce 4.5:1 for body copy and 3:1 for large text.
2. Check selected, hover, disabled, error, success, focus states and non-text UI borders, not just default.
3. Test 360, 768, 1280 CSS px widths, plus 200% zoom and reduced motion.
4. Keyboard-only navigation: no focus traps; confirm all simulation/probe actions and dropdowns.
5. Screen-reader verification: graph alternatives/accessible labels, equation context, outputs and dynamic result announcements.
6. Confirm student path: **goal → prediction → experiment → explanation → independent practice**.
7. Compare representative chart screenshots in both themes; check axis labels, legends, line thickness and background.
8. Run existing course-specific numerical and interaction regressions.

### Calculated token-level examples (not blanket WCAG certification)
- Light body on white: 15.35:1; muted on white: 7.04:1.
- Dark body on surface: 13.11:1; muted on surface: 9.81:1.
- Dark primary button: 10.37:1.
**All combinations and screen readers still require browser QA.**

## 6. Course adoption status at this release
- Engineering Learning Studio C Programming: original canonical source.
- Signals & Systems Visual Lab: exact shared CSS mirror + chapter/site adapters, with existing graph plotting untouched.
- Future course sites: adoption contract/checklist supplied, not yet created or deployed.

**Avoid conflating a shared palette with verified pedagogical effectiveness.** Use student outcomes and independent problem solving as acceptance evidence.
