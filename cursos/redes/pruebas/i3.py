"""Simula Laconia y los nodos para probar tu hub; luego prueba tu Laconia y tu nodo por separado."""
import socket, subprocess, threading, time
from cognition_prueba import *
alertas = []
def laconia_falsa():
    srv = socket.socket(); srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1); srv.bind(("127.0.0.1", 9002)); srv.listen(5); srv.settimeout(12)
    try:
        while True:
            c, _ = srv.accept(); l = Linea(c); m = l.leer()
            if m: alertas.append(m); l.enviar("RESULT PROTOCOLO_OSIRIS_ACTIVADO\n")
            c.close()
    except OSError: pass
    srv.close()
threading.Thread(target=laconia_falsa, daemon=True).start(); time.sleep(0.3)
hub = subprocess.Popen(["./i3_hub"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
try:
    nodos = [Linea(conectar(9001)) for _ in range(4)]
    def estado(i, e): nodos[i].enviar("GATE_STATUS Gate-%d %s %d\n" % (i, e, int(time.time())))
    estado(0, "ACTIVA"); estado(1, "ACTIVA"); estado(2, "EXPLORANDO"); time.sleep(0.6)
    check(not alertas, "Con 2 gates activas no hay alerta", "Alertó con solo 2 gates activas: %s" % alertas)
    estado(2, "ACTIVA"); time.sleep(0.8)
    check(len(alertas) == 1 and "NIVEL_3" in alertas[0] and "3" in alertas[0], "Con 3 gates activas el hub alerta a Laconia: %s" % (alertas[:1]), "Con 3 gates activas esperaba 1 alerta 'ALERT NIVEL_3 3 ...', recibí %s" % alertas)
    estado(3, "ACTIVA"); estado(0, "ACTIVA"); time.sleep(0.8)
    check(len(alertas) == 1, "No repite la alerta mientras siga sobre el umbral", "Repitió la alerta (%d alertas): debería alertar solo al cruzar el umbral" % len(alertas))
    nodos[0].s.close(); nodos[3].s.close(); time.sleep(0.8)
    estado(2, "ACTIVA"); time.sleep(0.4)
    nodos += [Linea(conectar(9001)), Linea(conectar(9001))]
    nodos[4].enviar("GATE_STATUS Gate-9 ACTIVA 1\n"); time.sleep(0.8)
    check(len(alertas) == 2, "Al desconectarse nodos su gate pasa a INACTIVA y la alerta vuelve a dispararse al recuperar 3", "Tras desconectar 2 nodos y volver a 3 activas esperaba una nueva alerta (total 2), hubo %d" % len(alertas))
finally:
    import os, signal
    os.killpg(hub.pid, signal.SIGKILL)
time.sleep(0.5)
lac = subprocess.Popen(["./i3_laconia"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
try:
    c = Linea(conectar(9002)); c.enviar("ALERT NIVEL_3 3 gates activas\n"); r = c.leer()
    check(r == "RESULT PROTOCOLO_OSIRIS_ACTIVADO", "Tu Laconia responde RESULT PROTOCOLO_OSIRIS_ACTIVADO", "Tu Laconia respondió %r" % r)
finally:
    import os, signal
    os.killpg(lac.pid, signal.SIGKILL)
srv = socket.socket(); srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1); srv.bind(("127.0.0.1", 9001)); srv.listen(1); srv.settimeout(5)
nodo = subprocess.Popen(["./i3_nodo", "Gate-X"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
try:
    c, _ = srv.accept(); l = Linea(c); m = l.leer(timeout=4)
    partes = (m or "").split()
    check(len(partes) == 4 and partes[0] == "GATE_STATUS" and partes[1] == "Gate-X" and partes[2] in ("INACTIVA", "EXPLORANDO", "ACTIVA", "INESTABLE") and partes[3].isdigit(),
          "Tu nodo envía 'GATE_STATUS <gate> <estado> <timestamp>'", "Tu nodo envió %r" % m)
except socket.timeout:
    falla("Tu nodo no se conectó al hub (puerto 9001)")
finally:
    import os, signal
    os.killpg(nodo.pid, signal.SIGKILL); srv.close()
terminar()
