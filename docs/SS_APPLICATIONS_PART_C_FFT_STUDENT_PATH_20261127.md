# Part C — FFT learner path (second-year Signals & Systems)

_Engineering Learning Studio · 2026-11-27_

## Educational purpose
Most Chapter 1–8 work emphasizes Fourier representation, sampling and system responses rather than a detailed FFT implementation. Part C therefore begins with an answerable question and a controlled visualization, then introduces the smallest FFT theory necessary to interpret it.

Every one of the **seven core Part C labs** has a common, lightweight companion learning rhythm:
1. **Predict** — choose a hypothesis *before* modifying the native experiment
2. **Change** — run one described comparison using the existing controls
3. **Observe** — read the native graph/measurement panel (do not create an unrelated duplicate calculation)
4. **Explain** — inspect one relevant equation evaluated with the current native settings
5. **Apply/Check** — solve a new-parameter question; feedback is based on the same result

The top card ends before the laboratory control workspace, and the evidence card is placed after the relevant native graph; it does not replace any original DFT/FFT, DTMF, sound, data upload or image computation. Answers and exploration status remain in the current tab only; no student responses are uploaded or stored.

## Seven core activities and discoveries

| Lab | Predict / controlled change | One essential discovery | Background guide |
| --- | --- | --- | --- |
| 01 FFT from Sample Data | Given only x[n], can FFT know Hz? Enable known fs without changing the samples | k/N is cycles/sample; Hz requires documented fs; same X[k] | #samples |
| 02 Resolution & Leakage | Compare increasing actual N with zero-padding to M=4N | Observing longer changes available information; padding only refines the displayed grid | #resolution |
| 03 DFT vs FFT | Direct DFT and radix-2 FFT on identical x[n] and N | Same complex coefficients; FFT reduces operation growth through butterflies | #dftfft |
| 04 DTMF | Listen, compute FFT and choose a low/high frequency pair before guessing | One tone pair identifies a keypad key in a known codebook | #dtmf |
| 05 Sound Fingerprints | Keep note f0 fixed while comparing A/B/C sound models | Harmonic proportions and envelopes distinguish timbre, not pitch alone | #harmonics |
| 06 Audio/Sensor Data | Try built-in demo, then input with/without actual fs | Do not fabricate Hz from samples; N, known fs and window determine axis interpretation | #realdata |
| 07 2D Image FFT | Increase stripe cycles at fixed image size and direction | Higher spatial frequency moves paired FFT peaks; symmetric notches preserve real reconstruction | #image |

## Optional theory guide
Route: `signals-systems/applications-fft-theory.html` (open as a new tab from each lab or the Part C catalog).

Seven independent sections provide: prerequisite framing, three manageable steps, two rendered equations, one numerical example, and a common misconception. A schematic sample-to-spectrum diagram and a mini bin-conversion experiment reinforce that:
- `ν=k/N` in cycles/sample always exists for a valid FFT result
- `f=k fs/N` in Hz only when fs is actually known
- for upper-half real-input DFT bins, a signed interpretation `(k−N)fs/N` makes negative-frequency equivalence explicit.

## Mathematical safeguards
- Record-duration scale: `T=N/fs`, `1/T=fs/N`; padded display grid: `fs/M`. These are not interchangeable physical resolution claims.
- DFT and FFT compute the same complex `X[k]` for identical inputs, up to finite-precision rounding.
- Real audio/CSV: only a valid user-supplied fs or independently provided source metadata authorizes physical Hz. Explicit fs=0 forces unknown.
- DTMF row/column frequencies need not exactly coincide with FFT bin centers.
- Harmonic pitch and timbre are distinct; synthetic piano/guitar/voice examples are not source identification claims.
- For real 2D image data, `F(-u,-v)=conj(F(u,v))`. Filter/notch pairs should preserve this symmetry. Spatial and FFT convolution require consistent boundaries and padding.

## Validation
- Static source contract: `node tests/ss-fft-learning-contract.mjs` verifies the seven core entrypoints, matching theory sections, bilingual content, native evidence hooks and parameter-derived numerical examples.
- Chromium regression: `node tests/ss-fft-learning-browser.mjs` checks **7 × 3 language modes × 2 widths = 42** lab cases, plus **6** theory-page combinations. It selects predictions, performs real native actions, checks live formulas and transfer answers, tests KaTeX when available, verifies no main-card offscreen overflow and preserves screenshots of failures.
- GitHub Actions: `.github/workflows/ss-fft-study-path-qa.yml`.
- Creation of the workflow is not a claim that Chromium tests have already executed successfully. Check the workflow run and artifact for real browser evidence.

## Scope boundaries
- Existing computational engines, uploads and audio controls are unchanged.
- Optional Part C STFT extension remains optional; it is not a prerequisite for the seven core FFT labs.
- Original in-page discovery challenges are preserved rather than replaced by the new common learning path.
