#!/usr/bin/env python3
"""
robustness_test.py — Suite de robustesse "maxLevel" pour zappy_server.

But : marteler le serveur avec des charges et des cas limites extrêmes pour
vérifier qu'il ne CRASH JAMAIS et ne se FIGE JAMAIS, sous aucune condition.

Ce script NE MODIFIE PAS le serveur : il le lance comme un processus externe,
le bombarde, puis vérifie après chaque phase qu'il est toujours :
  - vivant (le processus n'est pas mort / pas de core dump),
  - réactif (accepte une nouvelle connexion et répond dans les temps).

Scénarios couverts (chacun poussé au maximum selon --level) :
  1.  Flood de connexions simultanées (bien au-delà des slots d'équipe / fd).
  2.  Connect/disconnect ultra-rapides + RST abrupts (test SIGPIPE/accept).
  3.  Slowloris : connexions qui n'envoient jamais de '\n'.
  4.  Flood de commandes sur une IA (test back-pressure file de commandes).
  5.  Ligne géante sans '\n' (plusieurs Mo) — test croissance/limite de buffer.
  6.  Fuzzing binaire : octets aléatoires, NUL, caractères de contrôle.
  7.  Paquets fragmentés (1 octet à la fois) sur de nombreux sockets.
  8.  Fork bomb : de multiples IA forkent en boucle (sature les œufs).
  9.  Tempête de broadcasts géants et concurrents (test O(n^2)).
  10. Flood GUI : nombreuses GUI spammant bct/ppo/sgt/sst (dont 'sst 0').
  11. Charge mixte IA + GUI en parallèle.
  12. Saturation des équipes puis connexions refusées proprement.
  13. Commandes "pipelinées" (plusieurs '\n' dans un seul send()).
  14. Soak test : charge soutenue pendant N secondes + sondes de vie.

Usage :
    python3 robustness_test.py                 # niveau par défaut (3)
    python3 robustness_test.py --level max     # tout à fond
    python3 robustness_test.py --binary ./bin/zappy_server --level 5
    python3 robustness_test.py --keep-going    # n'arrête pas au 1er échec

Code de sortie : 0 si le serveur a survécu à tout, 1 sinon.
"""

import argparse
import os
import random
import signal
import socket
import string
import struct
import subprocess
import sys
import threading
import time

# --------------------------------------------------------------------------- #
#  Configuration / état global
# --------------------------------------------------------------------------- #

HOST = "127.0.0.1"

# Multiplicateurs d'intensité par niveau. "max" = on tape très fort.
LEVELS = {
    1: dict(conns=50,   churn=200,   slow=40,   cmds=2000,   giant_mb=1,
            forkers=4,   bcasters=8,  guis=16,  soak_s=3),
    2: dict(conns=150,  churn=600,   slow=120,  cmds=8000,   giant_mb=4,
            forkers=8,   bcasters=16, guis=40,  soak_s=5),
    3: dict(conns=400,  churn=1500,  slow=300,  cmds=20000,  giant_mb=8,
            forkers=16,  bcasters=32, guis=80,  soak_s=8),
    4: dict(conns=800,  churn=3000,  slow=600,  cmds=50000,  giant_mb=16,
            forkers=32,  bcasters=64, guis=160, soak_s=12),
    5: dict(conns=1500, churn=6000,  slow=1200, cmds=100000, giant_mb=32,
            forkers=64,  bcasters=128, guis=300, soak_s=20),
}
MAX_LEVEL = 5


