import re
from cognition_prueba import *
lineas = leer_archivo("log.txt").splitlines()
check(len(lineas) == 6, "log.txt tiene 6 líneas (3 procesos × 2 ciclos)", "Esperaba 6 líneas en log.txt, hay %d" % len(lineas))
bien = [l for l in lineas if re.fullmatch(r"P[0-2] ts=\d+ escribe", l)]
check(len(bien) == len(lineas) and lineas, "Ninguna línea quedó mezclada: la exclusión mutua funciona", "Hay líneas mezcladas o con otro formato: %s" % [l for l in lineas if l not in bien][:3])
for p in range(3):
    n = sum(1 for l in bien if l.startswith("P%d " % p))
    check(n == 2, "P%d entró 2 veces" % p, "P%d entró %d veces (esperaba 2)" % (p, n))
terminar()
