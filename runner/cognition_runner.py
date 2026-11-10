#!/usr/bin/env python3
"""
Ejecutor local de Cognition.

Recibe código desde la página de Cognition, lo compila con gcc y ejecuta las pruebas
del ejercicio en una carpeta temporal. Corre en tu PC (WSL o Linux) y solo escucha en
127.0.0.1, así que nadie fuera de tu computador puede usarlo.

Uso:
    python3 cognition_runner.py --origen https://tu-app.vercel.app
Opciones:
    --puerto 7777          puerto local (por defecto 7777)
    --host 127.0.0.1       usa 0.0.0.0 solo si el navegador de Windows no lo alcanza
    --origen URL           sitio autorizado a enviar código (se puede repetir)

Solo usa la biblioteca estándar de Python 3.8+.
"""
import argparse, json, os, re, shlex, shutil, signal, socket, subprocess, sys, tempfile, threading, time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

VERSION = "1.1"
MAX_BODY = 2 * 1024 * 1024
MAX_OUT = 20000
ORIGENES = set()
LOCK = threading.Lock()          # una ejecución a la vez: los ejercicios usan puertos fijos

AYUDA_PRUEBA = r'''
"""Utilidades para las pruebas en Python (las genera el ejecutor)."""
import socket, time, sys, os
_fallas = 0
def ok(msg): print("OK: " + msg, flush=True)
def falla(msg):
    global _fallas
    _fallas += 1
    print("FALLA: " + msg, flush=True)
def check(cond, msg_ok, msg_falla): ok(msg_ok) if cond else falla(msg_falla)
def conectar(puerto, intentos=40):
    for _ in range(intentos):
        try:
            s = socket.create_connection(("127.0.0.1", puerto), timeout=3); s.settimeout(3); return s
        except OSError: time.sleep(0.1)
    raise SystemExit("FALLA: no se pudo conectar al puerto %d (¿tu servidor hace bind/listen?)" % puerto)
class Linea:
    """Lee respuestas línea a línea aunque TCP las junte o las parta."""
    def __init__(self, s): self.s, self.buf = s, b""
    def leer(self, timeout=3):
        self.s.settimeout(timeout); fin = time.time() + timeout
        while b"\n" not in self.buf:
            if time.time() > fin: return None
            try: d = self.s.recv(4096)
            except socket.timeout: return None
            except OSError: return None
            if not d: return None
            self.buf += d
        l, self.buf = self.buf.split(b"\n", 1)
        return l.decode(errors="replace").rstrip("\r")
    def enviar(self, texto): self.s.sendall(texto.encode())
def leer_archivo(nombre):
    try:
        with open(nombre, encoding="utf-8", errors="replace") as f: return f.read()
    except OSError: return ""
def terminar():
    sys.exit(1 if _fallas else 0)
'''

def recortar(t):
    t = t if isinstance(t, str) else t.decode(errors="replace")
    return t if len(t) <= MAX_OUT else t[:MAX_OUT] + "\n… (salida recortada)"

def nombre_seguro(n):
    return isinstance(n, str) and n and not n.startswith("/") and ".." not in n.split("/") and re.fullmatch(r"[\w./-]+", n)

def matar(p):
    try: os.killpg(p.pid, signal.SIGKILL)
    except (ProcessLookupError, PermissionError): pass
    try: p.wait(timeout=2)
    except Exception: pass

def escuchando(puerto):
    """¿Hay un socket en LISTEN en ese puerto? Lee /proc/net/tcp para NO conectarse
    (conectarse le "robaría" el accept() a un servidor que atiende un solo cliente)."""
    vistos = False
    for f in ("/proc/net/tcp", "/proc/net/tcp6"):
        try:
            with open(f) as fh:
                vistos = True
                for l in fh.readlines()[1:]:
                    c = l.split()
                    if c[3] == "0A" and int(c[1].rsplit(":", 1)[1], 16) == puerto: return True
        except OSError: pass
    if vistos: return False
    try:
        with socket.create_connection(("127.0.0.1", puerto), timeout=0.3): return True
    except OSError: return False

def esperar_puerto(puerto, proceso, segundos=5):
    fin = time.time() + segundos
    while time.time() < fin:
        if proceso.poll() is not None: return False
        if escuchando(puerto): return True
        time.sleep(0.1)
    return False

def comparar(salida, espera):
    """Devuelve lista de (ok, mensaje)."""
    res = []
    if not espera: return res
    if "salida" in espera:
        a = "\n".join(l.rstrip() for l in salida.strip().splitlines())
        b = "\n".join(l.rstrip() for l in espera["salida"].strip().splitlines())
        res.append((a == b, "La salida coincide exactamente con la esperada" if a == b else "La salida no coincide con la esperada"))
    for c in espera.get("contiene", []):
        res.append((c in salida, ("Aparece: " if c in salida else "No aparece: ") + c))
    for c in espera.get("noContiene", []):
        res.append((c not in salida, ("No aparece (bien): " if c not in salida else "No debería aparecer: ") + c))
    return res

