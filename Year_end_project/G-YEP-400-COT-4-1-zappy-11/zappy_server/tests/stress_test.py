#!/usr/bin/env python3
"""
Stress / crash test suite for zappy_server.
Tests edge cases that could crash or hang the server.
"""
import socket
import time
import random
import string
import subprocess
import os
import sys
import signal

PORT = 18700 + random.randint(0, 1000)
BINARY = "./zappy_server"
SERVER_ARGS = ["-p", str(PORT), "-x", "10", "-y", "10", "-n", "TestTeam", "-c", "5", "-f", "100"]
passed = 0
failed = 0
server_proc = None

def start_server():
    global server_proc
    server_proc = subprocess.Popen(
        [BINARY] + SERVER_ARGS,
        stdin=subprocess.PIPE,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        preexec_fn=os.setsid
    )
    time.sleep(0.3)

def stop_server():
    global server_proc
    if server_proc:
        try:
            os.killpg(os.getpgid(server_proc.pid), signal.SIGTERM)
        except:
            pass
        server_proc.wait(timeout=2)
        server_proc = None

def connect():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(3)
    s.connect(("127.0.0.1", PORT))
    s.recv(4096)  
    return s

def send_and_recv(s, data, recv_size=4096):
    s.sendall(data)
    time.sleep(0.1)
    try:
        return s.recv(recv_size)
    except:
        return b""

def drain_gui_init(s):
    """Drain all GUI initialization data (msz + 100 bct + tna + pnw + enw)."""
    result = b""
    s.settimeout(0.3)
    try:
        while True:
            chunk = s.recv(65536)
            if not chunk:
                break
            result += chunk
    except socket.timeout:
        pass
    s.settimeout(3)
    return result

def test(name, fn):
    global passed, failed
    try:
        fn()
        passed += 1
        print(f"  PASS: {name}")
    except Exception as e:
        failed += 1
        print(f"  FAIL: {name} -> {e}")




def test_basic_ai_connect():
    s = connect()
    s.sendall(b"TestTeam\n")
    resp = s.recv(4096)
    assert resp, "No response"
    s.close()

def test_basic_gui_connect():
    s = connect()
    s.sendall(b"GRAPHIC\n")
    resp = drain_gui_init(s)
    assert b"msz" in resp, f"Expected msz, got {resp[:20]}"
    s.close()




def test_empty_command():
    s = connect()
    s.sendall(b"TestTeam\n")
    s.recv(4096)
    s.sendall(b"\n")
    resp = s.recv(4096)
    s.close()

def test_binary_data():
    s = connect()
    s.sendall(b"TestTeam\n")
    s.recv(4096)
    s.sendall(b"\x00\x01\x02\xff\xfe\xfd\xfc\n")
    resp = s.recv(4096)
    s.close()

def test_very_long_command():
    s = connect()
    s.sendall(b"TestTeam\n")
    s.recv(4096)
    long_cmd = b"Forward " + b"A" * 10000 + b"\n"
    s.sendall(long_cmd)
    resp = s.recv(4096)
    assert b"ok" in resp.lower() or b"ko" in resp.lower(), f"Unexpected response: {resp[:100]}"
    s.close()

def test_only_spaces():
    s = connect()
    s.sendall(b"TestTeam\n")
    s.recv(4096)
    s.sendall(b"     \n")
    resp = s.recv(4096)
    assert b"ko" in resp.lower(), f"Expected ko, got {resp[:100]}"
    s.close()

def test_unknown_command():
    s = connect()
    s.sendall(b"TestTeam\n")
    s.recv(4096)
    s.sendall(b"FlyToTheMoon\n")
    resp = s.recv(4096)
    assert b"ko" in resp, f"Expected ko, got {resp[:100]}"
    s.close()

def test_command_with_special_chars():
    s = connect()
    s.sendall(b"TestTeam\n")
    s.recv(4096)
    s.sendall(b"Broadcast hello world !@#$%^&*()_+\n")
    resp = s.recv(4096)
    s.close()




def test_inventory_after_death():
    """Player takes food, waits for starvation, then commands"""
    s = connect()
    s.sendall(b"TestTeam\n")
    s.recv(4096)
    for _ in range(15):
        s.sendall(b"Inventory\n")
        time.sleep(0.05)
    resp = s.recv(8192)
    s.close()




def test_gui_invalid_coords():
    s = connect()
    s.sendall(b"GRAPHIC\n")
    drain_gui_init(s)
    s.sendall(b"bct -1 -1\n")
    resp = s.recv(4096)
    assert resp, "No response"
    s.close()

def test_gui_out_of_bounds():
    s = connect()
    s.sendall(b"GRAPHIC\n")
    drain_gui_init(s)
    s.sendall(b"bct 999 999\n")
    resp = s.recv(4096)
    assert resp, "No response"
    s.close()

def test_gui_invalid_player():
    s = connect()
    s.sendall(b"GRAPHIC\n")
    drain_gui_init(s)
    s.sendall(b"ppo -1\n")
    resp = s.recv(4096)
    s.close()

def test_gui_missing_args():
    s = connect()
    s.sendall(b"GRAPHIC\n")
    drain_gui_init(s)
    s.sendall(b"bct\n")  
    resp = s.recv(4096)
    assert b"sbp" in resp, f"Expected sbp, got {resp[:100]}"
    s.close()

def test_gui_nonsense_args():
    s = connect()
    s.sendall(b"GRAPHIC\n")
    drain_gui_init(s)
    s.sendall(b"bct abc def\n")
    resp = s.recv(4096)
    
    s.close()

