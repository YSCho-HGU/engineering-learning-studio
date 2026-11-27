# Applications A–D: sophomore learning-load review (2026-11-27)

## Scope and method
Reviewed the current 19 implemented labs (A 6, B 3, C 7 core + 1 optional, D 2) using the Applications catalog, shared Part A inquiry specification, Part B navigation, Part C lesson structures, D1/D2 teaching flow, and existing browser/math contract results. This is a curriculum-and-code audit; automated rendering checks are not a substitute for observed student learning.

## Shared educational contract
1. **Question/Predict:** state one observable question in plain language, before unexplained equations.
2. **Change one factor:** show which control generated the current data, preferably beside the plot.
3. **Observe evidence:** identify *what to look for* in the figure, not merely what the figure is named.
4. **Explain/Transfer:** connect one measured difference to a course concept, then try one new condition.
5. **Optional depth:** advanced derivations, implementation details, and related mathematics are available through an optional panel rather than interrupting the first pass.
6. **No false coupling:** distinguish plots driven by current settings from plots using a separate illustrative input.

## Inventory and load assessment

| Module | Core first-pass observation | Cognitive-load assessment and support |
|---|---|---|
| A1 Harmonics | Changing harmonic amplitudes changes timbre at fixed pitch | Appropriate; avoid demanding CTFS derivations before listening |
| A2 Chirp | Time-domain oscillations become denser as chirp frequency increases | Appropriate; STFT explanation is an optional preview, not prerequisite |
| A3 Complex Helix | A rotating phasor projects to a sinusoid | Abstract for year 2; prefer rotation/projection first, growth/decay later |
| A4 Beats | Beat rate follows frequency difference | Clear entry point; distinguish linear superposition from AM |
| A5 AM/FM | Information changes carrier amplitude or instantaneous frequency | Higher load; begin with waveform/envelope comparison, spectra next |
| A6 Sampling | Changing sampling rate changes apparent frequency | High value; use fixed sine first, chirp and signed alias as extension |
| B1 RC | R/C controls step and frequency response | Appropriate with circuit picture first; phase/poles may be optional |
| B2 Moving Average | Increasing window suppresses fluctuations and adds delay | Appropriate when the contributing samples remain visible |
| B3 RC vs MA | With one input and matched cutoff, compare noise and delay | High transfer value but substantial; only after B1/B2 |
| C1 FFT from Samples | Sample sequences have identifiable spectral peaks | Essential starting point; avoid demanding algorithmic butterfly |
| C2 Bins & Resolution | Bin spacing, duration and spectral leakage are distinct | Challenging; keep Hz/bin and two peaks core; windows/zero padding as extension |
| C3 DFT vs FFT | Same coefficients, different computation cost | Conceptually advanced; first verify same result, then optional butterfly/speed |
| C4 DTMF | Two spectral peaks identify one key | High-value discovery; suitable after C1/C2 |
| C5 Sound Fingerprint | Harmonic patterns distinguish sounds | Valuable; A1 overlap is intentional transfer, not a second derivation |
| C6 Audio & Sensor Upload | Sampling metadata changes the interpretation of bin frequencies | Practical but data-import overhead; after C1/C2, optional for students without data |
| C7 2D Image FFT | Spatial periodicity produces frequency-domain patterns | Highest load; recommend visual stripe → FFT peaks → mask, kernel and separable FFT optional |
| C8 Chirp/STFT | Frequency composition changes with time | Optional; not required for C1–C7 |
| D1 Audio FIR | Step 2 filter settings immediately explain Step 3 spectrum and waveform | Appropriate after B/C; delay/impulse and dB details optional |
| D2 Chirp Echo | Shift transmitted template to find echo time and distance | Moderate-to-high load; A/B observation first, normalized correlation and sample products optional |

## Recommended short route (NOT a new mandatory syllabus)
A2 or A6 → B2 and B3 → C1 and C2 → one of C4–C7 → D1 or D2.
A3/A5/C3/C7/C8 can require deeper prior knowledge; the first-pass flow should not assume it. Students interested in the subject can return to all modules.

## Changes implemented in this review
- The Applications overview now explains the A → B → C → D conceptual path rather than treating four Parts as unrelated catalogs.
- Each Part has a collapsible bilingual study guide stating first-pass observation and optional depth.
- Part A/B/D list subtitles now describe a specific outcome or observation in English/Korean rather than jargon alone.
- Part C guide explicitly recommends samples → resolution → one discovery, while labeling optional Chirp/STFT.
- Existing A/B/D calculations and each live lab remain unchanged; the work is curriculum guidance and navigation, not a risky algorithm rewrite.
- Learning contract tests now check bilingual outcome labels for all 11 A/B/D entries and four study guides.

## Remaining monitoring / follow-up
- Separate legacy Applications browser failures from actual regressions (a prior global CI has failures in older Part A/C locator and above-fold assumptions and a Part B demo-state assertion). Do not label all such failures as resolved on the basis of a passing curriculum contract.
- Conduct student pilot usability checks on the high-load topics A3, A5, C2, C3, C7, and D2; measure whether students can explain one graph change in their own words.
- Keep optional theory accessible but collapsed by default, and preserve current settings when navigating.
