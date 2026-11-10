from cognition_prueba import *
a = Linea(conectar(7002)); b = Linea(conectar(7002))
for carga, bahia in [("AGUA", "Bahia-A"), ("SILICATOS", "Bahia-B"), ("OXIGENO", "Bahia-C"), ("COMBUSTIBLE", "Bahia-D")]:
    a.enviar("DOCK Rocinante %s\n" % carga); r = a.leer()
    check(r == "ASIGNADO " + bahia, "DOCK con %s → ASIGNADO %s" % (carga, bahia), "DOCK %s: esperaba 'ASIGNADO %s', recibí %r" % (carga, bahia, r))
b.enviar("DOCK Donnager AGUA\n"); r = b.leer()
check(r == "ASIGNADO Bahia-A", "Atiende a dos naves a la vez (fork por cliente)", "La segunda nave no recibió respuesta: %r" % r)
a.enviar("CAST_OFF\n"); r = a.leer()
check(r == "BYE", "CAST_OFF → BYE", "CAST_OFF: esperaba BYE, recibí %r" % r)
check(a.leer(timeout=1) is None, "Después de BYE el servidor cierra la conexión", "Después de BYE la conexión sigue respondiendo")
terminar()
