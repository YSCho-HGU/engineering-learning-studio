#include <stdio.h>

int main(void) {
    double score = 92.5; /* value in process memory */
    FILE *fp;

    fp = fopen("scores.txt", "w");
    if (fp == NULL) {
        perror("scores.txt");
        return 1;
    }

    if (fprintf(fp, "101 Mina %.1f\n", score) < 0) {
        fprintf(stderr, "File write error\n");
        fclose(fp);
        return 1;
    }

    if (fclose(fp) == EOF) {
        perror("fclose");
        return 1;
    }
    return 0;
}
