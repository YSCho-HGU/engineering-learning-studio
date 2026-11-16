# C Programming — Integrated Core Coding Assessment (Ch.151–181)
**Instructor Key & Rubric | Draft v1 | 2026-11-16**

**Duration:** 75 min · **Total:** 100 · **GCC C11**

## Alignment and educational intent
| Problem | Chapter | Core evidence | Points |
|---|---|---|---:|
| P1 | 151 Pointers | value/address, dereference, swap, array element modification and bounds | 20 |
| P2 | 161 Structures | struct typedef, member access, pointer to record, record array, value copy | 25 |
| P3 | 171 File I/O | modes, write/read, conversion status, EOF/malformed input, error cleanup | 30 |
| P4 | 181 Dynamic Memory | malloc/sizeof, NULL, indexing, free and lifetime | 25 |

Use four independent assessment programs; no optional `realloc`, `calloc`, padding or CSV requirements. File I/O's short M1 one-line-copy practice is covered by the same primitive `fopen`/`fclose`/read/write operations; it need not be an extra timed exam task.

## P1. Reference solution (20)
```c
#include <stdio.h>
void swap(int *a, int *b) {
    int t = *a;
    *a = *b;
    *b = t;
}
void add_to_each(int a[], int n, int delta) {
    int i;
    for (i = 0; i < n; ++i)
        a[i] += delta;
}
int main(void) {
    int x = 4, y = 9;
    int a[4] = {2, 4, 6, 8};
    int i;
    swap(&x, &y);
    add_to_each(a, 4, 3);
    printf("%d %d\n", x, y);
    for (i = 0; i < 4; ++i)
        printf("%d%c", a[i], i == 3 ? '\n' : ' ');
    return 0;
}
```
**Rubric:** swap dereference/exchange 8; array traversal and correct update 8; explanatory distinction between int and int* parameters 4. `swap(x,y)` passes integers where pointers are required, and should be diagnosed by compiler.

## P2. Reference solution (25)
```c
#include <stdio.h>
typedef struct { int id; int score; } Student;
void raise_score(Student *p, int bonus) { p->score += bonus; }
int best_index(const Student a[], int n) {
    int best = 0, i;
    for (i = 1; i < n; ++i)
        if (a[i].score > a[best].score)
            best = i;
    return best;
}
int main(void) {
    Student students[3] = {{101, 75}, {102, 84}, {103, 91}};
    Student copy = students[0];
    int k;
    raise_score(&students[1], 10);
    k = best_index(students, 3);
    printf("%d %d\n", students[k].id, students[k].score);
    printf("%d\n", copy.score);
    return 0;
}
```
**Rubric:** record pointer/member update 7; array search and tie behavior 8; correct main usage/output 6; value-copy explanation 4. Accept equivalent `(*p).score`. Structure assignment copies the field values; this record has no pointer members.

## P3. Reference solution (30)
```c
#include <stdio.h>

int write_log(const char *filename) {
    FILE *fp = fopen(filename, "w");
    int ok = 1;
    if (fp == NULL)
        return 0;
    if (fprintf(fp, "10\n20\n30\n") < 0)
        ok = 0;
    if (fclose(fp) == EOF)
        ok = 0;
    return ok;
}

int read_average(const char *filename, double *avg) {
    FILE *fp = fopen(filename, "r");
    int value, status, count = 0, ok = 1;
    double sum = 0.0;
    if (fp == NULL || avg == NULL) {
        if (fp != NULL) fclose(fp);
        return 0;
    }
    while ((status = fscanf(fp, "%d", &value)) == 1) {
        sum += value;
        ++count;
    }
    if (status != EOF || ferror(fp) || count == 0)
        ok = 0;
    if (fclose(fp) == EOF)
        ok = 0;
    if (!ok)
        return 0;
    *avg = sum / count;
    return 1;
}

int main(void) {
    double avg;
    if (!write_log("sensor.txt")) {
        puts("File error");
        return 1;
    }
    if (!read_average("sensor.txt", &avg)) {
        puts("File error");
        return 1;
    }
    printf("Average: %.1f\n", avg);
    return 0;
}
```
**Rubric:** open modes and NULL checks 6; write, check failures and close 7; read loop/conversion count 8; distinguish EOF, malformed input and I/O error 5; average/output and short explanation 4. `fscanf(...,"%d",...)` returns 1 for conversion, 0 for matching failure, and EOF when input failure occurs before a conversion (either end of file or read error; use `ferror` to distinguish). Accept equivalent robust solutions.

**Test cases:** (a) newly created file -> 20.0; (b) existing file with `10\nabc\n` -> fail; (c) empty file -> fail; (d) nonexistent read file -> fail. Test (b)-(d) by calling `read_average` separately, not after rewriting the same file.

## P4. Reference solution (25)
```c
#include <stdio.h>
#include <stdlib.h>
int main(void) {
    int *a;
    int n = 5, i, sum = 0;
    a = malloc((size_t)n * sizeof *a);
    if (a == NULL) {
        puts("Allocation failed");
        return 1;
    }
    for (i = 0; i < n; ++i)
        a[i] = 2 * (i + 1);
    for (i = 0; i < n; ++i)
        sum += a[i];
    printf("Sum: %d\n", sum);
    free(a);
    return 0;
}
```
**Rubric:** allocation size/expression 7; NULL check before dereference 5; initialization/indexing 5; correct sum/output 3; free 3; lifetime explanation 2. `free(a)` leaves `a`'s value unchanged; dereferencing it afterward is undefined behavior.

## Feedback standard
- **Correctness evidence**: successful GCC C11 compilation, required output and behavior, file/memory safety.
- **Partial credit**: prioritize demonstrated concept mastery; don't deduct twice for a single upstream mistake.
- **No undefined-behavior exercises**: test invalid pointers and use-after-free through explanation, not execution.
- **Progress separation**: browser lesson completion is not proof of successful GCC coding.
- **Publication**: assessment is instructor-only until explicitly released. Student/teacher keys must remain separate.
