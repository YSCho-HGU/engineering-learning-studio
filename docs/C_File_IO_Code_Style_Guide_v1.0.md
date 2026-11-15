# C Programming · File I/O Code Style Guide v1.0

**Course:** Engineering Learning Studio / C Programming · Chapter 7  
**Verified teaching sample:** [sensor_log_analyzer.c](../c-programming/file-io/examples/sensor_log_analyzer.c)  
**Sample input:** [sensor_log.txt](../c-programming/file-io/data/sensor_log.txt)  
**Scope:** Instructional recommendations, not a statistical claim about which style every C industry project uses.

## Pedagogical progression

| Level | Preferred form | Reason |
|---|---|---|
| First example (Step 03) | `FILE *fp;` then `fp = fopen(...);` | Makes assignment/returned pointer/NULL check obvious |
| Middle (Step 05–06) | `FILE *fp = fopen(...);` | Common concise, clear C style; preserves a variable for later use |
| Practical (Step 07 onward) | Initialization, explicit failure handling, checked reads/writes and close | Models maintainable file I/O and realistic failure behavior |
| Advanced functions | Put save/load logic into named helper functions, return status | Reuse, testing, error propagation |

### Recommended clear style for first exposure

~~~c
FILE *fp;

fp = fopen("sensor_log.txt", "r");
if (fp == NULL) {
    perror("sensor_log.txt");
    return 1;
}
~~~

### Recommended compact practical style

~~~c
FILE *fp = fopen("sensor_log.txt", "r");
if (fp == NULL) {
    perror("sensor_log.txt");
    return EXIT_FAILURE;
}
~~~

These two forms have the same semantics when used in the same scope. No measurable frequency ranking is asserted; both are established idioms in C.

### Valid but less suitable as the default beginner example

~~~c
if ((fp = fopen("sensor_log.txt", "r")) == NULL) {
    perror("sensor_log.txt");
    return 1;
}
~~~

C permits an assignment expression inside an if condition, but requiring extra parentheses makes the opening operation harder for beginners to trace; there is no practical performance advantage.

### Do not use when the file must subsequently be read/closed

~~~c
if (fopen("sensor_log.txt", "r") == NULL) {
    return 1;
}
~~~

On success the returned `FILE *` has been discarded; the code has no handle for reading or closing that opened stream. It is not equivalent to either correct example.

### Other conventions
1. **Use braces even for one-line error branches** in the teaching materials to reduce editing mistakes.
2. **Check `fopen()`** before any I/O with the returned pointer.
3. **Use `perror()` or `fprintf(stderr, ...)`** for useful diagnostic messages.
4. **Check reading function results**, such as `fscanf(fp, "%lf %lf", &time_s, &value) == 2` for two numeric fields.
5. **Differentiate clean EOF and format errors:** after failure, check `ferror(fp)` and the conversion count; when relevant inspect `feof(fp)`. On EOF after successfully reading one of two fields, `fscanf` can return `1` (a partial record), which must not be accepted as a clean complete record.
6. **Always close an opened file**, including on error paths, and check `fclose()` for failure where output integrity matters.
7. **Do not use `while (!feof(fp))`** as the primary loop-read condition.
8. **Use names reflecting meaning**, e.g. `time_s`, `value`, `threshold`, `count`.
9. **Use stable file formats and units.** The website's two-column `sensor_log.txt` is plain text containing decimal numerals. Both numbers are parsed as `double`, not stored as C typed objects. The measured value's physical unit is intentionally unspecified.
10. **For real IoT deployments**, line-oriented parsing with `fgets` + validated numeric parsing and clear record-boundary rules may be more robust than a plain `fscanf` loop; the latter is chosen for this 2nd-year introductory lesson.

### Deliberate limits

The Step 07 sample is *practical-oriented instructional code*, not a production-ready telemetry ingestion library. It does not attempt transaction-safe writes, all possible floating-point validation, strict physical timestamp semantics, or concurrency-safe sensor file handling.

### Source grounding

- Oppenheim-style course is unrelated; C Chapter 7 source is `171_C_File_IO_Rev8` from Google Drive and its sections 7.3–7.5.
- C standard-library reference: https://en.cppreference.com/c/io/fopen
- SEI CERT C, Input/Output recommendations including FIO42-C and FIO47-C: https://cmu-sei.github.io/secure-coding-standards/sei-cert-c-coding-standard/rules/input-output-fio/
