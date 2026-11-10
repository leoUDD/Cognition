/* Plan de pruebas por ejercicio (lo ejecuta el ejecutor local en WSL).
   compilar: [{ src: [...], out, flags }]  — src: tus archivos por nombre ("reloj.c"),
             los de la solución como "ref/<nombre>" y los de cursos/redes/pruebas como "prueba/<nombre>".
   pasos:   iniciar (programa en segundo plano, opcional puerto) | ejecutar (con espera: salida/contiene/noContiene)
            | python (sonda en pruebas/*.py que imprime OK:/FALLA:) | esperar | detener.
   Los programas en C de prueba también pueden imprimir líneas "OK: ..." / "FALLA: ...". */
const salidaDe = id => ejercicios.find(e => e.id === id).out;
const exacta = (id, bin) => ({ compilar: [{ src: [bin + '.c'], out: bin }], pasos: [{ tipo: 'ejecutar', nombre: 'Tu programa produce la salida esperada', cmd: './' + bin, espera: { salida: salidaDe(id) } }] });
const conPrueba = (archivo, prueba) => ({ compilar: [{ src: ['prueba/' + prueba + '.c'], out: 'pruebas_bin' }], pasos: [{ tipo: 'ejecutar', nombre: 'Pruebas de tus funciones', cmd: './pruebas_bin' }], extra: [archivo] });

