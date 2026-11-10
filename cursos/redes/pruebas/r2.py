from cognition_prueba import *
c = Linea(conectar(8002))
def call(x): c.enviar("CALL %s\n" % x); return c.leer() or ""
r = call("calcular_quema 4900 1000")
try: v = float(r.split()[1])
except Exception: v = None
check(v is not None and abs(v - 648.72) < 0.5, "calcular_quema(4900, 1000) ≈ 648.72", "calcular_quema(4900, 1000): esperaba ~648.72, recibí %r" % r)
r = call("distancia_AU Tierra Jupiter")
check(r.replace(" ", "") in ("RESULT4.20", "RESULT4.2"), "distancia_AU(Tierra, Jupiter) = 4.20", "distancia_AU: esperaba 4.20, recibí %r" % r)
r = call("ruta_optima Tierra Jupiter")
check(r.startswith("RESULT Tierra") and r.rstrip().endswith("Jupiter"), "ruta_optima empieza en Tierra y termina en Jupiter", "ruta_optima: recibí %r" % r)
r = call("estado_reactor Rocinante")
check(r in ("RESULT OPTIMO", "RESULT DEGRADADO", "RESULT CRITICO"), "estado_reactor → uno de los 3 estados", "estado_reactor: recibí %r" % r)
r = call("volar Marte")
check("ERROR" in r.upper(), "Una función que no existe responde con error", "Función inexistente: esperaba un error, recibí %r" % r)
terminar()
