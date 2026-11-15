# Engineering Learning Studio — Master Platform Design v1.0

**Date:** 2026-11-15  
**Status:** Proposed architecture and educational design; not an implementation-complete specification  
**Scope:** Signals & Systems, C Programming, Logic Design, Digital Signal Processing, Python, AI/AX  
**Pilot:** C Programming, Chapter 7 File I/O (171_C_File_IO_Rev8)

> Engineering Learning Studio is an AI-assisted engineering reasoning and experimentation platform that helps students understand, predict, experimentally verify, explain, implement, and transfer engineering concepts to authentic problems.

## 0. Decisions and baseline status

### Decisions recommended for approval
1. Learning evidence, not click-through completion, is the primary product outcome.
2. One coherent authentic engineering problem anchors each module; mini-labs support that problem.
3. Students predict and explain before being shown a reference result when instructionally appropriate.
4. Real execution, deterministic simulation, and AI-generated advice must be clearly labeled and never conflated.
5. AI is optional and role-governed: Independent, AI Coach, AI Co-Engineer.
6. Only an instructor-approved, verified content module can be used as the template for expansion to other courses.
7. Keep existing GitHub Pages public-facing site; add secure back-end services only when warranted.
8. Do not treat simple string/regular-expression code checks as compilation, unit testing, or student mastery.

### As implemented as of 2026-11-15
- Public integrated portal, six subject cards, language/theme controls.
- C course landing page; Pointer and Structure quick labs; File I/O eight-stage concept course.
- File I/O P1–P6 Practice Lab with in-browser editing, reference fixtures, lightweight static pattern checks, downloadable source.
- Browser-local progress storage; no verified student identities or central instructor analytics.
- The File I/O lab is a simulation. GitHub Pages does not run student-submitted C on a server and there is no production AI tutor.

These are observations from the inspected project, not planned features.

## 1. Educational philosophy and non-negotiable quality principles

1. **Learning outcome first:** Each feature maps to an observable and assessable outcome.
2. **Think before run:** Ask students to predict outcomes and articulate reasons before revealing results where productive; allow accommodations and scaffolding.
3. **Evidence over animation:** Ground code-flow displays in reliable program semantics and verified test fixtures.
4. **Guided to independent:** Use worked examples initially, fade supports, and check performance on novel tasks.
5. **AI as coach, not answer vending:** Safeguard independent reasoning while teaching appropriate AI cooperation.
6. **Engineering integration:** Share real sensor/record datasets and system contexts across C, Python, S&S, DSP, Logic, and AI/AX.
7. **Measure learning, not engagement alone:** Time, clicks, badges, and quiz completion are supporting diagnostics only.

A feature that cannot name the student action, the observable artifact, and the learning objective must be revised or removed.

## 2. Platform success definition

**North-star outcome:** Students can independently analyze and solve a previously unseen but appropriately scoped engineering problem, explain their design choices, and validate their implementation.

### Proposed pilot success measures (initial targets, not established facts)
- At least 80% of participating students complete a correct read/write file exercise without conceptual help by the end of the pilot.
- At least 70% correctly distinguish successful conversion, clean EOF, matching failure, and stream error in a novel trace exercise.
- At least 70% diagnose two of three seeded File I/O bugs and justify the fix.
- A meaningful gain in pre/post scores and acceptable retention on a delayed assessment (target size set after baseline).
- At least 80% of users can locate the next action and identify whether an output is simulated or compiled in a short usability test.
- Zero known high-severity mismatches between displayed C source and interactive control flow at release.

Targets require calibration against incoming student skills. No educational effectiveness claim until a pilot is analyzed.

## 3. Students and scenarios

- **Beginner:** Knows basic C control flow but not stream state. Needs short explanation, one key misconception at a time, and guided prediction.
- **Intermediate:** Knows syntax. Needs file format design, error diagnosis, and independent implementation.
- **Instructor:** Needs alignment with approved source handouts, reliable runnable examples, control of AI permissions, and actionable misconception patterns.
- **External learner:** Needs a self-contained explanation and accessible resources without institutional sign-in.

