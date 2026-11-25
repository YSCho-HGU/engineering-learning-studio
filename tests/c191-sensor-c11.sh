#!/usr/bin/env bash
set -euo pipefail
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
gcc -std=c11 -Wall -Wextra -Wpedantic -Werror \
  c-programming/low-level-c/examples/main.c \
  c-programming/low-level-c/examples/status.c -o "$tmp/c191-sensor"
check() {
  local byte="$1" expected="$2" actual
  actual="$("$tmp/c191-sensor" "$byte" | tail -n 1)"
  test "$actual" = "state = $expected" || { echo "$byte: $actual != $expected"; return 1; }
}
check 0 IDLE
check 1 RUNNING
check 17 ERROR_STATE
check 181 ERROR_STATE
check 255 ERROR_STATE
if "$tmp/c191-sensor" 256 >/dev/null 2>&1; then echo "Expected out-of-range failure"; exit 1; fi
if "$tmp/c191-sensor" nope >/dev/null 2>&1; then echo "Expected invalid-input failure"; exit 1; fi
test "$("$tmp/c191-sensor" 181 | grep -c 'READY=1 ERROR=0 ALARM=1 LOW_BAT=1')" -eq 1
printf 'PASS: Chapter 19 C11 module, masks and state decoder\n'
