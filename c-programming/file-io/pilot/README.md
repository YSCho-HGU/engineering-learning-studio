# File I/O Pilot v2 — M3 File Modes & M4 EOF / Error Handling

**Status:** educational vertical slice, not a real C execution service.  
**Source alignment:** 171_C_File_IO_Rev8, §§7.3–7.4.4 and [File I/O Learning Experience Blueprint v1.0](../../../docs/File_IO_Learning_Experience_Blueprint_v1.0.md).  
**Live path:** \`/c-programming/file-io/pilot/\` (after GitHub Pages deployment).

## Core educational sequence
1. Select an input scenario.
2. Predict the outcome and optionally justify it *before* the simulator is enabled.
3. Step through only the code path relevant to the selected file mode.
4. Inspect return values, stream state, file bytes or stdout and event trace.
5. Explain why the result differs or agrees with the prediction, then transfer the idea.

### M3
- \`r\` opens an existing file; missing \`r\` file yields \`NULL\`.
- \`w\` creates/truncates, \`a\` creates/appends; working-directory choice changes the virtual file path.
- \`fgets\` is called one time per button. \`fputs\` is automatically executed **only if** \`fgets\` succeeds.
- \`fclose\` follows the example program after the read loop ends or the one write completes.
- \`Restart Program\` retains the virtual file; \`Reset Lab\` restores sample data.
- Simulated positions are measured in **characters of the ASCII sample**; for non-ASCII data, this is not a general byte-accurate filesystem model.

### M4
- \`fscanf(fp, "%d", &x) == 1\` means **one integer was converted**.
- Normal data: three successes, then EOF.
- Malformed token: one success, then return 0 with feof=0.
- Empty file: immediate EOF with feof=1.
- I/O error: deliberately injected on read 2; return EOF with ferror=1. This is a **synthetic error**, not an OS read failure.
- Code rows and displayed diagnostic branches correspond to the modeled outcome.

## Safety and validity boundaries
- Never call this a real GCC run or actual OS stream state; JavaScript-only teaching model.
- No real filesystem access, no user C compilation, no online automatic grading.
- Code listings are educational reference snippets and must be compiled against corresponding test fixtures before being labeled GCC-verified.
- Written predictions and explanations can be locally saved or downloaded; server collection is not implemented.
- This pilot does not yet constitute mastery assessment or evidence of learning effectiveness.

## Regression tests
Run from repository root:

\`\`\`sh
node c-programming/file-io/pilot/engine.test.js
\`\`\`

Eight Node test groups cover: successful M3 reads and EOF, w truncation/restart/reset, append, missing file and file creation, M4 valid, malformed, empty, and injected error cases. During implementation, 16 independent deterministic assertions also passed in a test harness; browser user-interaction E2E remains unverified.

## Next quality gates
1. Verify all buttons, focus order, contrast and mobile layout in Chrome/Firefox.
2. Compile the M3/M4 reference C examples with GCC and test outputs in a disposable directory; keep true execution evidence separate.
3. Collect student usability feedback before replacing the pre-existing eight-stage File I/O course.
4. Build an instructor-reviewed rubric for explanation quality and unscaffolded transfer tasks.

This pilot preserves the current published File I/O journey and P1–P6 Practice Lab.