### Learner journey
Problem → Diagnostic prediction → Concept micro-lesson → Explain expected behavior → Verified experiment → Compare and debug → Implement → New transfer task → Delayed recall.

The seven current 'lesson complete' actions are not substitutes for demonstrated coding competence.

## 4. Unified learning-object schema

Every unit must define and version:
- ID, title, course, source document revision and location
- prerequisites and concept dependencies
- 2–5 measurable learning outcomes expressed as actions
- 1 authentic use case, real-world relevance and constraints
- 2–4 common misconceptions with diagnostic probes
- worked example(s) including runnable source where applicable
- prediction prompt and expected rationale
- experiment: execution/simulation label, defined inputs, outputs, trace, failure cases
- guided practice, scaffolded hints, independent practice, transfer task
- instructor-approved test vectors and expected results
- AI policy and allowed hints
- assessment rubric and mastery threshold
- accessibility and bilingual content metadata
- reviewed-by, verified compiler/runtime version, last-review date, change log

Keep the Word lecture handout as an explicit, traceable authority until a separate content-source governance decision is made; do not silently overwrite or diverge from it.

## 5. Consistent interface and information architecture

### Course home
- Current learning, resume link, next recommended task, concept prerequisites
- Visible labels: Not available / Concept lesson / Simulator / Verified coding lab
- Module roadmap with Coming Soon placeholders and no dead links
- Instructor source reference, study outcomes and time expectation

### Lesson workspace
1. **Challenge / Why:** the problem statement and what success looks like.
2. **Think / Predict:** answer and rationale captured before outcome is shown, where beneficial.
3. **Explore / Experiment:** actual compiler/simulator output and changing program state.
4. **Explain / Debug:** mismatch, root cause and alternative hypotheses.
5. **Build / Verify:** write code and run deterministic tests.
6. **Transfer / Reflect:** independently solve modified problem and record what changed.

Persistent, compact 'next step' guidance; source and output adjacent at appropriate screen widths. Avoid showing a generic control that the displayed program cannot execute.

### Experience details
- One clear primary action per activity; secondary actions visually differentiated.
- Always show operation prerequisites and disabled-state explanation.
- Code uses readable monospaced typography, line numbers, explicit highlight, and literal C operators (disable ligatures).
- Use responsive layouts and keyboard navigation; target WCAG 2.2 AA.
- Accessible low-motion mode, screen-reader descriptions of figures, sufficient contrast, full focus indication.
- Language: Korean explanation plus consistent English C technical vocabulary; bilingual UI optional, not mixed unpredictably.
- Explicit labels: SIMULATED, COMPILED + EXECUTED, REFERENCE OUTPUT, AI SUGGESTION, STUDENT PREDICTION.
- Avoid displaying answer fixtures before the learner predicts in assessed prediction activities.

## 6. Cross-course differentiator: one authentic system

**Shared project: Sensor Data Lifecycle**
1. Signals & Systems — model sensor signals and time-domain behavior.
2. Logic Design — threshold/finite-state alert circuit.
3. C Programming — acquire, store, reload and validate records; handle failures.
4. Python — parse, plot and summarize the shared dataset.
5. DSP — filter noisy measurements and analyze frequency content.
6. AI / AX — identify anomalous patterns and review model reliability.

Common dataset specification with unit, sample rate, timestamp and version. Individual courses retain distinct learning objectives while exchanging authentic inputs and outputs. Pilot with File I/O → Python first, rather than implementing all six simultaneously.

## 7. File I/O pilot blueprint

**Pilot use case:** A sensor logger needs to preserve measurements after restart and recover safely from unexpected input.

| Learning target | Predict / Explore | Verified evidence | Transfer task |
|---|---|---|---|
| Persistent data | Memory reset versus file retained | Reopen file in second program run | Preserve student records |
| Stream & FILE* | Identify source/destination streams | Trace fprintf(stdout/fp), file lifecycle | Separate diagnostic output |
| Modes r/w/a | Predict truncation or append | Compare before/after file bytes | Safe log append |
| Formatted/line input | Predict function return and data | Read valid, empty, malformed, overlong records | Choose parsers for data format |
| EOF and errors | Distinguish return 1/0/EOF | Inspect feof and ferror | Diagnose failed reads |
| Structures and functions | Choose serialization format | Save and reload; capacity tests | Student-record manager |
| Sensor log | Threshold prediction | Verified count/mean/alert file | Voltage or temperature datasets |
| Independent mastery | Solve from new requirements | Compile, execute and test unseen cases | Create robust log application |

