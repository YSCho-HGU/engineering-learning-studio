# C Programming — Integrated Core Coding Assessment (Ch.151–181)
**Student Edition | Draft v1 | 2026-11-16**

**Time:** 75 minutes · **Total:** 100 points · **Standard:** GCC C11

## General instructions
- Complete **four independent programs**. A failure in one problem does not affect the others.
- Implement the requested functions and main-program logic. You may use the standard C library.
- Source files: `p1.c`, `p2.c`, `p3.c`, `p4.c`.
- Compile using `gcc -std=c11 -Wall -Wextra -pedantic`. Follow the provided input and output conventions.
- Starter code is intentionally partial; completing TODOs is the main assessment.
- Do not use `calloc`, `realloc`, double pointers, or platform-specific behavior. They are beyond Core requirements.
- For file tasks, files are created in the current working directory. Never assume a file can be opened successfully.

## P1. Pointer and Array Update (20 points, suggested 15 minutes)
**Learning objectives:** address vs value; modifying caller data through pointers; array traversal; valid indexing.

Write `void swap(int *a, int *b)` and `void add_to_each(int a[], int n, int delta)`. Use these functions to produce the output shown. The functions must modify the original objects, not merely print simulated results.

```c
#include <stdio.h>

void swap(int *a, int *b) {
    /* TODO 1 */
}

void add_to_each(int a[], int n, int delta) {
    /* TODO 2: update each valid element */
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
**Expected output**
```text
9 4
5 7 9 11
```
**Explain briefly:** Why does `swap(x, y)` not satisfy the function's pointer parameters?

## P2. Structure Record Summary (25 points, suggested 18 minutes)
**Learning objectives:** `typedef struct`, `.` and `->`, arrays of records, passing a record address, structure value copy.

Complete the following program. `raise_score` should add `bonus` to the record referred to by `p`. `best_index` should return the index of the record with the highest score; on a tie, return the smallest index. In `main`, update the second student and print the best student's ID and score.

```c
#include <stdio.h>

typedef struct {
    int id;
    int score;
} Student;

void raise_score(Student *p, int bonus) {
    /* TODO 1 */
}

int best_index(const Student a[], int n) {
    int best = 0, i;
    /* TODO 2 */
    return best;
}

int main(void) {
    Student students[3] = {{101, 75}, {102, 84}, {103, 91}};
    Student copy = students[0];
    int k;
    /* TODO 3: add 10 to student 102, find highest score, print:
       102 94
       75
       Keep copy unchanged. */
    return 0;
}
```
**Expected output**
```text
102 94
75
```
**Explain briefly:** Why is `copy.score` still 75 after the other record is changed?

## P3. File I/O — Sensor Log (30 points, suggested 24 minutes)
**Learning objectives:** `fopen` modes; `fprintf`; `fscanf` return-value handling; `fclose`; numerical summary.

Complete a program that creates a text file `sensor.txt` containing one integer per line (`10`, `20`, `30`), closes it, reopens it in read mode, computes their average, and prints `Average: 20.0`.

Implement `int write_log(const char *filename)` and `int read_average(const char *filename, double *avg)`. Return **1 for success and 0 for failure**. For reading, a file is valid only if it has at least one integer and no malformed non-whitespace token. Use the result of `fscanf` to distinguish successful conversion, end of file, and malformed input. Always close a successfully opened file on every return path.

```c
#include <stdio.h>

int write_log(const char *filename) {
    FILE *fp;
    /* TODO 1: open with "w", check failure, write 10/20/30,
       detect fprintf failures, close and report status */
    return 0;
}

int read_average(const char *filename, double *avg) {
    FILE *fp;
    int value, status, count = 0;
    double sum = 0.0;
    /* TODO 2: open with "r"; read using fscanf(fp, "%d", &value);
       reject malformed data; handle I/O error and empty files;
       close; write *avg only on success */
    return 0;
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
**Expected console output:** `Average: 20.0`

**Expected file contents:**
```text
10
20
30
```

**Short answer:** What is the difference between `fscanf` returning `EOF` and returning `0` for a single `%d` conversion?

## P4. Dynamic Array and Resource Lifetime (25 points, suggested 18 minutes)
**Learning objectives:** `malloc`, `sizeof`, `NULL` checking, indexing, `free`, ownership.

Complete the program so that it allocates space for **5 integers**, stores the values `2, 4, 6, 8, 10`, computes their sum and displays `Sum: 30`, then releases the memory. The allocation must use the pointed-to object size rather than hardcoding a byte count.

```c
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int *a;
    int n = 5, i, sum = 0;
    /* TODO 1: allocate n integers with malloc */
    /* TODO 2: handle allocation failure */
    for (i = 0; i < n; ++i) {
        /* TODO 3: set 2 * (i + 1) */
    }
    for (i = 0; i < n; ++i) {
        /* TODO 4: sum elements */
    }
    printf("Sum: %d\n", sum);
    /* TODO 5: release the allocated storage */
    return 0;
}
```
**Expected output:** `Sum: 30`

**Explain briefly:** Does `free(a)` automatically change `a` to `NULL`? Why must the program avoid using the released memory?

---
**Instructor note (not for distribution to students):** This is a standalone assessment draft. It does not automatically read course progress or perform code execution in the browser. Publish only after instructor review.