class Runner:
    """Gère le cycle de vie du serveur et l'accumulation des résultats."""

    def __init__(self, args):
        self.args = args
        self.cfg = LEVELS[args.level]
        self.proc = None
        self.passed = 0
        self.failed = 0
        self.keep_going = args.keep_going

    # ---- cycle de vie serveur -------------------------------------------- #

    def start(self):
        cmd = [
            self.args.binary,
            "-p", str(self.args.port),
            "-x", str(self.args.width),
            "-y", str(self.args.height),
            "-n", *self.args.teams,
            "-c", str(self.args.clients),
            "-f", str(self.args.freq),
        ]
        print(f"[runner] démarrage : {' '.join(cmd)}")
        self.proc = subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            preexec_fn=os.setsid,
        )
        # Laisser le temps au socket d'écoute de s'ouvrir.
        deadline = time.time() + 5
        while time.time() < deadline:
            if self.proc.poll() is not None:
                raise RuntimeError(
                    f"le serveur est mort au démarrage (code {self.proc.returncode})")
            try:
                s = socket.create_connection((HOST, self.args.port), timeout=0.5)
                s.close()
                print("[runner] serveur prêt.")
                return
            except OSError:
                time.sleep(0.1)
        raise RuntimeError("le serveur n'écoute pas après 5 s")

    def stop(self):
        if not self.proc:
            return
        try:
            os.killpg(os.getpgid(self.proc.pid), signal.SIGTERM)
            self.proc.wait(timeout=3)
        except Exception:
            try:
                os.killpg(os.getpgid(self.proc.pid), signal.SIGKILL)
            except Exception:
                pass
        self.proc = None

    def server_crashed(self):
        """True si le processus s'est terminé (et comment)."""
        if self.proc is None:
            return True, "processus absent"
        rc = self.proc.poll()
        if rc is None:
            return False, None
        # rc < 0 => tué par un signal (SIGSEGV=-11, SIGABRT=-6, ...)
        if rc < 0:
            return True, f"signal {-rc} ({signal.Signals(-rc).name})"
        return True, f"exit code {rc}"

    # ---- exécution d'un scénario ----------------------------------------- #

    def run(self, name, fn):
        crashed, why = self.server_crashed()
        if crashed:
            print(f"  SKIP : {name} (serveur déjà mort : {why})")
            self.failed += 1
            return
        print(f"  …  {name}")
        t0 = time.time()
        err = None
        try:
            fn(self)
        except Exception as e:  # le scénario lui-même a planté côté client
            err = repr(e)

        # Le verdict ne dépend PAS de l'exception client : ce qui compte, c'est
        # que le serveur soit toujours vivant et réactif après la charge.
        crashed, why = self.server_crashed()
        if crashed:
            print(f"  FAIL : {name} -> SERVEUR MORT ({why})"
                  + (f" | erreur client: {err}" if err else ""))
            self.failed += 1
            if not self.keep_going:
                raise SystemExit(self._summary_and_code(crashed=True))
            return
        alive, live_err = liveness_check(self.args)
        dt = time.time() - t0
        if alive:
            extra = f" (client: {err})" if err else ""
            print(f"  PASS : {name}  [{dt:0.1f}s]{extra}")
            self.passed += 1
        else:
            print(f"  FAIL : {name} -> serveur NON RÉACTIF ({live_err})")
            self.failed += 1
            if not self.keep_going:
                raise SystemExit(self._summary_and_code(crashed=True))

    def _summary_and_code(self, crashed=False):
        print("\n" + "=" * 64)
        total = self.passed + self.failed
        print(f"Résultat : {self.passed}/{total} phases OK")
        if crashed:
            print("STATUT : ÉCHEC — le serveur a flanché.")
        elif self.failed:
            print(f"STATUT : {self.failed} phase(s) en échec.")
        else:
            print("STATUT : SUCCÈS — le serveur n'a jamais flanché.")
        print("=" * 64)
        return 1 if self.failed else 0


# --------------------------------------------------------------------------- #
#  Helpers réseau
# --------------------------------------------------------------------------- #

def new_socket(timeout=3.0):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(timeout)
    s.connect((HOST, PORT))
    return s


def recv_some(s, n=4096):
    try:
        return s.recv(n)
    except OSError:
        return b""


def ai_connect(team, timeout=3.0):
    """Connexion IA complète : lit WELCOME, envoie l'équipe, lit la réponse."""
    s = new_socket(timeout)
    recv_some(s)                      # WELCOME\n
    s.sendall(team.encode() + b"\n")
    recv_some(s)                      # <client-num>\n puis "X Y\n"
    return s


