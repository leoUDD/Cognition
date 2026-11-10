"""Lanza 3 sondas tuyas contra tu concentrador y revisa el orden de registro.log."""
import re, subprocess, time
from cognition_prueba import *
ps = [subprocess.Popen(["./sonda", "ARES-%d" % i, "127.0.0.1", str(v)] + (["ARES-1"] if i == 2 else []), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
      for i, v in [(1, 10), (2, 3), (3, 700)]]
for p in ps: p.wait(timeout=15)
time.sleep(4.5)
log = leer_archivo("registro.log").splitlines()
eventos = []
for l in log:
    m = re.search(r"(TELEM\s+ARES-(\d+)\s+\d+\s+[-\d.]+\s+(\d+)|RELAY\s+ARES-(\d+)\s+\S+\s+[-\d.]+\s+(\d+))", l)
    if m: eventos.append((int(m.group(3) or m.group(5)), int(m.group(2) or m.group(4))))
check(len(eventos) >= 15, "registro.log tiene los eventos de las 3 sondas (%d)" % len(eventos), "Esperaba al menos 15 eventos en registro.log, hay %d. ¿El padre recibe lo que leen los hijos?" % len(eventos))
check(eventos == sorted(eventos), "Los eventos están ordenados por (ts, pid)", "registro.log no está ordenado por (ts, pid): %s" % eventos[:8])
terminar()
