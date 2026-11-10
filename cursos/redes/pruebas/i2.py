import subprocess
from cognition_prueba import *
c = Linea(conectar(8010))
c.enviar("CALL solicitar_reabastecimiento Donnager 12.0\n"); r = c.leer() or ""
check(r.startswith("RESULT REBASTECER_EN "), "El cuartel responde solicitar_reabastecimiento", "solicitar_reabastecimiento: recibí %r" % r)
c.enviar("CALL solicitar_ordenes Donnager 30.0\n"); r = c.leer() or ""
check(r in ("RESULT ATACAR", "RESULT RETIRARSE"), "El cuartel responde solicitar_ordenes con ATACAR o RETIRARSE", "solicitar_ordenes: recibí %r" % r)
naves = [subprocess.Popen(["./i2_nave", n], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True) for n in ("Donnager", "Scirocco")]
salidas = []
for p in naves:
    try: salidas.append(p.communicate(timeout=20)[0])
    except subprocess.TimeoutExpired: p.kill(); salidas.append(None)
check(all(x is not None for x in salidas), "Dos naves corren a la vez y terminan", "Alguna nave no terminó en 20 s")
check(any("REBASTECER_EN" in (x or "") or "ATACAR" in (x or "") or "RETIRARSE" in (x or "") for x in salidas), "Las naves recibieron respuestas RPC del cuartel", "Ninguna nave mostró una respuesta del cuartel")
terminar()
