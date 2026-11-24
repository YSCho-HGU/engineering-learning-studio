# Chapter 211 pre-publication QA

Scope: Experience First overview, common TOC, six complete demos, 30 standalone reference stages and Engineering Toolkit. Publication remains false in course-catalog.json until a reviewed release decision.

## Evidence and changes
- Prior run 45337104118: 30 stage browser checks passed at 390/1280 px, including language/theme and CSV exchange.
- Run 45338198647: TOC collapse regression failed at line 26. Scoped CSS now explicitly gives the collapsed state precedence over the grouped TOC mobile display rule. The original regression assertion is retained.
- Beginner route: project cards start at V1; later stages optional. Consistent prompt, copy, execution help, previous-file workflow and optional download across all 30 stages. Offline pages hide links that require the Studio.
- Content: 4.10 weighted GPA is an educational example, not institutional grading rules. Strict threshold comparison excludes equality. Signal CSV has 401 samples and dashboard uses record order. Selection Sort visual highlighting now shows both compared indices before updating the minimum index. No live AI call, no production backend, no account setup prerequisite for HTML examples.
- UI: shared header/TOC on lessons, compact mobile sidebar, separate standalone program interface with the same theme and language choices. Header controls no longer inherit oversized lesson button/select styles.
- Release checks: TOC, 30 version pages, six completed demos, 320/390/1280 px novice path, five palettes, actual clipboard, offline HTML execution. Screenshot artifacts retained for review. New test results must be read from Actions; a configured test is not a passing test.
- Other course regression failures remain outside this scoped change; prior C regression run 45337104092 attempted to click collapsed Guided Labs links without expanding their groups. Unified gates require independent review. No release flag changed.
