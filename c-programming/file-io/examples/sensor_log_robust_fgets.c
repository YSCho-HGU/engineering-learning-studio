#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>
#include <errno.h>
#include <math.h>
#include <string.h>

#define LINE_CAP 256

/* Return 1 only for exactly two finite decimal values on one line. */
static int parse_line(const char *line, double *time_s, double *value)
{
    char *end;
    const char *p = line;
    double t, v;

    while (isspace((unsigned char)*p)) {
        p++;
    }
    if (*p == '\0') {
        return 0;
    }

    errno = 0;
    t = strtod(p, &end);
    if (end == p || errno == ERANGE || !isfinite(t)) {
        return 0;
    }
    if (!isspace((unsigned char)*end)) {
        return 0;
    }
    p = end;

    errno = 0;
    v = strtod(p, &end);
    if (end == p || errno == ERANGE || !isfinite(v)) {
        return 0;
    }
    while (isspace((unsigned char)*end)) {
        end++;
    }
    if (*end != '\0') {
        return 0;
    }

    *time_s = t;
    *value = v;
    return 1;
}

int main(void)
{
    const double threshold = 3.0;
    double time_s, value, sum = 0.0;
    int count = 0;
    int status = EXIT_SUCCESS;
    size_t line_no = 0;
    char line[LINE_CAP];

    FILE *fp = fopen("sensor_log.txt", "r");
    if (fp == NULL) {
        perror("sensor_log.txt");
        return EXIT_FAILURE;
    }

    while (fgets(line, sizeof line, fp) != NULL) {
        size_t length;

        line_no++;
        length = strlen(line);
        if (length == sizeof line - 1 && line[length - 1] != '\n') {
            fprintf(stderr, "Line %zu too long\n", line_no);
            status = EXIT_FAILURE;
            break;
        }
        if (!parse_line(line, &time_s, &value)) {
            fprintf(stderr, "Invalid record at line %zu\n", line_no);
            status = EXIT_FAILURE;
            break;
        }
        if (!isfinite(sum + value)) {
            fprintf(stderr, "Sum overflow at line %zu\n", line_no);
            status = EXIT_FAILURE;
            break;
        }

        sum += value;
        count++;
        if (value > threshold) {
            if (printf("ALERT %.1f: %.2f\n", time_s, value) < 0) {
                fprintf(stderr, "stdout write error\n");
                status = EXIT_FAILURE;
                break;
            }
        }
    }
    if (ferror(fp)) {
        fprintf(stderr, "Sensor file read error\n");
        status = EXIT_FAILURE;
    }
    if (fclose(fp) == EOF) {
        perror("fclose");
        status = EXIT_FAILURE;
    }
    if (status != EXIT_SUCCESS) {
        return status;
    }
    if (count > 0) {
        printf("Count = %d\nAverage = %.3f\n", count, sum / count);
    } else {
        puts("No sensor records");
    }
    return EXIT_SUCCESS;
}
