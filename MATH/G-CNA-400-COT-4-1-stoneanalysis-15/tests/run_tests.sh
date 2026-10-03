#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BINARY="$PROJECT_DIR/stone_analysis"

TESTS_PASSED=0
TESTS_FAILED=0

assert_eq() {
    local expected="$1"
    local actual="$2"
    local desc="$3"
    if [ "$expected" == "$actual" ]; then
        echo "  PASS: $desc"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo "  FAIL: $desc (expected: '$expected', got: '$actual')"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

assert_exit() {
    local expected="$1"
    local desc="$2"
    shift 2
    set +e
    "$@" > /dev/null 2>&1
    local actual=$?
    set -e
    if [ "$expected" == "$actual" ]; then
        echo "  PASS: $desc"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo "  FAIL: $desc (expected exit: $expected, got: $actual)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

cd "$PROJECT_DIR"

echo "=== Test 1: Help display ==="
assert_exit 0 "Help display shows usage" $BINARY --help

echo ""
echo "=== Test 2: Missing arguments ==="
assert_exit 84 "No arguments returns 84" $BINARY

echo ""
echo "=== Test 3: Invalid mode ==="
assert_exit 84 "Invalid mode returns 84" $BINARY --invalid

echo ""
echo "=== Test 4: Analyze mode - top 3 frequencies ==="
OUTPUT=$(timeout 30 $BINARY --analyze "$SCRIPT_DIR/test_sine_440.wav" 3 2>&1)
assert_exit 0 "Analyze mode returns 0" $BINARY --analyze "$SCRIPT_DIR/test_sine_440.wav" 3
echo "$OUTPUT" | grep -q "Top 3 frequencies:"
assert_eq $? 0 "Analyze shows 'Top 3 frequencies:'"

echo ""
echo "=== Test 5: Analyze mode - 440Hz should be in output ==="
echo "$OUTPUT" | grep -q "440.0 Hz"
assert_eq $? 0 "440Hz is top frequency"

echo ""
echo "=== Test 6: Cypher mode - encode message ==="
assert_exit 0 "Cypher mode returns 0" $BINARY --cypher "$SCRIPT_DIR/test_sine_440.wav" test_output.wav "HELLO"

echo ""
echo "=== Test 7: Cypher preserves file size ==="
ORIG_SIZE=$(stat -c%s "$SCRIPT_DIR/test_sine_440.wav")
OUT_SIZE=$(stat -c%s "test_output.wav")
assert_eq "$ORIG_SIZE" "$OUT_SIZE" "Output file same size as input"

echo ""
echo "=== Test 8: Cypher preserves header ==="
ORIG_ID=$(xxd -l 4 "$SCRIPT_DIR/test_sine_440.wav" | head -1)
OUT_ID=$(xxd -l 4 "test_output.wav" | head -1)
assert_eq "$ORIG_ID" "$OUT_ID" "RIFF header preserved"

echo ""
echo "=== Test 9: Decypher mode - decode message ==="
MSG=$(timeout 30 $BINARY --decypher test_output.wav 2>&1)
assert_eq "$MSG" "HELLO" "Decypher returns original message"

echo ""
echo "=== Test 10: Round trip with multi-tone file ==="
assert_exit 0 "Cypher on multi-tone" $BINARY --cypher "$SCRIPT_DIR/test_multi_tone.wav" test_roundtrip.wav "TEST MESSAGE"
MSG2=$(timeout 30 $BINARY --decypher test_roundtrip.wav 2>&1)
assert_eq "$MSG2" "TEST MESSAGE" "Decypher multi-tone"

echo ""
echo "=== Test 11: Round trip with numbers ==="
assert_exit 0 "Cypher with numbers" $BINARY --cypher "$SCRIPT_DIR/test_sine_440.wav" test_output.wav "TEST 123 456"
MSG3=$(timeout 30 $BINARY --decypher test_output.wav 2>&1)
assert_eq "$MSG3" "TEST 123 456" "Numbers round-trip"

echo ""
echo "=== Test 12: Empty message should fail ==="
assert_exit 84 "Empty message returns 84" $BINARY --cypher "$SCRIPT_DIR/test_sine_440.wav" test_output.wav ""

echo ""
echo "=== Test 13: Character validation - non-printable chars rejected ==="
assert_exit 84 "Non-printable chars rejected" $BINARY --cypher "$SCRIPT_DIR/test_sine_440.wav" test_output.wav "$(printf 'hello\a')"

echo ""
echo "=== Test 14: Analyze mode - top 1 on 1000Hz ==="
OUTPUT2=$(timeout 30 $BINARY --analyze "$SCRIPT_DIR/test_sine_1000.wav" 1 2>&1)
echo "$OUTPUT2" | grep -q "1000.0 Hz"
assert_eq $? 0 "1000Hz is top frequency"

echo ""
echo "=== Test 15: Audio file too small ==="
assert_exit 84 "Too small audio file" $BINARY --cypher "$SCRIPT_DIR/test_silence.wav" test_output.wav "VERYLONGMESSAGE"

echo ""
echo "=== Test 16: Decypher on non-encoded file ==="
assert_exit 84 "No message in original" $BINARY --decypher "$SCRIPT_DIR/test_sine_440.wav"

echo ""
echo "========================================="
echo "Results: $TESTS_PASSED passed, $TESTS_FAILED failed"
echo "========================================="
