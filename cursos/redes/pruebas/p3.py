import re
from cognition_prueba import *
s = leer_archivo("salida.txt")
msgs = re.findall(r"MODULO\s+(\w+)\s+STATUS\s+(OK|WARN|CRIT)", s)
check(len(msgs) == 25, "El padre recibió los 25 mensajes (5 módulos × 5)", "Esperaba 25 mensajes, recibí %d" % len(msgs))
for m in ["REACTOR", "OXIGENO", "AGUA", "GRAVITON", "HANGAR"]:
    n = sum(1 for x, _ in msgs if x == m)
    check(n == 5, "%s: 5 mensajes" % m, "%s: esperaba 5 mensajes, recibí %d" % (m, n))
terminar()
