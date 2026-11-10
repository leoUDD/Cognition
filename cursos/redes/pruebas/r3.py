"""3 clientes registran muestras a la vez: si el lock no es atómico se pierden actualizaciones."""
import threading, re
from cognition_prueba import *
def registrar(base):
    c = Linea(conectar(8003))
    for i in range(8):
        c.enviar("CALL registrar_muestra %d %.1f\n" % (base + i, i * 1.5)); c.leer()
hs = [threading.Thread(target=registrar, args=(b,)) for b in (100, 200, 300)]
for h in hs: h.start()
for h in hs: h.join()
c = Linea(conectar(8003))
c.enviar("CALL leer_estado\n"); r = c.leer() or ""
nums = [int(x) for x in re.findall(r"\d+", r)]
check(24 in nums, "24 muestras registradas por 3 clientes concurrentes: no se perdió ninguna", "Esperaba 24 muestras tras 3 clientes concurrentes, leer_estado dice %r. ¿Lees y escribes bajo el mismo LOCK_EX?" % r)
c.enviar("CALL obtener_fase\n"); f0 = c.leer()
c.enviar("CALL incrementar_fase\n"); c.leer()
c.enviar("CALL obtener_fase\n"); f1 = c.leer()
try: ok_ = int(f1.split()[-1]) == int(f0.split()[-1]) + 1
except Exception: ok_ = False
check(ok_, "incrementar_fase sube la fase en 1", "incrementar_fase: antes %r, después %r" % (f0, f1))
terminar()