def test_gui_sst_zero():
    """sst 0 would cause division by zero - must be rejected or handled"""
    s = connect()
    s.sendall(b"GRAPHIC\n")
    drain_gui_init(s)
    s.sendall(b"sst 0\n")
    resp = s.recv(4096)
    
    s.sendall(b"sgt\n")
    resp2 = s.recv(4096)
    assert resp2, "Server crashed after sst 0"
    s.close()

def test_gui_unknown_command():
    s = connect()
    s.sendall(b"GRAPHIC\n")
    drain_gui_init(s)
    s.sendall(b"BLABLA\n")
    resp = s.recv(4096)
    assert b"suc" in resp, f"Expected suc, got {resp[:100]}"
    s.close()




def test_incantation_invalid_level():
    """Try incantation at level 8 (can't go higher)"""
    s = connect()
    s.sendall(b"TestTeam\n")
    s.recv(4096)
    
    s.sendall(b"Incantation\n")
    resp = s.recv(4096)
    s.close()




def test_many_connections():
    sockets = []
    for i in range(30):
        try:
            s = connect()
            s.sendall(b"TestTeam\n")
            s.recv(4096)
            sockets.append(s)
        except:
            break
    for s in sockets:
        try:
            s.close()
        except:
            pass

def test_rapid_connect_disconnect():
    for i in range(50):
        try:
            s = connect()
            s.close()
        except:
            pass




def test_fork_and_connect():
    """Fork, then connect a new player using the egg slot"""
    s1 = connect()
    s1.sendall(b"TestTeam\n")
    s1.recv(4096)

    s1.sendall(b"Fork\n")
    resp = s1.recv(4096)
    assert b"ok" in resp, f"Fork failed: {resp[:100]}"

    
    s2 = connect()
    s2.sendall(b"TestTeam\n")
    resp2 = s2.recv(4096)
    assert resp2, "Second player couldn't connect after fork"
    s1.close()
    s2.close()




def test_eject_no_players():
    s = connect()
    s.sendall(b"TestTeam\n")
    s.recv(4096)
    s.sendall(b"Eject\n")
    resp = s.recv(4096)
    assert b"ko" in resp, f"Eject with no targets should return ko: {resp[:100]}"
    s.close()




def test_broadcast_empty_message():
    s = connect()
    s.sendall(b"TestTeam\n")
    s.recv(4096)
    s.sendall(b"Broadcast\n")
    resp = s.recv(4096)
    s.close()

def test_broadcast_very_long():
    s = connect()
    s.sendall(b"TestTeam\n")
    s.recv(4096)
    s.sendall(b"Broadcast " + b"X" * 5000 + b"\n")
    resp = s.recv(4096)
    assert b"ok" in resp, f"Expected ok, got {resp[:100]}"
    s.close()




def main():
    global passed, failed

    print("=" * 60)
    print("Zappy Server Stress / Crash Test Suite")
    print("=" * 60)

    print("\nStarting server...")
    try:
        start_server()
    except FileNotFoundError:
        print("ERROR: Binary not found. Build first with 'make'")
        sys.exit(1)

    print(f"\n--- Basic Connection Tests ---")
    test("Basic AI connect", test_basic_ai_connect)
    test("Basic GUI connect", test_basic_gui_connect)

    print(f"\n--- Malformed Command Tests ---")
    test("Empty command", test_empty_command)
    test("Binary data", test_binary_data)
    test("Very long command (10k)", test_very_long_command)
    test("Only spaces", test_only_spaces)
    test("Unknown command", test_unknown_command)
    test("Special chars in broadcast", test_command_with_special_chars)

    print(f"\n--- Inventory Edge Cases ---")
    test("Inventory loop", test_inventory_after_death)

    print(f"\n--- GUI Protocol Edge Cases ---")
    test("GUI invalid coords", test_gui_invalid_coords)
    test("GUI out of bounds", test_gui_out_of_bounds)
    test("GUI invalid player", test_gui_invalid_player)
    test("GUI missing args", test_gui_missing_args)
    test("GUI nonsense args", test_gui_nonsense_args)
    test("GUI sst 0 (div by zero)", test_gui_sst_zero)
    test("GUI unknown command", test_gui_unknown_command)

    print(f"\n--- Incantation Edge Cases ---")
    test("Incantation without prep", test_incantation_invalid_level)

    print(f"\n--- Connection Stress Tests ---")
    test("Many connections (30)", test_many_connections)
    test("Rapid connect/disconnect (50)", test_rapid_connect_disconnect)

    print(f"\n--- Fork / Egg Tests ---")
    test("Fork + connect new player", test_fork_and_connect)

    print(f"\n--- Eject Tests ---")
    test("Eject with no targets", test_eject_no_players)

    print(f"\n--- Broadcast Tests ---")
    test("Broadcast empty message", test_broadcast_empty_message)
    test("Broadcast very long message (5k)", test_broadcast_very_long)

    
    print(f"\n--- Final Sanity Check ---")
    try:
        s = connect()
        s.sendall(b"TestTeam\n")
        r = s.recv(4096)
        assert r, "Server not responding after all tests"
        s.close()
        print("  PASS: Server still alive after all tests")
        passed += 1
    except Exception as e:
        print(f"  FAIL: Server crashed! {e}")
        failed += 1

    stop_server()

    print("\n" + "=" * 60)
    print(f"Results: {passed}/{passed + failed} passed")
    if failed > 0:
        print(f"WARNING: {failed} test(s) FAILED")
    else:
        print("All tests passed!")
    print("=" * 60)

    return 0 if failed == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
