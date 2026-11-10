"""Revisa la salida del P1: cada RAD clasificado según su rango y el resumen."""
import re
from cognition_prueba import *
s = leer_archivo("salida.txt")
pares = re.findall(r"RAD\s+([\d.]+)\D*?(NORMAL|ELEVADO|CRITICO)", s)
check(len(pares) == 10, "El puente clasificó 10 lecturas", "Esperaba 10 lecturas clasificadas, encontré %d" % len(pares))
malos = [(v, n) for v, n in pares if n != ("NORMAL" if float(v) < 3 else "ELEVADO" if float(v) <= 6 else "CRITICO")]
check(not malos, "Todas las lecturas están en el nivel correcto", "Clasificación incorrecta: %s" % malos[:3])
m = re.search(r"NORMAL=(\d+)\D+ELEVADO=(\d+)\D+CRITICO=(\d+)", s)
if m:
    cuenta = [sum(1 for _, n in pares if n == k) for k in ("NORMAL", "ELEVADO", "CRITICO")]
    check([int(x) for x in m.groups()] == cuenta, "El resumen coincide con las lecturas", "El resumen %s no coincide con lo contado %s" % (m.groups(), cuenta))
else:
    falla("No encontré el resumen 'NORMAL=.. ELEVADO=.. CRITICO=..'")
terminar()
