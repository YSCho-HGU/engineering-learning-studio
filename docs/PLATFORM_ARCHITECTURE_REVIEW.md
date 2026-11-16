# Engineering Learning Studio — Platform Architecture Review & Migration Plan

**Review date:** 2026-11-16  
**Scope:** Language, theme, learning progress, assessment evidence, course catalog, and administrator workflows across C Programming and Signals & Systems; extensible to Python Programming and Logic Design.  
**Status:** Architecture proposal and implementation priorities. No destructive data migration is authorized by this review.

## 1. Executive recommendation

Adopt a **modular shared platform contract** with **course-specific learning engines**, rather than a single shared learning runtime. Keep the current static GitHub Pages deployment for instructional content, preserve backward-compatible local progress, and separate admin publication from authentication/authorization.

Centralize only cross-cutting behavior: preference management, design tokens, course metadata schema, progress/event schema, assessment evidence types, and capability boundaries. The Signals & Systems experiments and the C learning/coding engines should remain independent.

## 2. Evidence from current repositories

### Engineering Learning Studio repository (`YSCho-HGU/engineering-learning-studio`)

- `assets/els-language.js`: shared `ELSLanguage` API, localStorage `els-language`, modes `en`, `ko`, `mixed`, cross-tab `storage` and `pageshow`.
- `assets/els-theme-v2.js`: shared `ELSTheme` API, storage key `els-theme-v2`, four palettes, legacy theme fallback.
- `c-programming/journey.js`: per-course activity and quiz completion stored in separate localStorage arrays, plus per-lesson notes.
- `c-programming/practice-engine.js`: draft source and self-reported GCC evidence stored under versioned keys `els-code-<slug>-v<revision>` and `els-code-evidence-<slug>-v<revision>`; a static check is not compilation.
- `c-programming/course-catalog.json` and `course-catalog.js`: published chapter metadata drives navigation; published/hidden status affects listing and does not grant or deny access.
- `admin/index.html` / `admin/admin.js`: admin selects one of two GitHub repositories, provides a fine-grained GitHub token, reads/edits catalog metadata, and writes via GitHub Contents API with SHA conflict control. Token is kept in page memory and cleared on course switch. Direct URLs to published static pages remain accessible.

### Signals & Systems repository (`YSCho-HGU/signals-systems-visual-lab`)

- `assets/els-language.js` and `assets/els-theme-v2.js`: matching shared preference modules are copied into this repository.
- `assets/ss-language.js`: localization in the shell and embedded chapter frames preserves interactive experiment state.
- `assets/ss-learning-path.js`: chapter experiment navigation, recommended core/advanced classifications, and independent collapsed-navigation preference.
- `assets/ss-publication.js` and `course-catalog.json`: published chapters are controlled from static JSON with offline fallback.
- `index.html`: standalone interactive lab shell with embedded experiments, browser-side navigation and feedback.

**Observed architecture constraint:** Both GitHub Pages project paths are under `https://yscho-hgu.github.io`, allowing browser preferences to share a localStorage origin today. This is *not* a durable cross-domain identity or remote-sync mechanism.

## 3. Target architecture

```text
                        Engineering Learning Studio
                 course discovery · course shell · admin UI
                                      |
     +------------------- Shared Platform Contracts -------------------+
     | Preferences       Language / Theme   (existing)                 |
     | UI Design System  tokens / reusable navigation, dialogs         |
     | Catalog           versioned course/chapter metadata             |
     | Progress          typed learning activities and checkpoints     |
     | Assessment        distinguish evidence kinds; no fake grading   |
     | Storage           local adapters now; remote sync only later    |
     | Publication       public static metadata (not access control)   |
     +-----------------------------------------------------------------+
           |               |              |                 |
       Signals &       C Programming     Python           Logic Design
       Systems         lesson + GCC      coding labs      circuit labs
       graph labs      practice          notebooks        truth tables
           |               |              |                 |
     Independently versioned subject-specific engines and content
```