def ejecutar_trabajo(job):
    d = tempfile.mkdtemp(prefix="cognition-")
    fondo = {}                      # nombre -> Popen
    out = {"ok": True, "compilacion": [], "pasos": [], "fondo": {}}
    try:
        for f in job.get("archivos", []):
            if not nombre_seguro(f.get("nombre")): raise ValueError("nombre de archivo inválido")
            ruta = os.path.join(d, f["nombre"]); os.makedirs(os.path.dirname(ruta), exist_ok=True)
            with open(ruta, "w", encoding="utf-8") as fh: fh.write(f.get("codigo", ""))
        with open(os.path.join(d, "cognition_prueba.py"), "w") as fh: fh.write(AYUDA_PRUEBA)
        # 1. compilar
        for c in job.get("compilar", []):
            if not nombre_seguro(c.get("out")) or not all(nombre_seguro(s) for s in c.get("src", [])): raise ValueError("compilación inválida")
            cmd = ["gcc", "-Wall", "-Wextra", "-o", c["out"]] + c["src"] + [x for x in c.get("flags", []) if re.fullmatch(r"-[\w=.-]+", x)]
            try:
                r = subprocess.run(cmd, cwd=d, capture_output=True, text=True, timeout=40)
                ok = r.returncode == 0
                out["compilacion"].append({"nombre": c.get("nombre", c["out"]), "ok": ok, "comando": " ".join(cmd), "mensajes": recortar(r.stderr)})
            except subprocess.TimeoutExpired:
                ok = False; out["compilacion"].append({"nombre": c["out"], "ok": False, "mensajes": "gcc tardó demasiado"})
            if not ok:
                out["ok"] = False; return out
        # 2. pasos
        for paso in job.get("pasos", []):
            tipo, nombre = paso.get("tipo"), paso.get("nombre", paso.get("tipo"))
            r = {"nombre": nombre, "tipo": tipo, "ok": True, "checks": [], "salida": ""}
            if tipo == "iniciar":
                log = open(os.path.join(d, paso.get("log", "fondo.out")), "w")
                p = subprocess.Popen(shlex.split(paso["cmd"]), cwd=d, stdout=log, stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL, start_new_session=True)
                fondo[paso.get("id", nombre)] = p
                if paso.get("puerto"):
                    vivo = esperar_puerto(int(paso["puerto"]), p, paso.get("espera", 5))
                    r["ok"] = vivo
                    r["checks"].append((vivo, "Escucha en el puerto %s" % paso["puerto"] if vivo else
                                        ("El programa terminó antes de escuchar" if p.poll() is not None else "No acepta conexiones en el puerto %s" % paso["puerto"])))
                else:
                    time.sleep(paso.get("espera", 0.3))
            elif tipo in ("ejecutar", "python"):
                cmd = [sys.executable, paso["archivo"]] + paso.get("args", []) if tipo == "python" else shlex.split(paso["cmd"])
                p = subprocess.Popen(cmd, cwd=d, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                                     text=True, errors="replace", start_new_session=True,
                                     env=dict(os.environ, PYTHONPATH=d, PYTHONUNBUFFERED="1"))
                try:
                    so, se = p.communicate(paso.get("entrada", ""), timeout=paso.get("timeout", 10))
                    codigo = p.returncode
                except subprocess.TimeoutExpired:
                    matar(p)
                    so, se = p.communicate()
                    codigo = None
                    r["checks"].append((False, "Se acabó el tiempo (%ss): ¿un loop infinito o un recv que nunca termina?" % paso.get("timeout", 10)))
                try: os.killpg(p.pid, signal.SIGKILL)        # hijos que hayan quedado vivos (fork)
                except (ProcessLookupError, PermissionError): pass
                salida = (so or "") + (("\n" + se) if (se or "").strip() else "")
                if paso.get("guardar"):
                    with open(os.path.join(d, paso["guardar"]), "w") as fh: fh.write(salida)
                r["salida"] = recortar(salida)
                for l in salida.splitlines():          # líneas OK:/FALLA: (pruebas en Python o programas de prueba en C)
                    if l.startswith("OK: "): r["checks"].append((True, l[4:]))
                    elif l.startswith("FALLA: "): r["checks"].append((False, l[7:]))
                if tipo == "python":
                    if codigo not in (0, None) and not any(not c[0] for c in r["checks"]):
                        r["checks"].append((False, "La prueba terminó con error:\n" + salida[-600:]))
                else:
                    if codigo is not None and codigo < 0:
                        r["checks"].append((False, "El programa se cayó (señal %d%s)" % (-codigo, ", segmentation fault" if codigo == -11 else "")))
                    r["checks"] += comparar(salida, paso.get("espera"))
                r["ok"] = all(c[0] for c in r["checks"])
            elif tipo == "esperar":
                time.sleep(min(float(paso.get("segundos", 1)), 30))
            elif tipo == "detener":
                for k in (paso.get("ids") or list(fondo)):
                    if k in fondo: matar(fondo.pop(k))
            r["checks"] = [{"ok": a, "msg": b} for a, b in r["checks"]]
            if tipo != "esperar": out["pasos"].append(r)
            if not r["ok"]:
                out["ok"] = False
                if paso.get("critico"): break
        return out
    finally:
        for p in fondo.values(): matar(p)
        for f in os.listdir(d):
            if f.endswith(".out"):
                out["fondo"][f[:-4]] = recortar(open(os.path.join(d, f), errors="replace").read())
        shutil.rmtree(d, ignore_errors=True)