def gui_connect(timeout=3.0):
    s = new_socket(timeout)
    recv_some(s)                      # WELCOME\n
    s.sendall(b"GRAPHIC\n")
    # vider l'init (msz + bct... + tna + ...)
    s.settimeout(0.4)
    try:
        while True:
            if not s.recv(65536):
                break
    except OSError:
        pass
    s.settimeout(timeout)
    return s


def close_quiet(s, reset=False):
    try:
        if reset:
            # SO_LINGER {1,0} => RST à la fermeture (déconnexion brutale).
            s.setsockopt(socket.SOL_SOCKET, socket.SO_LINGER,
                         struct.pack("ii", 1, 0))
        s.close()
    except OSError:
        pass


def liveness_check(args):
    """Le serveur accepte-t-il une nouvelle IA et répond-il à temps ?"""
    try:
        s = socket.create_connection((HOST, args.port), timeout=4)
        s.settimeout(4)
        data = s.recv(4096)
        if not data:
            close_quiet(s)
            return False, "pas de WELCOME"
        s.sendall(args.teams[0].encode() + b"\n")
        resp = s.recv(4096)
        close_quiet(s)
        if not resp:
            return False, "pas de réponse après le nom d'équipe"
        return True, None
    except Exception as e:
        return False, repr(e)


def spawn(n, target, *targs, join_timeout=30.0):
    """Lance n threads identiques et les rejoint (best-effort)."""
    threads = [threading.Thread(target=target, args=targs, daemon=True)
               for _ in range(n)]
    for t in threads:
        t.start()
    end = time.time() + join_timeout
    for t in threads:
        t.join(max(0.0, end - time.time()))
    return threads


RANDOM_CMDS = [
    b"Forward\n", b"Right\n", b"Left\n", b"Look\n", b"Inventory\n",
    b"Connect_nbr\n", b"Fork\n", b"Eject\n", b"Take food\n",
    b"Set food\n", b"Broadcast hi\n", b"Incantation\n",
]


# --------------------------------------------------------------------------- #
#  Scénarios — chacun "poussé au maximum" via la config de niveau
# --------------------------------------------------------------------------- #

def sc_connection_flood(r):
    """Ouvre un maximum de connexions simultanées, bien au-delà des slots."""
    n = r.cfg["conns"]
    socks = []
    for _ in range(n):
        try:
            s = new_socket(timeout=2.0)
            socks.append(s)
        except OSError:
            # Atteindre la limite de fd est normal : le serveur doit survivre.
            break
    # On en garde une partie en IA, une partie muette.
    for i, s in enumerate(socks):
        try:
            if i % 2 == 0:
                s.sendall(r.args.teams[i % len(r.args.teams)].encode() + b"\n")
        except OSError:
            pass
    time.sleep(0.5)
    for s in socks:
        close_quiet(s)


