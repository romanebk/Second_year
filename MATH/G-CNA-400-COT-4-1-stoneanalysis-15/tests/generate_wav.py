import struct
import math
import sys
import os

SAMPLE_RATE = 48000
BITS_PER_SAMPLE = 16
NUM_CHANNELS = 1


def write_wav(filename, samples, sample_rate=SAMPLE_RATE):
    num_samples = len(samples)
    data_size = num_samples * (BITS_PER_SAMPLE // 8) * NUM_CHANNELS

    with open(filename, 'wb') as f:
        f.write(b'RIFF')
        f.write(struct.pack('<I', 36 + data_size))
        f.write(b'WAVE')
        f.write(b'fmt ')
        f.write(struct.pack('<I', 16))
        f.write(struct.pack('<H', 1))
        f.write(struct.pack('<H', NUM_CHANNELS))
        f.write(struct.pack('<I', sample_rate))
        f.write(struct.pack('<I', sample_rate * NUM_CHANNELS * BITS_PER_SAMPLE // 8))
        f.write(struct.pack('<H', NUM_CHANNELS * BITS_PER_SAMPLE // 8))
        f.write(struct.pack('<H', BITS_PER_SAMPLE))
        f.write(b'data')
        f.write(struct.pack('<I', data_size))
        for s in samples:
            s = max(-32768, min(32767, int(round(s))))
            f.write(struct.pack('<h', s))


def generate_sine_wave(filename, duration=1.0, frequency=440.0, amplitude=16000):
    num_samples = int(SAMPLE_RATE * duration)
    samples = []
    for n in range(num_samples):
        val = amplitude * math.sin(2 * math.pi * frequency * n / SAMPLE_RATE)
        samples.append(val)
    write_wav(filename, samples)
    return num_samples


def generate_multi_tone(filename, duration=1.0, frequencies=None, amplitude=8000):
    if frequencies is None:
        frequencies = [440.0, 880.0, 1320.0]
    num_samples = int(SAMPLE_RATE * duration)
    samples = []
    for n in range(num_samples):
        val = 0.0
        for freq in frequencies:
            val += amplitude * math.sin(2 * math.pi * freq * n / SAMPLE_RATE)
        val /= len(frequencies)
        samples.append(val)
    write_wav(filename, samples)
    return num_samples


def generate_silence(filename, duration=0.5):
    num_samples = int(SAMPLE_RATE * duration)
    samples = [0] * num_samples
    write_wav(filename, samples)
    return num_samples


def generate_noise(filename, duration=0.5, amplitude=8000):
    import random
    num_samples = int(SAMPLE_RATE * duration)
    samples = [(random.random() * 2 - 1) * amplitude for _ in range(num_samples)]
    write_wav(filename, samples)
    return num_samples


def main():
    os.makedirs('tests', exist_ok=True)

    print("Generating test WAV files...")

    n = generate_sine_wave("test_sine_440.wav", duration=0.5, frequency=440.0)
    print(f"  test_sine_440.wav: {n} samples ({n / SAMPLE_RATE:.2f}s)")

    n = generate_sine_wave("test_sine_1000.wav", duration=0.3, frequency=1000.0)
    print(f"  test_sine_1000.wav: {n} samples ({n / SAMPLE_RATE:.2f}s)")

    n = generate_multi_tone("test_multi_tone.wav", duration=0.5)
    print(f"  test_multi_tone.wav: {n} samples ({n / SAMPLE_RATE:.2f}s)")

    n = generate_silence("test_silence.wav", duration=0.3)
    print(f"  test_silence.wav: {n} samples ({n / SAMPLE_RATE:.2f}s)")

    n = generate_noise("test_noise.wav", duration=0.3)
    print(f"  test_noise.wav: {n} samples ({n / SAMPLE_RATE:.2f}s)")

    print("Done.")


if __name__ == "__main__":
    main()
