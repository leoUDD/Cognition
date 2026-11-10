import re
from cognition_prueba import *
s = leer_archivo("salida.txt"); base = leer_archivo("base.out")
vitales = re.findall(r"VITAL O2=([\d.]+) CO2=([\d.]+) TEMP=([\d.]+)", s)
check(len(vitales) >= 6, "El procesador leyó las lecturas del sensor por el pipe (%d)" % len(vitales), "El procesador no muestra las lecturas VITAL (vi %d)" % len(vitales))
esperadas = sum((float(o) < 85) + (float(c) > 3) + (float(t) > 22) for o, c, t in vitales)
recibidas = len(re.findall(r"ALERTA_(O2|CO2|TEMP)", base))
check(recibidas == esperadas, "La base recibió exactamente las %d alertas esperadas" % esperadas, "Según las lecturas correspondían %d alertas, la base registró %d" % (esperadas, recibidas))
terminar()
