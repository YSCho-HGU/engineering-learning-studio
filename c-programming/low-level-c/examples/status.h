#ifndef C191_STATUS_H
#define C191_STATUS_H
#include <stdint.h>
#define READY_MASK (1u << 0)
#define ERROR_MASK (1u << 1)
#define ALARM_MASK (1u << 4)
#define LOW_BAT_MASK (1u << 5)
enum State { IDLE, RUNNING, ERROR_STATE };
enum State decode_state(uint8_t status);
uint8_t set_bit(uint8_t value, unsigned bit);
uint8_t clear_bit(uint8_t value, unsigned bit);
uint8_t toggle_bit(uint8_t value, unsigned bit);
#endif
