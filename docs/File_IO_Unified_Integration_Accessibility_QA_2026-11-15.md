# File I/O Unified Learning Course — Integration & Accessibility QA

**Date:** 2026-11-15  
**Status:** GitHub code integrated; live visual/browser acceptance pending.

## Scope
- Student landing path: `/c-programming/file-io/`
- Eight consistent learning steps, with embedded prediction-first file-mode lab at Step 03 and EOF/error lab at Step 05.
- Existing explanations and Stage 01, 02, 04, 06–08 activities preserved.
- P1–P6 coding practice remains linked from the course and is explicitly not a real browser GCC compiler.
- Independent `/pilot/` source was preserved for regression and comparison but is no longer advertised as a separate required learning route on C course home.

## Student activity loop
1. Find the correct step via the eight-step sidebar.
2. Read the goal and select an input scenario.
3. Predict the behavior; answer correctness is withheld until the experimental trace completes.
4. Execute `fopen`, `fgets`/`fputs` or `fprintf`, and `fclose`; observe file data, return value and trace close to the controls.
5. Compare predicted and observed outcomes.
6. Record at least one explanation. Completion is *learning activity evidence*, not an automatic assessment of writing quality.
7. Move to P1–P6 to implement C programs. True coding mastery remains unverified until actual compilation and runtime tests.

## WCAG 2.2 AA-oriented design system
Shared source: `assets/design-system.css`; File I/O adapter: `c-programming/file-io/unified-course.css`.

### Explicit themes
- `data-theme="light"`, `data-theme="dark"` and system preference fallback.
- Semantic tokens: page/surface/ink/muted/border/primary/link/focus/status/code background.
- Focus rings (3 px), 44 px minimum target size for buttons, readable monospaced code with ligatures disabled, reduced-motion handling.
- Responsive one-column experiment view; horizontal overflow inside code blocks.
- Prediction choices use text and border cues rather than color alone.
- Keyboard-focus targets added to next-step guidance and comparison.

### Measured design-token contrast (text/background)
| Token pair | Ratio | Normal text AA (4.5:1) |
|---|---:|---|
| Light body on white | 15.35:1 | Pass |
| Light secondary text on white | 7.04:1 | Pass |
| Light primary-button text | 7.26:1 | Pass |
| Dark body on surface | 13.11:1 | Pass |
| Dark secondary text on surface | 9.81:1 | Pass |
| Dark primary-button text | 10.37:1 | Pass |

These are *token-level calculations*, not proof of full WCAG 2.2 AA compliance. Full layout, keyboard, semantic-label, screen-reader, mobile and user-agent contrast audits are still required.

## Automated checks completed
- Eight steps are present; no duplicate HTML IDs.
- Every constant DOM ID referenced in the two course scripts exists.
- Three JS files parse successfully (main course, integrated lab controller, simulator engine).
- Deterministic engine assertions: **16/16 passed**:
  - M3 two successful reads followed by EOF and close.
  - File truncation, append, restart preservation, sample reset, missing file behavior.
  - M4 normal, malformed, empty and injected read-error outcomes, status and exit branches.
- C course landing page now links to the integrated File I/O course instead of advertising a distinct Pilot.
- Migrated legacy course progress to v2 without falsely marking the new predictive activities as complete.

## Known limitations
- GitHub Pages deployment and full browser visual QA could not be verified in this session.
- JavaScript simulation is NOT a real C compiler or filesystem; injected I/O errors are pedagogical.
- Explanation quality is not graded by an independent evaluator; activity completion requires evidence of experiment and entered explanation, not proven correctness.
- P1–P6 still use static code-pattern checks and require a real GCC environment for compilation and test results.
- No student identity or instructor-level dashboard; progress and notes remain local to the browser.
- Before declaring WCAG 2.2 AA compliance, audit keyboard navigation, focus order, 200% zoom, screen readers, mobile touch, reduced motion and all remaining UI color combinations.

## Release acceptance work
1. Browser E2E from initial Step 01 through Step 08, plus P1–P6 route.
2. M3 regression: r success, w truncate, a append, missing r file, restart vs reset.
3. M4 regression: correct return 1 / 0 / EOF, feof and ferror and explanation order.
4. Mobile and keyboard user testing with 5–8 students; record task-completion barriers.
5. GCC verification of displayed C samples and actual P1–P6 submissions using a sandboxed execution service or local compiler.

**Educational sign-off:** A unified route and verified simulation behavior are prerequisites for meaningful self-study, but learning effectiveness still requires direct student evidence.
