#include <errno.h>
#include <stdio.h>
#include <stdlib.h>
#include "status.h"
int main(int argc, char *argv[]) {
    unsigned long input;
    char *end;
    uint8_t status;
    enum State state;
    if (argc != 2) {
        fprintf(stderr, "Usage: %s STATUS_0_TO_255\n", argv[0]);
        return 1;
    }
    errno = 0;
    input = strtoul(argv[1], &end, 0);
    if (errno != 0 || end == argv[1] || *end != '\0' || input > 255ul) {
        fputs("Invalid 8-bit status value\n", stderr);
        return 1;
    }
    status = (uint8_t)input;
    state = decode_state(status);
    printf("status = 0x%02X\n", (unsigned)status);
    printf("READY=%u ERROR=%u ALARM=%u LOW_BAT=%u\n",
        (unsigned)((status & READY_MASK) != 0u), (unsigned)((status & ERROR_MASK) != 0u),
        (unsigned)((status & ALARM_MASK) != 0u), (unsigned)((status & LOW_BAT_MASK) != 0u));
    printf("state = %s\n", state == IDLE ? "IDLE" :
        state == RUNNING ? "RUNNING" : "ERROR_STATE");
    return 0;
}