### Core requirements for credible pilot
- C examples must compile under defined GCC/Clang targets with warnings treated as errors.
- Compare displayed control-flow trace with tested code; keep simulations deterministic.
- File I/O requires missing-file, malformed-token, empty-file, long-line, permission-error and close/error-path examples as appropriate to each level.
- P1–P6 need executable test oracles and visible distinction between public examples and hidden assessment tests.
- Produce accessible error explanations at the concept level, not merely red/green scores.
- Final evaluation must include at least one unscaffolded novel problem and a verbal/written rationale.

### Sample lesson: r versus w versus a
- Before execution: learner predicts file contents and why.
- Verified run: show exact fopen result, effective open mode, cursor, stream state and bytes.
- Explain: learner accounts for differences, including why restart does not restore a truncated file.
- Build: learner writes a safe append program with fopen NULL check and fclose.
- Transfer: student extends the logger to distinguish malformed sensor data and write alerts.

## 8. AI tutor policy

### Mode A: Independent
No generative hints/solutions during the attempt. Compiler errors and instructor-approved static resources may be available if explicitly defined in the assessment rules.

### Mode B: AI Coach
The tutor sees approved source concepts, learner attempt, tests and explanatory prompts with necessary privacy safeguards. It should:
1. ask what the learner expected;
2. identify one misconception or evidence gap;
3. offer a concept prompt or question;
4. give escalating hints only after learner request or sustained struggle;
5. encourage a revised attempt;
6. reveal full solutions only under a declared instructor policy, not during independent assessments.

### Mode C: AI Co-Engineer
In an advanced project, students may request code generation, design alternatives and refactoring. The required artifact is an evidence-based review: test cases, failures, security/robustness discussion, explanation of which AI suggestions were accepted or rejected.

### Technical governance
- Instructor-approved knowledge references; answers cite relevant course sections.
- Results of code execution come from the test runner, never invented by an LLM.
- Tutor output is non-authoritative and cannot override a test oracle.
- Limit prompt-injection impact from student code or retrieved content: separate trusted instructions from untrusted submissions.
- Rate-limit and budget AI requests; support AI-unavailable fallback.
- Avoid sending sensitive student records or secrets into model prompts.
- Student access to data and transcript retention must be documented and consent/legal basis determined before collection.
- Never infer academic dishonesty from AI usage metrics alone.

The policy aligns with the UNESCO framework of human-centered, ethical, technical and system-design AI skills.

## 9. Assessment model

### Distinguish three evidence levels
**Participation:** engaged in the activity; not academic mastery.  
**Concept check:** can predict/describe a defined behavior; not proof of code skill.  
**Demonstrated mastery:** independently implements, tests, explains and transfers.

### Proposed competency rubric (100 points; initially for formative use)
| Dimension | Weight | Observable evidence |
|---|---:|---|
| Conceptual understanding | 20 | Explain stream model, modes, return values |
| Prediction and causal explanation | 20 | Accurate prediction plus reason and discrepancy analysis |
| Implementation | 25 | Valid C code, correct file format, proper resource handling |
| Verification and debugging | 25 | Tests normal/invalid/empty conditions, diagnoses failures |
| Transfer | 10 | Solves a new dataset/requirement without worked solution |

For formal grades, calibrate the rubric with multiple instructors, examples and inter-rater consistency. It should not be treated as an automatically validated scoring algorithm.

### Evidence and research design
- Baseline pretest before File I/O exposure; matched posttest with comparable but distinct questions.
- Delayed test after about 1–2 weeks, including a novel fault scenario.
- Separate AI-allowed and AI-free evidence; avoid attributing an assisted result solely to a student's independent skill.
- Collect confidence on selected tasks to detect confident misconceptions, not just accuracy.
- Conduct usability observations with a small representative sample before broad rollout.
- If feasible and approved, compare standard materials with enhanced modules using comparable cohorts or a crossover design; report uncertainty and limitations rather than only average gains.

