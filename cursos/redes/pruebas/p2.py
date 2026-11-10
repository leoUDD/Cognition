import re
from cognition_prueba import *
s = leer_archivo("salida.txt")
ok_ = [float(x) for x in re.findall(r"operacional:\s*(-?[\d.]+)", s)]
desc = [float(x) for x in re.findall(r"Descartado:\s*(-?[\d.]+)", s)]
check(len(ok_) + len(desc) == 15, "Se procesaron las 15 lecturas (pasadas + descartadas)", "Esperaba 15 lecturas en total, vi %d operacionales y %d descartadas" % (len(ok_), len(desc)))
check(all(20 <= t <= 200 for t in ok_), "El puente solo recibe temperaturas entre 20 y 200", "Llegaron al puente valores fuera de rango: %s" % [t for t in ok_ if not 20 <= t <= 200][:3])
check(all(not 20 <= t <= 200 for t in desc), "El filtro solo descarta valores fuera de rango", "Se descartaron valores válidos: %s" % [t for t in desc if 20 <= t <= 200][:3])
terminar()
