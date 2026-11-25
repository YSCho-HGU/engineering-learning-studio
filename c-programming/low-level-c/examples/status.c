#include "status.h"
enum State decode_state(uint8_t status) {
    if (status & (ERROR_MASK | ALARM_MASK)) return ERROR_STATE;
    if (status & READY_MASK) return RUNNING;
    return IDLE;
}
uint8_t set_bit(uint8_t value, unsigned bit) {
    return bit < 8u ? (uint8_t)(value | (1u << bit)) : value;
}
uint8_t clear_bit(uint8_t value, unsigned bit) {
    return bit < 8u ? (uint8_t)(value & ~(1u << bit)) : value;
}
uint8_t toggle_bit(uint8_t value, unsigned bit) {
    return bit < 8u ? (uint8_t)(value ^ (1u << bit)) : value;
}
