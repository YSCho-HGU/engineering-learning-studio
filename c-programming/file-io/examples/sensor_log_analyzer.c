#include <stdio.h>
#include <stdlib.h>

int main(void) {
    const double threshold = 3.0;
    double time_s, value, sum = 0.0;
    int count = 0;
    int fields;
    int result = EXIT_SUCCESS;

    FILE *fp = fopen("sensor_log.txt", "r");
    if (fp == NULL) {
        perror("sensor_log.txt");
        return EXIT_FAILURE;
    }

    while ((fields = fscanf(fp, "%lf %lf", &time_s, &value)) == 2) {
        sum += value;
        count++;
        if (value > threshold) {
            printf("ALERT %.1f: %.2f\n", time_s, value);
        }
    }

    if (ferror(fp)) {
        fprintf(stderr, "Sensor file read error\n");
        result = EXIT_FAILURE;
    } else if (fields != EOF) {
        fprintf(stderr, "Invalid sensor record: %d field(s) read\n", fields);
        result = EXIT_FAILURE;
    }

    if (fclose(fp) == EOF) {
        perror("fclose");
        result = EXIT_FAILURE;
    }
    if (result != EXIT_SUCCESS) {
        return result;
    }
    if (count > 0) {
        printf("Count = %d\n", count);
        printf("Average = %.3f\n", sum / count);
    } else {
        puts("No sensor records");
    }
    return EXIT_SUCCESS;
}