### Pilot evaluation thresholds (proposal, not measured)
- No severity-1 code/semantics defects in published lesson.
- Every learning objective linked to at least one direct measurable assessment.
- >=80% of pilot participants can identify source vs output and next step without facilitator help.
- Reasonable completion rates without a high dropout cliff; use cognitive interviews to interpret poor performance.
- Pre/post and delayed results assessed before decisions to expand.

## 10. Product components and engineering architecture

**Layer 1: Public Learning Frontend (current GitHub Pages).**
- Course catalog, learning modules, local practice drafts, interactive diagrams, public sample datasets.
- Serves static HTML/CSS/JS or static-site generated resources.
- Never stores private API secrets; localStorage is not an institutional gradebook.

**Layer 2: Verified Experiment Engine.**
- Deterministic browser simulation only where the model is validated and labeled.
- True C execution via separately sandboxed service or an evaluated client-side technology, depending on security and performance constraints.
- For server execution of untrusted code: isolated ephemeral worker per job, no outbound network, restricted filesystem, bounded CPU/memory/time/output, nonprivileged identity, audited images, safe error reporting, rate limits and abuse monitoring.
- Versioned compiler, input fixtures, oracle, rubric and regression tests.

**Layer 3: Course Content and Assessment Registry.**
- Versioned canonical lesson schema; trace source handout revision.
- Build-time validation for content IDs, code fences, destinations, outcome/assessment links and locale.
- Published exercises carry reviewed test vectors and a transparent origin label.

**Layer 4: AI Coach Service (future).**
- Authenticated, rate-limited and instructor-controlled.
- Uses approved learning objectives and verified test results.
- Separate tutor feedback from code grading and core truth.
- Logging minimal by default; privacy-preserving analytics.

**Layer 5: Optional Classroom Integration (future).**
- Consent-based learning evidence, cohort analytics and instructor review.
- LMS integration may later use LTI 1.3 and grade services after validating institutional requirements.
- No student database until retention, access, deletion and security model is approved.

### Build versus reuse
- BUILD: lesson model, engineering reasoning prompts, cross-course cases, expert-validated error visualizations, learning rubric, instructor authoring controls.
- REUSE / INTEGRATE: code editor, static-site generator, compiler/toolchain, syntax checking library, authentication, monitoring and standard LMS interfaces.
- DEFER: gamification economy, broad social features, automated high-stakes grading, multi-agent 'AI professors', six-course simultaneous redevelopment.

## 11. Content and code quality gates

**Required for every release:**
1. Textbook source-to-web traceability review (revision, section, coverage).
2. Full and valid C source for every example labeled runnable.
3. Compiler check (specified standard and flags) plus normal and malformed runtime fixtures.
4. Simulation state transition tests and alignment to exact code shown.
5. UI control operation and focus-state verification on desktop and mobile.
6. Language accuracy review: literal C operators, terminology, formatting, accessibility.
7. AI tutor evaluation for incorrect hints, unearned solution disclosure, reference hallucinations and prompt-injection cases where AI is enabled.
8. Independent subject-matter approval before marking lesson VERIFIED.
9. Visible version and known limitations in public release.

Statuses: DRAFT → REVIEWED → VERIFIED → RELEASED → RETIRED.
No course-wide template promotion from a DRAFT module.

## 12. Governance and privacy

- Course academic owner signs off instructional objectives, examples and reference answers.
- Engineering owner signs off automated tests, build chain and sandbox boundaries.
- Reviewer checks pedagogy/UX and accessibility with student observations.
- Release log separates educational changes from technical changes.
- Public versus institutional content licenses and permissions defined before redistribution.
- Default local/anonymous mode; institution-identified data only after explicit governance decision.
- Define retention, deletion, breach response, role-based access and restricted analytics before enabling account services.
- External plugins, AI providers and code execution environments require security/data-flow review.