### Boundaries

- **Preference service:** all courses use `ELSLanguage` and `ELSTheme` without local duplicate storage/event listeners.
- **Design system:** common CSS variables and accessible UI primitives; subject-specific graphical interaction is owned by each engine.
- **Catalog service:** *contract*, not necessarily one physical file. Course catalogs remain in their respective repositories. Indexing/aggregation may be generated from public catalogs, with schema validation.
- **Progress service:** format, validation, versioning, and adapters; it must not assume every course has the same activity sequence.
- **Assessment service:** evidence classification and provenance rather than making unverified browser checks count as actual execution tests.
- **Admin application:** a management UI with explicit GitHub repository capability boundaries; authentication is via authorized provider flows. Do not treat a hidden item as protected.
- **Learning engines:** C compilation guidance, SS simulations, future Python runtime, and Logic Design circuits remain independently testable.

## 4. Suggested canonical data contracts (proposed, not migrated)

### Catalog

```json
{
  "schemaVersion": 2,
  "courseId": "c-programming",
  "revision": "2026-11-16",
  "units": [
    {
      "id": "151",
      "slug": "pointer",
      "published": true,
      "title": {"en": "Pointers", "ko": "포인터"},
      "learningEngine": "c-journey",
      "coreItems": ["ptr-address", "ptr-swap"],
      "optionalItems": []
    }
  ]
}
```

Any actual implementation must map current `schemaVersion:1` chapter objects into this structure **without overwriting** existing catalogs.

### Student progress

```json
{
  "schemaVersion": 1,
  "courseId": "c-programming",
  "unitId": "151",
  "activityId": "pointer-swap",
  "kind": "activity-review",
  "status": "completed",
  "recordedAt": "2026-11-16T09:00:00Z",
  "source": "local-browser",
  "contentRevision": "v1"
}
```

Recommended `kind` values:
- `activity-review`: student marked content as reviewed
- `concept-quiz`: correct answer under specified quiz key/revision
- `code-draft`: locally saved source
- `self-reported-execution`: student indicates external GCC or Python execution, not independently verified
- `verified-execution`: program was actually run by a trusted grading service, with test and environment references
- `simulation-experiment`: parameters and observations from a subject experiment; not an assessment pass by itself

**Never equate `activity-review` or `self-reported-execution` with `verified-execution`.**

### Data ownership and privacy

- Keep student code drafts, notes, and experiment inputs local by default. Never include them in administrator catalog payloads.
- Teacher/admin catalog edits require a separate authorization boundary and explicit write confirmation.
- Account syncing, if introduced later, requires explicit identity, retention, access and deletion policies and a server-side authorization design.
- LocalStorage is origin-wide, quota-limited, and accessible to scripts running on the same origin. Treat it as a convenience store, **not** a secure student gradebook or secret vault.

## 5. Migration plan

| Phase | Deliverable | Risk level | Acceptance criterion |
|---|---|---|---|
| 0 — Baseline | Inventory storage keys, catalog schemas, experiment and draft state, smoke tests for two courses | Low | No regression; baseline fixtures and test scripts exist |
| 1 — Shared shell | Consolidate language/theme initialization and design tokens, keeping course renderers unchanged | Low–medium | All modes, themes and navigation remain usable |
| 2 — Progress adapter | Read-only normalized progress projections from legacy C and SS keys | Medium | Summaries match old UI; no destructive key updates |
| 3 — Progress writes | Versioned writes through adapter, dual-read period, migration/rollback path | Medium–high | Reload, cross-tab and saved draft state pass tests |
| 4 — Catalog contract | Schema validation and v1-to-v2 projection for both repos | Medium | Existing catalog/admin UI still publishes correctly |
| 5 — Admin UX | Common admin interface components, repository adapters, guarded commits and audit metadata | Medium–high | Unauthorized writes are impossible within chosen backend policy; conflict/rollback tested |
| 6 — Optional backend | Account progress sync, identity/roles, grader only after governance and deployment decisions | High | Security review, consent and recovery tests complete |

