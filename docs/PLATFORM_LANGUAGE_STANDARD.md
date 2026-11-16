# Engineering Learning Studio — Language Standard v1.0

**Scope:** Studio Home, C Programming, Signals & Systems, future Python Programming and Logic Design. **Status:** Contract and reusable module implemented; Python and full Logic Design course sites not yet built.

## 1. Single language contract

| Property | Requirement |
|---|---|
| Storage key | `localStorage["els-language"]` |
| Valid values | `"mixed"`, `"en"`, `"ko"` |
| Default | `"mixed"` when no valid saved preference |
| User-visible labels | `ENG + 한국어`, `ENG`, `한국어` |
| Priority | Explicit user selection and latest saved preference win; never let an old `?lang=` deep link override an existing saved preference |
| Scope | Same web origin; both current GitHub Pages project paths share `https://yscho-hgu.github.io` |
| Change event | `els-language-change` with `detail.lang` and `detail.source` |
| Cross-tab | Listen for `storage`, then reconcile with `pageshow` |
| Presentation | Update the language selector and rendered text; retain lesson position and interactive state |
| Independence | Do not couple language preference to theme (`els-theme-v2`) or progress/draft keys |

**Security / applicability:** localStorage synchronizes only within the same browser profile and origin. A future custom-domain move, sandboxed iframe, or different origin requires an explicit, origin-verified bridge. Do not use `postMessage("*")` for language or user-data synchronization. No network roundtrip or account synchronization is implied.

## 2. Reusable implementation

File: [`assets/els-language.js`](../assets/els-language.js), exposed as `window.ELSLanguage`.

```html
<script src="../assets/els-language.js?v=1" defer></script>
<select id="course-language" aria-label="Language">
  <option value="mixed">ENG + 한국어</option>
  <option value="en">ENG</option>
  <option value="ko">한국어</option>
</select>
<script defer src="./course.js"></script>
```

```js
// course.js — Python or Logic Design course entry point
const language = window.ELSLanguage;
const unbind = language.bindSelect("#course-language");
const unsubscribe = language.subscribe((mode) => {
  // Re-render text only. Preserve active experiment, editor and inputs.
  renderLabels(mode);
}, true);

// In the actual renderer:
// mode === 'en'    => English instructional text only
// mode === 'ko'    => Korean instructional text only
// mode === 'mixed' => deliberate English/Korean combination
// The i18n dictionary must provide all three intentionally.
```

A different repo that is served under the same `yscho-hgu.github.io` host may copy/version the module from this canonical source. Avoid referencing a GitHub raw URL at runtime; host the asset locally and pin its version.

## 3. Content authoring model

Keep content keys independent of language. Suggested structure:

```js
const lesson = {
  id: "python-01-variables",
  code: "x = 3\\nprint(x)", // must not change on language toggle
  answer: "3",                 // must not change
  text: {
    en: { title: "Variables", goal: "Explain variable assignment." },
    ko: { title: "변수", goal: "변수의 대입을 설명한다." },
    mixed: { title: "Variables · 변수", goal: "Explain assignment. · 변수 대입을 설명한다." }
  }
};
```

Core technical tokens (`int`, `malloc`, `print`, Boolean algebra operators, gate symbols, signal names) must be preserved. Do not translate source code, expected output, quiz answer indices, numerical parameters, graph values, or student-authored text. Translate instructions, feedback, accessibility labels, navigation, optional help, and evaluation guidance. Avoid naïvely modifying arbitrary text nodes inside code editors or live plot containers.

## 4. Specific requirements for new courses

**Python Programming:** Keep Python snippets, console output, `Traceback` examples, test inputs, notebook cell state and editor drafts unchanged. Translate pre-study video captions/transcripts, conceptual descriptions, exercises, hints and checking feedback. Switching language must not rerun notebooks or replace student code.

**Logic Design:** Keep gate truth tables, Boolean expressions, Karnaugh map state, waveforms, circuit connections, timing traces and students' diagrams unchanged. Translate prompts, descriptions, error feedback, accessibility labels and task instructions. Changing language must not reset an open circuit or change its input bits.

**Signals & Systems:** Continue in-place rendering without restarting iframe experiments; respect existing bilingual and unreconciled text QA. Its existing `assets/ss-language.js` remains compatible with the same key and modes.

**C Programming:** Continue using `els-language` with existing data overlays and draft keys. Existing C pages can migrate incrementally to the shared API; do not introduce a second preference key.

## 5. Quality gates for publication

1. **Contract:** Each page reads `els-language` and exposes three modes in the same order.
2. **Completeness:** Every translatable instructional text appears in `en` and `ko`; `mixed` is deliberately authored, not a hidden Korean-only fallback.
3. **Cross-course:** Change from Studio, C, and Signals & Systems; open Python or Logic Design and verify the latest setting. Test same-tab navigation, two tabs, and back/forward navigation.
4. **State preservation:** Language changes preserve current step, editor drafts, answered questions, input values, plot/circuit state, theme, and progress.
5. **Correctness:** Language changes cannot alter source code, grading keys, formulas, computed signals, gate outputs, or data files.
6. **Accessibility:** Visible selector on desktop/mobile, keyboard navigation, correct `html.lang`, translated ARIA strings, and readable mixed-mode punctuation.
7. **Storage restrictions:** In private/storage-blocked contexts, remain functional using in-memory state; persistence is best effort.
8. **No regression:** Verify both light/dark themes and representative exercises of every existing course.

## 6. Migration strategy

- **2026-11-16 implementation:** Studio Home, C Home, C lesson/practice pages, and Signals & Systems now use the shared `ELSLanguage` preference API. All existing subject-specific translation functions remain intact.
- **C lessons:** Shared module is loaded before `c-programming/language.js`. C lesson/practice pages currently reload on a language change because their instructional content is assembled at startup; editor drafts and lesson progress use their existing storage keys. C Home updates immediately.
- **Signals & Systems:** The same asset is copied to the `signals-systems-visual-lab` repository and loaded before `assets/ss-language.js`. The Signals translation and iframe state-preserving flow are retained; old query-string language parameters initialize only when no valid saved preference exists.
- **When creating Python/Logic Design:** Include the common asset, author all locale strings, bind one selector, and subscribe to changes. Reconcile the vendored module whenever its version changes.
- **Future optimization:** Make C lesson/practice text rerender without reload only after comprehensive browser tests. Avoid merging the distinct subject-specific translation engines into one oversized translation script.

### Regression checklist after this migration
1. Navigate Studio → C Home → a C lesson → Coding Practice → Studio → Signals & Systems with each of the three modes.
2. Change language on Studio Home, C Home, a C lesson, and Signals & Systems, checking selector state, translation, back navigation, and multiple tabs.
3. On C coding practice, edit draft source and mark progress before language switch. Confirm saved work remains intact afterward.
4. On Signals & Systems, change language while a graph or experiment has nondefault controls. Confirm both values and plots are unchanged.
5. Verify neutral-dark and other themes independently of language.
6. Run a browser E2E test in addition to JavaScript syntax and script-loading order checks.

The standard is compatible with existing infrastructure without claiming that Python or the full Logic Design course has been implemented.