## 13. Staged roadmap — decision gates rather than fixed promises

### Phase 0 — Stabilize and validate (first priority)
- Freeze expansion of unverified quick labs.
- Prepare a curriculum map for File I/O (concept → misconception → activity → evidence).
- Create a source-code truth set with GCC tests and exact program-output fixtures.
- Conduct 5–8 moderated usability sessions on the revised File I/O lab.
**Gate:** No conceptual mismatch, high-priority student blockers resolved.

### Phase 1 — File I/O exemplar
- Implement prediction→real execution→explanation for a small set of pivotal topics: modes, EOF/error, record save/load.
- Replace P1–P6 static pattern heuristics with code execution assessment or clearly labeled offline GCC workflows.
- Define independent mastery assessment and textbook traceability.
**Gate:** Verified novel-task performance and acceptable UX.

### Phase 2 — AI Coach pilot
- Add an instructor-approved hint ladder for two topics.
- Measure tutor correctness, answer leakage, helpfulness and independent posttask performance.
**Gate:** AI improves meaningful learning evidence without unacceptable error or dependency.

### Phase 3 — Cross-course demonstration
- Connect C sensor logger output to a Python plot/analysis lab; optionally add S&S or DSP.
- Publish shared dataset specifications, examples and transfer tasks.
**Gate:** Students understand why a concept is useful in the second course.

### Phase 4 — Scale
- Standardize course template and authoring checklist.
- Expand to Pointer/Structure and a second technical course only after successful pilot.
- Add authentication, LMS and central analytics only when justified by real faculty needs.

## 14. Decision register for the next project meeting

| Decision | Proposal | Why now |
|---|---|---|
| First flagship | File I/O sensor logger | A bounded concept and authentic cross-course bridge |
| Public frontend | Keep existing GitHub Pages | Already deployed and low operating burden |
| True code execution | Evaluate separate sandboxed runner / safe reusable engine | Security and grading truth |
| AI availability | Begin with optional Coach, after deterministic runner | Avoid answer leakage and invented evidence |
| Assessment | New-task test + explanation + robust C implementation | Meaningful independent mastery |
| Expansion gate | Measured educational effectiveness and verified code | Prevent scaling low-value content |
| Authoring source | Explicit version mapping to 171_C_File_IO_Rev8 | Avoid textbook/web divergence |
| Progress storage | Browser-local until institutional privacy requirements approved | Avoid premature student-data collection |

## 15. Explicit non-goals

- Competing with every feature of mature programming learning websites.
- Reimplementing a general-purpose compiler, LMS or conversational chatbot from scratch.
- Treating badges, page duration or a perfect multiple-choice score as demonstrated competence.
- Automatic high-stakes student scoring from LLM opinions alone.
- Building six independent course platforms with inconsistent interaction models.
- Collecting student data 'just in case' without learning/operational purpose.

## 16. References and rationale

- Chi & Wylie (2014), ICAP framework: https://doi.org/10.1080/00461520.2014.965823
- Freeman et al. (2014), STEM active-learning meta-analysis: https://pubmed.ncbi.nlm.nih.gov/24821756/
- Exercism curriculum: https://exercism.org/docs/building/tracks/syllabus
- zyBooks participation/challenge/lab activities: https://support.zybooks.com/hc/en-us/articles/360008562913-Students-Getting-started
- CS50.ai teaching assistant guidance: https://cs50.readthedocs.io/cs50.ai/
- Kestin et al. (2025), research-based AI tutoring RCT: https://www.nature.com/articles/s41598-025-97652-6
- Bastani et al. (2025), risks of unguarded generative AI for learning: https://doi.org/10.1073/pnas.2422633122
- UNESCO (2024; revised listing 2026), AI competency framework: https://www.unesco.org/en/articles/ai-competency-framework-students
- W3C, WCAG 2.2: https://www.w3.org/TR/wcag/
- GitHub Pages publishing limits: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- 1EdTech, LTI standard: https://www.1edtech.org/standards/lti

**Status note:** This document records a proposed educational/technical strategy and observed current implementation. Pilot outcome targets and phase gates are design hypotheses, not accomplished outcomes.
