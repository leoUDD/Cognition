from cognition_prueba import *
c = Linea(conectar(8001))
for nave, est in [("Rocinante", "EN_VUELO"), ("Canterbury", "DESTRUIDA"), ("Nauvoo", "CONSTRUCCION"), ("Anubis", "DESCONOCIDA")]:
    c.enviar("CALL get_estado %s\n" % nave); r = c.leer()
    check(r == "RESULT " + est, "get_estado(%s) → RESULT %s" % (nave, est), "get_estado(%s): esperaba 'RESULT %s', recibí %r" % (nave, est, r))
terminar()