Do not combine phases 2–5 into a single rewrite. Each phase should be deployable and reversible. Export a snapshot of existing local keys and catalog JSON before any migration.

## 6. Recommended code layout (future)

```text
assets/
  platform/
    preferences.js           # existing language/theme adapters
    ui-tokens.css            # shared design tokens
    catalog-schema.js        # validation and legacy conversion
    progress-contract.js     # typed events, stable ids
    progress-local.js        # backward-compatible local adapter
    assessment-evidence.js   # evidence type distinctions
    repository-adapter.js    # public catalog fetch only
c-programming/
  journey.js                 # existing engine kept
  practice-engine.js         # existing engine kept
signals-systems-visual-lab/  # independently deployed repository
  assets/                    # vendored/pinned shared assets
admin/
  admin.js                   # GitHub provider adapter + safe UI
docs/
  PLATFORM_ARCHITECTURE_REVIEW.md
```

This is an illustrative **logical structure**, not an instruction to move all folders or merge the two repositories.

## 7. Admin security and publication

Current administrator functions use a GitHub fine-grained token directly in the browser, held in memory and cleared on course change. This can be appropriate only for a controlled operator workflow; it is not student SSO, role-based permission enforcement, or a backend admin service. Do not store tokens in localStorage, URLs, course catalogs or log events.

`published:false` hides course navigation but does **not** restrict direct page URLs on GitHub Pages. If the requirement becomes real pre-release confidentiality, use a private deployment or authenticated serving architecture. Removing a card is not access control.

For stronger administration, prefer GitHub App/OAuth provider permissions, minimal scopes, commit SHA conflict checking, reviewable changes, and an auditable publish workflow. Avoid adding an application-controlled secret into browser JavaScript.

## 8. Regression/QA matrix

| Scenario | Studio | C | S&S | Future |
|---|---|---|---|---|
| ENG / KO / mixed preference | Must pass | Must pass | Must pass | Required |
| Neutral Dark and alternate theme | Must pass | Must pass | Must pass | Required |
| Cross-tab synchronization | Must pass | Must pass | Must pass | Required |
| Student progress survives navigation | N/A | Must pass | Check supported status | Required |
| C draft survives language/theme changes | N/A | Must pass | N/A | Python required |
| Simulation controls survive language change | Mini logic lab | N/A | Must pass | Logic circuit required |
| Unpublished item absent from menu | Inspect | Must pass | Must pass | Required |
| Direct page access blocked | Not provided | Not provided | Not provided | Requires separate authentication |
| Admin commit conflict / invalid token | Must test | Same manager | Same manager | Required |
| Accessibility keyboard + mobile | Must test | Must test | Must test | Required |

## 9. Priority recommendations

**P0:** Preserve existing course functionality and establish smoke tests.  
**P1:** Normalize read-only progress view and unify dashboard semantics.  
**P2:** Introduce v1/v2 catalog adapters and reusable admin UI, without new authorization claims.  
**P3:** Consider remote identity/progress/verified grading only with clearly defined policies and services.

The greatest immediate architectural benefit is a **read-only cross-course progress dashboard** backed by adapters. It can be developed without touching live grading, source code or lesson data.

## 10. Decision record

- **Accepted proposal:** Modular platform contracts + course-specific engines.
- **Accepted proposal:** Versioned schema and backward-compatible migration.
- **Deferred:** Server-based student identity, synchronization and trusted automatic code evaluation.
- **Deferred:** Physically consolidating two repositories or replacing offline S&S labs with a centralized runtime.
- **Non-negotiable:** Existing code, lessons, diagrams, graphs, student drafts and assessment semantics must remain correct and accessible.
