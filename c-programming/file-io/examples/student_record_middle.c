#include <stdio.h>

struct Student {
    int id;
    char name[40];
    double score;
};

int main(void) {
    struct Student s = {101, "Mina", 92.5};
    FILE *fp = fopen("students.txt", "w");
    if (fp == NULL) {
        perror("students.txt");
        return 1;
    }
    if (fprintf(fp, "%d %s %.1f\n", s.id, s.name, s.score) < 0) {
        fclose(fp);
        return 1;
    }
    if (fclose(fp) == EOF) {
        perror("fclose");
        return 1;
    }

    fp = fopen("students.txt", "r");
    if (fp == NULL) {
        perror("students.txt");
        return 1;
    }
    if (fscanf(fp, "%d %39s %lf", &s.id, s.name, &s.score) != 3) {
        fprintf(stderr, "Invalid student record\n");
        fclose(fp);
        return 1;
    }
    printf("%d %s %.1f\n", s.id, s.name, s.score);
    if (fclose(fp) == EOF) {
        perror("fclose");
        return 1;
    }
    return 0;
}