class Manejador(BaseHTTPRequestHandler):
    server_version = "CognitionRunner/" + VERSION
    def log_message(self, fmt, *a): pass
    def origen_ok(self):
        o = self.headers.get("Origin")
        return o in ORIGENES or (o or "").startswith(("http://localhost:", "http://127.0.0.1:"))
    def cabeceras(self):
        o = self.headers.get("Origin")
        if self.origen_ok():
            self.send_header("Access-Control-Allow-Origin", o)
            self.send_header("Vary", "Origin")
            self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Cognition")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Private-Network", "true")
    def responder(self, code, data):
        body = json.dumps(data).encode()
        self.send_response(code); self.cabeceras()
        self.send_header("Content-Type", "application/json"); self.send_header("Content-Length", str(len(body)))
        self.end_headers(); self.wfile.write(body)
    def do_OPTIONS(self):
        self.send_response(204 if self.origen_ok() else 403); self.cabeceras(); self.end_headers()
    def do_GET(self):
        if self.path != "/salud": return self.responder(404, {"error": "no existe"})
        if not self.origen_ok(): return self.responder(403, {"error": "origen no autorizado", "origen": self.headers.get("Origin")})
        gcc = shutil.which("gcc")
        self.responder(200, {"ok": True, "version": VERSION, "gcc": bool(gcc), "ocupado": LOCK.locked()})
    def do_POST(self):
        if self.path != "/ejecutar": return self.responder(404, {"error": "no existe"})
        # Exigir el origen autorizado y una cabecera propia: obliga al navegador a hacer preflight CORS
        if not self.origen_ok() or self.headers.get("X-Cognition") != "1":
            return self.responder(403, {"error": "origen no autorizado"})
        n = int(self.headers.get("Content-Length") or 0)
        if n > MAX_BODY: return self.responder(413, {"error": "demasiado grande"})
        try: job = json.loads(self.rfile.read(n))
        except ValueError: return self.responder(400, {"error": "JSON inválido"})
        if not LOCK.acquire(timeout=90): return self.responder(409, {"error": "ocupado"})
        try:
            t0 = time.time(); res = ejecutar_trabajo(job); res["segundos"] = round(time.time() - t0, 1)
            self.responder(200, res)
        except ValueError as e: self.responder(400, {"error": str(e)})
        except Exception as e: self.responder(500, {"error": repr(e)})
        finally: LOCK.release()

def main():
    ap = argparse.ArgumentParser(description="Ejecutor local de Cognition")
    ap.add_argument("--puerto", type=int, default=7777)
    ap.add_argument("--host", default="127.0.0.1")
    ap.add_argument("--origen", action="append", default=[], help="URL del sitio autorizado, ej. https://cognition.vercel.app")
    a = ap.parse_args()
    for o in a.origen: ORIGENES.add(o.rstrip("/"))
    if not shutil.which("gcc"): print("⚠ No encontré gcc. Instálalo con: sudo apt install -y gcc", file=sys.stderr)
    try:
        srv = ThreadingHTTPServer((a.host, a.puerto), Manejador)
    except OSError:
        print("El puerto %d ya está en uso: probablemente el ejecutor ya está corriendo (se inicia solo con Windows)." % a.puerto)
        print("Si quieres reiniciarlo: pkill -f cognition_runner.py   y vuelve a ejecutar este comando.")
        sys.exit(1)
    print("Ejecutor de Cognition %s escuchando en http://%s:%d" % (VERSION, a.host, a.puerto))
    print("Sitios autorizados: " + (", ".join(sorted(ORIGENES)) or "(solo localhost)"))
    print("Deja esta ventana abierta mientras estudias. Ctrl+C para cerrar.")
    try: srv.serve_forever()
    except KeyboardInterrupt: print("\nHasta luego.")

if __name__ == "__main__":
    main()