def sc_connect_churn(r):
    """Connexions/déconnexions ultra-rapides, dont des RST brutaux."""
    n = r.cfg["churn"]

    def worker(count):
        for i in range(count):
            try:
                s = new_socket(timeout=1.5)
                if i % 3 == 0:
                    # déconnexion immédiate sans rien lire (RST)
                    close_quiet(s, reset=True)
                elif i % 3 == 1:
                    recv_some(s)
                    s.sendall(r.args.teams[0].encode() + b"\n")
                    close_quiet(s, reset=True)
                else:
                    close_quiet(s)
            except OSError:
                pass

    per = max(1, n // 8)
    spawn(8, worker, per)


def sc_slowloris(r):
    """Beaucoup de connexions qui n'envoient jamais de fin de ligne."""
    n = r.cfg["slow"]
    socks = []
    for _ in range(n):
        try:
            s = new_socket(timeout=2.0)
            recv_some(s)
            s.sendall(b"Forw")          # ligne jamais terminée
            socks.append(s)
        except OSError:
            break
    time.sleep(1.0)                      # on laisse mariner
    for s in socks:
        close_quiet(s, reset=True)


def sc_command_flood(r):
    """Une IA envoie un déluge de commandes (test back-pressure file=10)."""
    total = r.cfg["cmds"]
    try:
        s = ai_connect(r.args.teams[0], timeout=5.0)
    except OSError:
        return
    blob = b"".join(random.choice(RANDOM_CMDS) for _ in range(1000))
    sent = 0
    drained = threading.Event()

    def drainer():
        s.settimeout(0.5)
        while not drained.is_set():
            try:
                if not s.recv(65536):
                    break
            except OSError:
                break

    th = threading.Thread(target=drainer, daemon=True)
    th.start()
    try:
        while sent < total:
            s.sendall(blob)
            sent += 1000
    except OSError:
        pass
    drained.set()
    th.join(2.0)
    close_quiet(s)


def sc_giant_line(r):
    """Envoie une ligne de plusieurs Mo SANS '\n' (croissance de buffer)."""
    mb = r.cfg["giant_mb"]
    try:
        s = ai_connect(r.args.teams[0], timeout=5.0)
    except OSError:
        return
    chunk = b"A" * (256 * 1024)
    try:
        for _ in range(mb * 4):          # mb Mo au total
            s.sendall(chunk)
        s.sendall(b"\n")                 # on termine enfin la ligne
        recv_some(s)
    except OSError:
        pass
    close_quiet(s, reset=True)


def sc_binary_fuzz(r):
    """Octets aléatoires / NUL / caractères de contrôle sur de nombreux sockets."""
    n = max(20, r.cfg["slow"] // 4)

    def worker(count):
        for _ in range(count):
            try:
                s = new_socket(timeout=1.5)
                recv_some(s)
                payload = bytes(random.getrandbits(8)
                                for _ in range(random.randint(1, 2048)))
                s.sendall(payload + b"\n")
                recv_some(s)
                close_quiet(s, reset=True)
            except OSError:
                pass

    per = max(1, n // 8)
    spawn(8, worker, per)


def sc_fragmented(r):
    """Envoi octet par octet d'une commande (réassemblage côté serveur)."""
    n = max(10, r.cfg["slow"] // 6)
    socks = []
    cmd = b"Broadcast fragmented-packet-test\n"
    for _ in range(n):
        try:
            s = new_socket(timeout=2.0)
            recv_some(s)
            s.sendall(r.args.teams[0].encode() + b"\n")
            socks.append(s)
        except OSError:
            break
    for byte in cmd:
        for s in socks:
            try:
                s.sendall(bytes([byte]))
            except OSError:
                pass
        time.sleep(0.001)
    time.sleep(0.3)
    for s in socks:
        close_quiet(s)


def sc_fork_bomb(r):
    """Plusieurs IA forkent en boucle pour saturer la création d'œufs."""
    n = r.cfg["forkers"]

    def worker():
        try:
            s = ai_connect(r.args.teams[random.randrange(len(r.args.teams))],
                           timeout=4.0)
        except OSError:
            return
        s.settimeout(1.0)
        try:
            for _ in range(40):
                s.sendall(b"Fork\n")
        except OSError:
            pass
        # vider un peu
        try:
            for _ in range(5):
                if not s.recv(8192):
                    break
        except OSError:
            pass
        close_quiet(s)

    spawn(n, worker)


def sc_broadcast_storm(r):
    """Nombreuses IA diffusant de gros messages en même temps (coût O(n^2))."""
    n = r.cfg["bcasters"]

    def worker():
        try:
            s = ai_connect(r.args.teams[random.randrange(len(r.args.teams))],
                           timeout=4.0)
        except OSError:
            return
        msg = b"Broadcast " + b"Z" * 1024 + b"\n"
        s.settimeout(1.0)
        try:
            for _ in range(30):
                s.sendall(msg)
        except OSError:
            pass
        close_quiet(s)

    spawn(n, worker)


def sc_gui_flood(r):
    """Nombreuses GUI spammant des requêtes, dont des cas pièges (sst 0)."""
    n = r.cfg["guis"]

    def worker():
        try:
            s = gui_connect(timeout=4.0)
        except OSError:
            return
        traps = [b"sst 0\n", b"sgt\n", b"bct 999 999\n", b"bct -1 -1\n",
                 b"ppo -1\n", b"bct\n", b"bct abc def\n", b"mct\n",
                 b"tna\n", b"GARBAGE\n", b"pin 99999\n"]
        s.settimeout(1.0)
        try:
            for _ in range(40):
                s.sendall(random.choice(traps))
        except OSError:
            pass
        close_quiet(s, reset=True)

    spawn(n, worker)


def sc_mixed_load(r):
    """Charge mixte : IA actives + GUI + churn, tout en même temps."""
    stop = time.time() + max(3, r.cfg["soak_s"] // 2)

    def ai_worker():
        try:
            s = ai_connect(r.args.teams[random.randrange(len(r.args.teams))],
                           timeout=4.0)
        except OSError:
            return
        s.settimeout(1.0)
        while time.time() < stop:
            try:
                s.sendall(random.choice(RANDOM_CMDS))
                s.recv(4096)
            except OSError:
                break
        close_quiet(s)

    def gui_worker():
        try:
            s = gui_connect(timeout=4.0)
        except OSError:
            return
        s.settimeout(1.0)
        while time.time() < stop:
            try:
                s.sendall(b"bct %d %d\n" % (random.randrange(r.args.width),
                                            random.randrange(r.args.height)))
                s.recv(8192)
            except OSError:
                break
        close_quiet(s)

    def churn_worker():
        while time.time() < stop:
            try:
                s = new_socket(timeout=1.0)
                close_quiet(s, reset=bool(random.getrandbits(1)))
            except OSError:
                pass

    threads = []
    threads += [threading.Thread(target=ai_worker, daemon=True)
                for _ in range(r.cfg["bcasters"])]
    threads += [threading.Thread(target=gui_worker, daemon=True)
                for _ in range(max(4, r.cfg["guis"] // 4))]
    threads += [threading.Thread(target=churn_worker, daemon=True)
                for _ in range(4)]
    for t in threads:
        t.start()
    for t in threads:
        t.join(max(0.0, stop - time.time()) + 5)


def sc_team_saturation(r):
    """Remplit tous les slots d'une équipe, puis tente d'autres connexions."""
    capacity = r.args.clients
    socks = []
    for _ in range(capacity + 20):       # on dépasse volontairement
        try:
            s = ai_connect(r.args.teams[0], timeout=2.0)
            socks.append(s)
        except OSError:
            break
    time.sleep(0.3)
    for s in socks:
        close_quiet(s)


def sc_pipelined(r):
    """Plusieurs commandes dans un seul paquet (pipelining)."""
    try:
        s = ai_connect(r.args.teams[0], timeout=4.0)
    except OSError:
        return
    pipeline = b"".join(random.choice(RANDOM_CMDS) for _ in range(200))
    try:
        for _ in range(50):
            s.sendall(pipeline)
        s.settimeout(0.5)
        for _ in range(10):
            if not recv_some(s, 65536):
                break
    except OSError:
        pass
    close_quiet(s)


def sc_soak(r):
    """Charge soutenue pendant N secondes avec sondes de vie régulières."""
    duration = r.cfg["soak_s"]
    stop = time.time() + duration
    fail = {"down": False}

    def hammer():
        while time.time() < stop:
            try:
                s = new_socket(timeout=1.0)
                recv_some(s)
                s.sendall(r.args.teams[0].encode() + b"\n")
                for _ in range(20):
                    s.sendall(random.choice(RANDOM_CMDS))
                close_quiet(s, reset=bool(random.getrandbits(1)))
            except OSError:
                pass

    workers = [threading.Thread(target=hammer, daemon=True) for _ in range(12)]
    for w in workers:
        w.start()

    # Sondes de vie pendant la charge.
    while time.time() < stop:
        alive, _ = liveness_check(r.args)
        if not alive:
            fail["down"] = True
            break
        time.sleep(1.0)

    for w in workers:
        w.join(5)
    if fail["down"]:
        raise RuntimeError("serveur non réactif pendant le soak")


# --------------------------------------------------------------------------- #
#  Programme principal
# --------------------------------------------------------------------------- #

def find_default_binary():
    for c in ("./bin/zappy_server", "./zappy_server",
              "./zappy_server/zappy_server"):
        if os.path.exists(c):
            return c
    return "./bin/zappy_server"


def parse_args():
    p = argparse.ArgumentParser(
        description="Tests de robustesse maxLevel pour zappy_server "
                    "(ne modifie pas le serveur).")
    p.add_argument("--binary", default=find_default_binary(),
                   help="chemin du binaire serveur (def: ./bin/zappy_server)")
    p.add_argument("--port", type=int, default=18000 + random.randint(0, 1500))
    p.add_argument("--width", type=int, default=20)
    p.add_argument("--height", type=int, default=20)
    p.add_argument("--teams", nargs="+", default=["T1", "T2", "T3"])
    p.add_argument("--clients", type=int, default=10)
    p.add_argument("--freq", type=int, default=1000,
                   help="freq élevée = actions rapides = plus de stress")
    p.add_argument("--level", default="3",
                   help="1..5 ou 'max' (def: 3)")
    p.add_argument("--keep-going", action="store_true",
                   help="ne pas s'arrêter au premier échec")
    args = p.parse_args()
    args.level = MAX_LEVEL if str(args.level).lower() == "max" else int(args.level)
    args.level = max(1, min(MAX_LEVEL, args.level))
    return args


def raise_fd_limit():
    """Augmente la limite de descripteurs du process de TEST (pas du serveur)."""
    try:
        import resource
        soft, hard = resource.getrlimit(resource.RLIMIT_NOFILE)
        resource.setrlimit(resource.RLIMIT_NOFILE, (hard, hard))
    except Exception:
        pass


def main():
    global PORT
    args = parse_args()
    PORT = args.port
    raise_fd_limit()

    print("=" * 64)
    print(f"Zappy Server — Suite de robustesse maxLevel (niveau {args.level})")
    print("=" * 64)

    if not os.path.exists(args.binary):
        print(f"ERREUR : binaire introuvable : {args.binary}")
        print("         Compile d'abord (make) ou précise --binary.")
        return 1

    r = Runner(args)
    try:
        r.start()
    except Exception as e:
        print(f"ERREUR : impossible de démarrer le serveur : {e}")
        return 1

    scenarios = [
        ("Flood de connexions simultanées",      sc_connection_flood),
        ("Connect/disconnect rapides + RST",      sc_connect_churn),
        ("Slowloris (lignes inachevées)",         sc_slowloris),
        ("Flood de commandes IA (back-pressure)", sc_command_flood),
        ("Ligne géante sans newline",             sc_giant_line),
        ("Fuzzing binaire / NUL / contrôle",      sc_binary_fuzz),
        ("Paquets fragmentés (octet par octet)",  sc_fragmented),
        ("Fork bomb (saturation d'œufs)",         sc_fork_bomb),
        ("Tempête de broadcasts géants",          sc_broadcast_storm),
        ("Flood GUI + cas pièges (sst 0...)",     sc_gui_flood),
        ("Saturation d'équipe + surplus refusé",  sc_team_saturation),
        ("Commandes pipelinées",                  sc_pipelined),
        ("Charge mixte IA + GUI + churn",         sc_mixed_load),
        ("Soak test (charge soutenue)",           sc_soak),
    ]

    print(f"\n{len(scenarios)} scénarios à exécuter "
          f"(map {args.width}x{args.height}, freq {args.freq}).\n")

    code = 0
    try:
        for name, fn in scenarios:
            r.run(name, fn)
    except SystemExit as e:
        code = int(e.code)
        r.stop()
        return code

    # Vérification finale de survie.
    print("\n--- Vérification finale ---")
    alive, err = liveness_check(args)
    crashed, why = r.server_crashed()
    if crashed:
        print(f"  FAIL : le serveur est mort à la fin ({why})")
        r.failed += 1
    elif alive:
        print("  PASS : le serveur est toujours vivant et réactif.")
        r.passed += 1
    else:
        print(f"  FAIL : serveur non réactif ({err})")
        r.failed += 1

    code = r._summary_and_code()
    r.stop()
    return code


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\nInterrompu.")
        sys.exit(130)