Object.assign(pruebas, {
  L06: (() => { const p = exacta('L06', 'reloj'); p.compilar.push({ src: ['prueba/l06.c'], out: 'pruebas_bin' });
    p.pasos.push({ tipo: 'ejecutar', nombre: 'Casos extra de tus funciones', cmd: './pruebas_bin' }); return p; })(),
  L07: exacta('L07', 'order'),
  L08: exacta('L08', 'replay'),
  L09: conPrueba('server_lamport.c', 'l09'),
  L10: exacta('L10', 'vclock'),
  L11: { compilar: [{ src: ['mutex_lamport.c'], out: 'mutex_lamport' }], pasos: [
    { tipo: 'ejecutar', nombre: 'Ejecutar los 3 procesos', cmd: './mutex_lamport', timeout: 25 },
    { tipo: 'python', nombre: 'Revisar log.txt', archivo: 'prueba/l11.py' }] },
  L12: { compilar: [{ src: ['concentrador.c'], out: 'concentrador' }, { src: ['sonda.c'], out: 'sonda' }], pasos: [
    { tipo: 'iniciar', nombre: 'Tu concentrador', cmd: './concentrador', puerto: 9090, log: 'concentrador.out', critico: true },
    { tipo: 'python', nombre: '3 sondas tuyas y orden de registro.log', archivo: 'prueba/l12.py', timeout: 30 }] },
  L13: { compilar: [{ src: ['snapshot.c'], out: 'snapshot' }], pasos: [
    { tipo: 'ejecutar', nombre: 'El snapshot conserva la suma', cmd: './snapshot', timeout: 20, espera: { contiene: ['TOTAL del snapshot = 300'] } }] },
  C01A: { compilar: [{ src: ['servidor.c'], out: 'servidor' }], pasos: [
    { tipo: 'iniciar', nombre: 'Tu servidor', cmd: './servidor', puerto: 7070, log: 'servidor.out', critico: true },
    { tipo: 'python', nombre: 'Protocolo SELENE contra tu servidor', archivo: 'prueba/c01a.py', timeout: 20 }] },
  C01B: { compilar: [{ src: ['ref/C01A/servidor.c'], out: 'servidor_ref' }, { src: ['sonda.c'], out: 'sonda' }], pasos: [
    { tipo: 'iniciar', nombre: 'Servidor de referencia', cmd: './servidor_ref', puerto: 7070, log: 'servidor.out', critico: true },
    { tipo: 'ejecutar', nombre: 'Tu sonda ARES-2 (8 lecturas)', cmd: './sonda ARES-2 127.0.0.1 3.0', timeout: 15, espera: { contiene: ['HELLO ARES-2', 'ACK ARES-2 1', 'ACK ARES-2 8', 'ALERT ARES-2'], noContiene: ['NACK'] } },
    { tipo: 'ejecutar', nombre: 'Tu sonda con un ID inválido', cmd: './sonda ARES-9 127.0.0.1 1.0', timeout: 5, espera: { contiene: ['REJECT ARES-9'], noContiene: ['ACK'] } }] },
  P1: { compilar: [{ src: ['p1_canterbury.c'], out: 'p1' }], pasos: [
    { tipo: 'ejecutar', nombre: 'Ejecutar (10 lecturas, ~10 s)', cmd: './p1', timeout: 20, guardar: 'salida.txt' },
    { tipo: 'python', nombre: 'Clasificación y resumen', archivo: 'prueba/p1.py' }] },
  P2: { compilar: [{ src: ['p2_rocinante.c'], out: 'p2' }], pasos: [
    { tipo: 'ejecutar', nombre: 'Ejecutar el pipeline', cmd: './p2', timeout: 10, guardar: 'salida.txt' },
    { tipo: 'python', nombre: 'Filtro y puente', archivo: 'prueba/p2.py' }] },
  P3: { compilar: [{ src: ['p3_tycho.c'], out: 'p3' }], pasos: [
    { tipo: 'ejecutar', nombre: 'Ejecutar los 5 módulos', cmd: './p3', timeout: 15, guardar: 'salida.txt' },
    { tipo: 'python', nombre: 'Mensajes recibidos con select()', archivo: 'prueba/p3.py' }] },
  S1: { compilar: [{ src: ['s1_relay.c'], out: 's1_relay' }, { src: ['s1_cliente.c'], out: 's1_cliente' }], pasos: [
    { tipo: 'iniciar', nombre: 'Tu relay', cmd: './s1_relay', puerto: 7001, log: 'relay.out', critico: true },
    { tipo: 'ejecutar', nombre: 'Tu cliente envía 5 mensajes', cmd: './s1_cliente', timeout: 8, espera: { contiene: ['ACK MSG nave_OPA_1 dato_1', 'ACK MSG nave_OPA_1 dato_5'] } }] },
  S2: { compilar: [{ src: ['s2_ceres.c'], out: 's2' }], pasos: [
    { tipo: 'iniciar', nombre: 'Tu servidor Ceres', cmd: './s2', puerto: 7002, log: 'ceres.out', critico: true },
    { tipo: 'python', nombre: 'Protocolo DOCK / CAST_OFF', archivo: 'prueba/s2.py' }] },
  S3: { compilar: [{ src: ['s3_mcrn.c'], out: 's3' }], pasos: [
    { tipo: 'iniciar', nombre: 'Tu servidor MCRN', cmd: './s3', puerto: 7003, log: 'mcrn.out', critico: true },
    { tipo: 'python', nombre: 'Mensajes partidos, pegados y los 4 comandos', archivo: 'prueba/s3.py' }] },
  R1: { compilar: [{ src: ['r1_servidor.c'], out: 'r1s' }, { src: ['r1_cliente.c'], out: 'r1c' }], pasos: [
    { tipo: 'iniciar', nombre: 'Tu servidor RPC', cmd: './r1s', puerto: 8001, log: 'r1.out', critico: true },
    { tipo: 'python', nombre: 'Llamadas CALL get_estado', archivo: 'prueba/r1.py' },
    { tipo: 'ejecutar', nombre: 'Tu cliente con el stub', cmd: './r1c', timeout: 5, espera: { contiene: ['EN_VUELO', 'DESTRUIDA', 'EN_PUERTO', 'CONSTRUCCION', 'DESCONOCIDA'] } }] },
  R2: { compilar: [{ src: ['r2_nauvoo.c'], out: 'r2', flags: ['-lm'] }], pasos: [
    { tipo: 'iniciar', nombre: 'Tu servidor Nauvoo', cmd: './r2', puerto: 8002, log: 'r2.out', critico: true },
    { tipo: 'python', nombre: 'Las 4 funciones de la dispatch table', archivo: 'prueba/r2.py' }] },
  R3: { compilar: [{ src: ['r3_ilus.c'], out: 'r3' }], pasos: [
    { tipo: 'iniciar', nombre: 'Tu servidor Ilus', cmd: './r3', puerto: 8003, log: 'r3.out', critico: true },
    { tipo: 'python', nombre: '3 clientes concurrentes con flock()', archivo: 'prueba/r3.py', timeout: 20 }] },
  I1: { compilar: [{ src: ['i1_base.c'], out: 'base' }, { src: ['i1_procesador.c'], out: 'procesador' }], pasos: [
    { tipo: 'iniciar', nombre: 'Tu base Ceres', cmd: './base', puerto: 6001, log: 'base.out', critico: true },
    { tipo: 'ejecutar', nombre: 'Tu procesador con su sensor (~16 s)', cmd: './procesador', timeout: 30, guardar: 'salida.txt' },
    { tipo: 'esperar', segundos: 0.5 },
    { tipo: 'python', nombre: 'Alertas esperadas vs recibidas', archivo: 'prueba/i1.py' }] },
  I2: { compilar: [{ src: ['i2_cuartel.c'], out: 'cuartel' }, { src: ['i2_nave.c'], out: 'i2_nave' }], pasos: [
    { tipo: 'iniciar', nombre: 'Tu cuartel', cmd: './cuartel', puerto: 8010, log: 'cuartel.out', critico: true },
    { tipo: 'python', nombre: 'RPC del cuartel y 2 naves a la vez', archivo: 'prueba/i2.py', timeout: 30 }] },
  I3: { compilar: [{ src: ['i3_laconia.c'], out: 'i3_laconia' }, { src: ['i3_hub.c'], out: 'i3_hub' }, { src: ['i3_nodo.c'], out: 'i3_nodo' }], pasos: [
    { tipo: 'python', nombre: 'Hub (con nodos y Laconia simulados), tu Laconia y tu nodo', archivo: 'prueba/i3.py', timeout: 40 }] },
  X1: exacta('X1', 'quorum'),
  X2: conPrueba('kv_quorum.c', 'x2'),
  X3: conPrueba('two_phase_commit.c', 'x3'),
  X4: conPrueba('heartbeats.c', 'x4'),
  X5: conPrueba('raft_voto.c', 'x5'),
  X6: conPrueba('raft_append.c', 'x6'),
  X7: conPrueba('raft_eleccion.c', 'x7')
});
