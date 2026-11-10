"""Prueba del Control 01, parte A: un cliente que habla el protocolo SELENE con tu servidor."""
from cognition_prueba import *
def cs(v): return "%02X" % (sum(v.encode()) % 256)
def nivel(l):
    l = l or ""
    return 2 if ("CRIT" in l.upper() or " 2 " in l + " ") else 1 if ("ALERTA" in l.upper() or " 1 " in l + " ") else 0
def telem(c, id_, seq, v, malo=False):
    c.enviar("TELEM %s %d %s %s\n" % (id_, seq, v, "ZZ" if malo else cs(v)))
    a = c.leer(); b = c.leer(timeout=0.6)
    return a, b
c = Linea(conectar(7070)); c.enviar("CONNECT ARES-9\n"); r = c.leer()
check(r == "REJECT ARES-9", "CONNECT ARES-9 → REJECT ARES-9", "CONNECT ARES-9: esperaba 'REJECT ARES-9', recibí %r" % r)
a = Linea(conectar(7070)); a.enviar("CONNECT ARES-2\n"); r = a.leer()
check(r == "HELLO ARES-2", "CONNECT ARES-2 → HELLO ARES-2", "CONNECT ARES-2: esperaba 'HELLO ARES-2', recibí %r" % r)
b = Linea(conectar(7070)); b.enviar("CONNECT ARES-4\n"); r = b.leer()
check(r == "HELLO ARES-4", "Atiende una segunda sonda mientras la primera sigue conectada (concurrencia con fork)", "Con una sonda conectada no atiende a otra: ¿hiciste fork() por cliente? Recibí %r" % r)
r1, r2 = telem(a, "ARES-2", 1, "3.00")
check(r1 == "ACK ARES-2 1" and not r2, "ARES-2 valor 3.00 → ACK sin alerta", "ARES-2 3.00: esperaba solo 'ACK ARES-2 1', recibí %r / %r" % (r1, r2))
r1, r2 = telem(a, "ARES-2", 2, "4.50")
check(r1 == "ACK ARES-2 2" and nivel(r2) == 1 and (r2 or "").startswith("ALERT ARES-2"), "ARES-2 valor 4.50 → ACK + ALERT nivel ALERTA", "ARES-2 4.50 (> 3.5): esperaba ACK y ALERT de nivel ALERTA, recibí %r / %r" % (r1, r2))
r1, r2 = telem(a, "ARES-2", 3, "6.50")
check(r1 == "ACK ARES-2 3" and nivel(r2) == 2, "ARES-2 valor 6.50 → ALERT nivel CRITICO (revisa crítico antes que alerta)", "ARES-2 6.50 (> 6.0): esperaba ALERT CRITICO, recibí %r / %r" % (r1, r2))
r1, r2 = telem(a, "ARES-2", 4, "1.00", malo=True)
check(r1 == "NACK ARES-2 4", "Checksum incorrecto → NACK ARES-2 4", "Con checksum incorrecto esperaba 'NACK ARES-2 4', recibí %r" % r1)
r1, r2 = telem(b, "ARES-4", 1, "50.00")
check(r1 == "ACK ARES-4 1" and not r2, "ARES-4 (menor que) 50.00 → sin alerta", "ARES-4 50.00: no debería alertar, recibí %r / %r" % (r1, r2))
r1, r2 = telem(b, "ARES-4", 2, "20.00")
check(nivel(r2) == 1, "ARES-4 20.00 (< 30) → ALERTA", "ARES-4 20.00: esperaba ALERTA (umbral 'menor que'), recibí %r" % r2)
r1, r2 = telem(b, "ARES-4", 3, "10.00")
check(nivel(r2) == 2, "ARES-4 10.00 (< 15) → CRITICO", "ARES-4 10.00: esperaba CRITICO, recibí %r" % r2)
terminar()
