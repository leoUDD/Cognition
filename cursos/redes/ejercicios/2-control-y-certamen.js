/* Control 01 y Guía del Certamen 01 */
const SELENE = `<p>La Base Lunar SELENE recibe telemetría de 4 sondas por TCP (puerto 7070). Texto plano y cada mensaje termina en <code>\\n</code>. <code>&lt;cs&gt;</code> lo calcula <code>checksum()</code> (ya implementada).</p>
<table class="t"><tr><th>Dirección</th><th>Mensaje</th></tr><tr><td>Sonda → Servidor</td><td><code>CONNECT &lt;id&gt;</code></td></tr><tr><td>Servidor → Sonda</td><td><code>HELLO &lt;id&gt;</code> | <code>REJECT &lt;id&gt;</code></td></tr><tr><td>Sonda → Servidor</td><td><code>TELEM &lt;id&gt; &lt;seq&gt; &lt;valor&gt; &lt;cs&gt;</code></td></tr><tr><td>Servidor → Sonda</td><td><code>ACK &lt;id&gt; &lt;seq&gt;</code> | <code>NACK &lt;id&gt; &lt;seq&gt;</code> | <code>ALERT &lt;id&gt; &lt;nivel&gt; &lt;detalle&gt;</code></td></tr></table>
<table class="t"><tr><th>Sonda</th><th>Métrica</th><th>ALERTA</th><th>CRÍTICO</th></tr><tr><td>ARES-1</td><td>Temperatura °C</td><td>&gt; −40</td><td>&gt; −30</td></tr><tr><td>ARES-2</td><td>Radiación mSv/h</td><td>&gt; 3.5</td><td>&gt; 6.0</td></tr><tr><td>ARES-3</td><td>Viento solar km/s</td><td>&gt; 750</td><td>&gt; 900</td></tr><tr><td>ARES-4</td><td>Energía panel %</td><td>&lt; 30</td><td>&lt; 15</td></tr></table>`;
ejercicios.push(
{
 id:'C01A', group:'control', n:'Parte A', topic:'sockets', lvl:2, min:25, pts:55, title:'Control 01 · Servidor SELENE',
 statement: SELENE + `<p>Completa <code>handle_sonda()</code> y <code>main()</code>. <b>A.1</b> (15 pts) conexión inicial; <b>A.2</b> (25 pts) loop de telemetría con checksum, respuesta, evaluación de umbrales y alertas; <b>A.3</b> (15 pts) inicialización y concurrencia.</p>`,
 files:['C01/servidor.c'],
 qs:[{q:'¿Por qué la solución manda ACK y ALERT en un solo send()?',a:'TCP es un <b>flujo de bytes</b>, no respeta los límites de los mensajes. Dos send() seguidos pueden llegar juntos en un recv() o separados, y el cliente (que hace un recv por lectura) podría imprimir el ALERT con la lectura siguiente. Juntarlos en un buffer hace la respuesta predecible.'},
     {q:'¿Por qué se valida el checksum sobre el valor como string y no sobre el float?',a:'checksum() suma los bytes del <b>texto</b> que envió la sonda ("3.60"). Si lo conviertes a float y lo vuelves a imprimir, el texto puede cambiar ("3.6", "3.600000") y el checksum no coincide.'}],
 hints:['A.1: recv, null-terminar, sscanf("CONNECT %15s") y buscar el id en umbrales[].','A.2: lee el valor con %s (no %f) para poder calcular el checksum sobre el mismo texto.','A.3 es el patrón de siempre: socket → bind → listen → loop accept → fork.'],
 think:['A.1: si recv ≤ 0 retornar. Buscar el id en umbrales; si no está → REJECT y return; si está → HELLO y guardar el puntero al Umbral.','A.2: while recv > 0: sscanf "TELEM %s %d %s %s". checksum(valor) ≠ cs → NACK. Si no, nivel = evaluar(u, atof(valor)), ACK y, si nivel > 0, ALERT.','evaluar(): si mayor, comparar primero con crítico y luego con alerta (el orden importa); si menor, igual pero con <.','A.3: SO_REUSEADDR, signal(SIGCHLD, SIG_IGN) contra zombis; el hijo cierra srv y el padre cierra cli.'],
 errors:['Comparar primero con el umbral de alerta: un valor crítico quedaría como ALERTA.','No hacer buf[n] = \'\\0\' antes de sscanf.','No cerrar srv en el hijo ni cli en el padre.','Definir evaluar() dentro de handle_sonda() (C estándar no permite funciones anidadas).'],
 rubric:[{pts:5,t:'A.1: recv + null-terminación + parseo de CONNECT'},{pts:5,t:'A.1: busca el ID en umbrales[]'},{pts:5,t:'A.1: responde HELLO o REJECT con el formato exacto'},{pts:5,t:'A.2: loop recv con condición de término'},{pts:6,t:'A.2: parseo TELEM y validación del checksum (NACK)'},{pts:7,t:'A.2: evaluación de umbrales (mayor/menor, crítico antes que alerta)'},{pts:7,t:'A.2: ACK y ALERT con formato correcto'},{pts:6,t:'A.3: socket, bind, listen con htons/INADDR_ANY'},{pts:6,t:'A.3: accept + fork, cierres correctos'},{pts:3,t:'A.3: evita zombis'}]
},
{
 id:'C01B', group:'control', n:'Parte B', topic:'sockets', lvl:2, min:20, pts:45, title:'Control 01 · Cliente sonda',
 statement: `<p>El cliente simula una sonda. Recibe su ID, la IP del servidor y el valor inicial por línea de comandos (<code>./sonda ARES-2 127.0.0.1 3.0</code>).</p><p><b>B.1</b> (15 pts) crear el socket TCP y conectar. <b>B.2</b> (12 pts) enviar CONNECT y manejar HELLO o REJECT. <b>B.3</b> (18 pts) 8 lecturas con seq 1–8, el valor varía en cada iteración; recibir e imprimir la respuesta; <code>sleep(1)</code> entre envíos.</p>`,
 files:['C01/sonda.c'],
 out:'Conectado: HELLO ARES-2\nACK ARES-2 1\nALERT ARES-2 ALERTA valor=3.60\n...\nACK ARES-2 6\nALERT ARES-2 CRITICO valor=6.60',
 hints:['B.1: sockaddr_in con AF_INET, htons(PORT) e inet_pton para la IP en texto.','B.2: compara el inicio de la respuesta con strncmp(buf, "HELLO", 5).','B.3: primero convierte el valor a texto, luego calcula el checksum sobre ESE texto.'],
 think:['B.1: socket(AF_INET, SOCK_STREAM, 0); memset; sin_family, sin_port = htons(PORT); inet_pton(AF_INET, ip, &sin_addr); connect.','B.2: snprintf "CONNECT %s\\n", send, recv, buf[n] = 0, si no empieza con HELLO → cerrar y salir.','B.3: for seq 1..8: valor += algo; snprintf(valstr, "%.2f"); checksum(valstr, cs); snprintf "TELEM %s %d %s %s\\n"; send; recv + imprimir; sleep(1).'],
 errors:['Olvidar htons en el puerto.','Calcular el checksum sobre un string distinto al que se envía.','Olvidar el \\n final del mensaje.'],
 rubric:[{pts:5,t:'B.1: socket()'},{pts:5,t:'B.1: sockaddr_in con htons e inet_pton'},{pts:5,t:'B.1: connect con manejo de error'},{pts:5,t:'B.2: envía CONNECT con formato exacto'},{pts:7,t:'B.2: distingue HELLO de REJECT y sale si es rechazo'},{pts:6,t:'B.3: loop seq 1..8 con valor variable'},{pts:6,t:'B.3: TELEM con checksum correcto'},{pts:6,t:'B.3: recv + imprimir + sleep(1) + close'}]
},
{
 id:'P1', group:'cert', n:'P1 ⭐', topic:'pipes', lvl:1, min:12, title:'Sensor de radiación — Canterbury',
 statement:`<p>Comunicación padre-hijo con un pipe. El hijo (sensor) genera 10 lecturas aleatorias entre 0.0 y 10.0, una por segundo, y las envía como <code>RAD &lt;valor&gt;\\n</code>. El padre imprime el nivel: NORMAL (&lt;3.0), ELEVADO (3.0–6.0), CRITICO (&gt;6.0). Al final espera al hijo con <code>wait()</code> e imprime el resumen.</p>`,
 files:['P1/p1_canterbury.c'],
 out:'[SENSOR] Enviando RAD 2.34\n[PUENTE] RAD 2.34 → NORMAL\n...\n[PUENTE] Resumen: NORMAL=3 ELEVADO=3 CRITICO=4',
 hints:['pipe() ANTES de fork(), para que ambos procesos hereden los descriptores.','fdopen(fd, "r") convierte el descriptor en FILE* y permite usar fgets línea a línea.','El padre sabe que terminó cuando fgets retorna NULL: eso ocurre cuando el hijo cierra fd[1].'],
 think:['pipe(fd), fork().','Hijo: close(fd[0]); 10 veces snprintf + write; close(fd[1]); exit.','Padre: close(fd[1]) (si no lo cierra, nunca llega EOF); fdopen + fgets + sscanf; contadores; wait(NULL).'],
 errors:['Que el padre no cierre fd[1]: fgets nunca retorna NULL y el programa se cuelga.','Leer con read() suponiendo que cada read trae exactamente una línea.'],
 rubric:[{pts:2,t:'pipe() antes de fork()'},{pts:2,t:'Cada proceso cierra el extremo que no usa'},{pts:2,t:'Hijo: 10 lecturas con formato y sleep(1)'},{pts:2,t:'Padre: lee líneas y clasifica bien los rangos'},{pts:2,t:'wait() y resumen'}]
},
{
 id:'P2', group:'cert', n:'P2 ⭐⭐', topic:'pipes', lvl:2, min:15, title:'Pipeline de telemetría — Rocinante',
 statement:`<p>Pipeline de 3 procesos con 2 pipes. A (sensor) escribe 15 <code>TEMP &lt;v&gt;</code> entre −50 y 300 °C en pipe1. B (filtro) deja pasar solo 20–200 °C como <code>TEMP_OK &lt;v&gt;</code> a pipe2 e imprime los descartados. C (puente) imprime "Temperatura operacional". Cada proceso cierra lo que no usa inmediatamente después del fork.</p>`,
 files:['P2/p2_rocinante.c'],
 hints:['Dibuja los 4 extremos (pipe1[0], pipe1[1], pipe2[0], pipe2[1]) y marca quién usa cada uno.','El padre también tiene copias de los 4 extremos: debe cerrarlos todos o C nunca verá EOF.'],
 think:['A usa solo pipe1[1]; B usa pipe1[0] y pipe2[1]; C usa solo pipe2[0].','B debe cerrar pipe2[1] al terminar, para que C reciba EOF.','El padre crea ambos pipes, hace los 3 fork, cierra los 4 extremos y espera 3 veces.'],
 errors:['El padre no cierra pipe2[1]: el puente se queda esperando para siempre.','Crear pipe2 después del primer fork: A y B no comparten el mismo pipe.'],
 rubric:[{pts:2,t:'Crea los 2 pipes antes de los fork'},{pts:3,t:'Cierres correctos en A, B, C y el padre'},{pts:2,t:'A genera 15 lecturas en el rango'},{pts:2,t:'B filtra 20–200 y reenvía con TEMP_OK'},{pts:1,t:'C imprime y el padre espera a los 3'}]
},
{
 id:'P3', group:'cert', n:'P3 ⭐⭐⭐', topic:'pipes', lvl:3, min:20, title:'Sistema de alertas — Tycho Station',
 statement:`<p>N=5 hijos (REACTOR, OXIGENO, AGUA, GRAVITON, HANGAR), cada uno con su pipe al padre. Cada hijo envía 5 <code>MODULO &lt;nombre&gt; STATUS &lt;OK|WARN|CRIT&gt;</code>. El padre usa <code>select()</code> sobre los 5 descriptores, imprime cada mensaje con hora (<code>time()</code>) y termina cuando todos cerraron su pipe, con un resumen por severidad y módulo.</p>`,
 files:['P3/p3_tycho.c'],
 qs:[{q:'El enunciado dice que termina cuando "select() retorna 0 para todos". ¿Es exacto?',a:'No del todo: select() con timeout NULL no retorna 0. Lo que indica que un hijo terminó es que su descriptor queda "listo" y <b>read() retorna 0 (EOF)</b>. Se cierra ese fd, se saca del conjunto y se termina cuando no queda ninguno abierto.'},
     {q:'¿Por qué la solución usa mensajes de largo fijo (64 bytes)?',a:'Un read() en un pipe puede traer varios mensajes juntos o uno cortado. Si todos los write() son de 64 bytes (menos que PIPE_BUF, así que son atómicos) y se lee exactamente 64, cada read() trae <b>un mensaje completo</b>. La alternativa es un buffer acumulador por descriptor.'}],
 hints:['select() modifica el fd_set: hay que reconstruirlo (FD_ZERO + FD_SET) en cada vuelta.','Necesitas el mayor fd + 1 como primer argumento.','Marca con −1 los pipes ya cerrados para no volver a agregarlos.'],
 think:['Crear 5 pipes, 5 fork. Cada hijo cierra todos los extremos de lectura y los de escritura ajenos.','Padre: cierra todos los de escritura.','Loop mientras haya abiertos: FD_ZERO, FD_SET de los abiertos, select, revisar FD_ISSET, read; si 0 → cerrar y abiertos--.'],
 errors:['No reconstruir el fd_set en cada iteración.','No cerrar en el padre los extremos de escritura: read nunca da 0.'],
 rubric:[{pts:2,t:'5 pipes + 5 hijos con cierres correctos'},{pts:3,t:'fd_set reconstruido y select() con maxfd + 1'},{pts:2,t:'Lee solo los fd listos y detecta EOF'},{pts:2,t:'Imprime con hora y cuenta por severidad'},{pts:1,t:'Termina cuando todos cierran y espera a los hijos'}]
},
{
 id:'S1', group:'cert', n:'S1 ⭐', topic:'sockets', lvl:1, min:12, title:'Relay OPA — transmisión básica',
 statement:`<p>Servidor TCP en el puerto 7001 que atiende <b>un</b> cliente: imprime "[RELAY] Recibido: &lt;msg&gt;" y responde <code>ACK &lt;msg&gt;\\n</code> hasta que recv() retorne 0. El cliente envía 5 <code>MSG nave_OPA_1 dato_&lt;i&gt;\\n</code> y espera el ACK de cada uno.</p>`,
 files:['S1/s1_relay.c','S1/s1_cliente.c'],
 hints:['Servidor: socket → setsockopt(SO_REUSEADDR) → bind → listen → accept.','accept() retorna un NUEVO descriptor: con ese hablas con el cliente.','strcspn(buf, "\\n") da la posición del salto de línea para quitarlo.'],
 think:['Servidor: el socket de escucha (srv) y el de conexión (cli) son distintos.','while ((n = recv(cli, ...)) > 0): null-terminar, quitar \\n, imprimir, enviar ACK.','Cliente: connect y luego 5 veces send + recv.'],
 errors:['Hacer recv sobre srv en vez de cli.','Olvidar htons(PORT).'],
 rubric:[{pts:3,t:'Servidor: socket/bind/listen/accept'},{pts:2,t:'Loop recv con término en 0'},{pts:2,t:'Responde ACK <msg>'},{pts:3,t:'Cliente: connect + 5 envíos esperando ACK'}]
},
{
 id:'S2', group:'cert', n:'S2 ⭐⭐', topic:'sockets', lvl:2, min:15, title:'Puerto Ceres — servidor concurrente',
 statement:`<p>Puerto 7002, <code>fork()</code> por cliente. Protocolo: <code>DOCK &lt;nave&gt; &lt;tipo_carga&gt;</code> → <code>ASIGNADO &lt;bahia&gt;</code> (AGUA→Bahia-A, SILICATOS→Bahia-B, OXIGENO→Bahia-C, COMBUSTIBLE→Bahia-D). Puede haber varios DOCK. <code>CAST_OFF</code> → <code>BYE</code> y cerrar. Sin zombis; el hijo cierra el socket del servidor apenas hace fork.</p>`,
 files:['S2/s2_ceres.c'],
 hints:['signal(SIGCHLD, SIG_IGN) antes del loop evita los zombis.','Tras el fork: el hijo cierra srv y el padre cierra cli.'],
 think:['Una función bahia_para(carga) con strcmp que retorna el nombre o NULL.','atender_nave: while recv; si empieza con CAST_OFF → BYE y break; si sscanf "DOCK %s %s" → ASIGNADO.','main: loop accept → fork.'],
 errors:['Que el hijo no termine con exit(): vuelve al loop de accept.','No cerrar cli en el padre: se agotan los descriptores.'],
 rubric:[{pts:2,t:'Tabla carga → bahía'},{pts:2,t:'Protocolo DOCK / CAST_OFF'},{pts:3,t:'fork por cliente con cierres correctos'},{pts:2,t:'Evita zombis'},{pts:1,t:'El hijo termina con exit()'}]
},
{
 id:'S3', group:'cert', n:'S3 ⭐⭐⭐', topic:'sockets', lvl:3, min:25, title:'Intel MCRN — protocolo completo',
 statement:`<p>Puerto 7003. Mensajes: <code>REPORT &lt;agente&gt; &lt;dato&gt;</code> (guarda el último dato; máx. 10 agentes; responde STORED), <code>QUERY &lt;agente&gt;</code> (dato o UNKNOWN), <code>ALERT &lt;nivel&gt; &lt;mensaje&gt;</code> (imprime con hora, responde ACK_ALERT; nivel 3 desconecta), <code>STATUS</code> (<code>AGENTS &lt;n&gt;</code>). recv() puede traer mensajes parciales: implementa un <b>buffer acumulador</b> que procese solo las líneas completas.</p>`,
 files:['S3/s3_mcrn.c'],
 qs:[{q:'¿Por qué la solución no usa fork() por cliente?',a:'Porque la tabla de agentes debe ser <b>compartida</b>: lo que un agente reporta otro lo consulta. Con fork() cada hijo tendría su propia copia y QUERY nunca vería los REPORT de otra conexión. Las opciones son un servidor iterativo, select() en un solo proceso, o mover el estado a memoria compartida o a un archivo con flock (como R3).'}],
 hints:['Acumulas con recv(fd, buf + total, sizeof(buf) - total - 1, 0).','Mientras haya un \\n en el buffer: corta ahí, procesa esa línea y corre el resto con memmove.','%127[^\\n] lee "el resto de la línea", con espacios incluidos.'],
 think:['Buffer: total += n; buf[total] = 0; while (nl = strchr(buf, \'\\n\')) { *nl = 0; procesar(buf); memmove(buf, nl + 1, …); total -= …; }','procesar: un if/else por cada tipo de mensaje con sscanf.','ALERT nivel 3: responder primero y luego retornar "desconectar".'],
 errors:['Suponer que cada recv() trae exactamente un mensaje.','Calcular mal cuántos bytes mover con memmove (perder el \\0 o dejar basura).','Usar fork() y perder el estado compartido.'],
 rubric:[{pts:4,t:'Buffer acumulador correcto (strchr + memmove)'},{pts:2,t:'REPORT con tabla de 10 agentes'},{pts:1,t:'QUERY con UNKNOWN'},{pts:2,t:'ALERT con hora y desconexión en nivel 3'},{pts:1,t:'STATUS'}]
},
{
 id:'R1', group:'cert', n:'R1 ⭐', topic:'rpc', lvl:1, min:12, title:'Registro de naves — Ceres (RPC)',
 statement:`<p>RPC de una función: <code>get_estado(id_nave)</code>. Protocolo: <code>CALL get_estado &lt;id&gt;</code> → <code>RESULT &lt;estado&gt;</code>. Tabla: Rocinante=EN_VUELO, Canterbury=DESTRUIDA, Donnager=EN_PUERTO, Behemoth=EN_VUELO, Nauvoo=CONSTRUCCION; si no existe, DESCONOCIDA. El <b>stub</b> del cliente es una función C normal <code>char* get_estado(int sock, char* id)</code> que oculta el send/recv.</p>`,
 files:['R1/r1_servidor.c','R1/r1_cliente.c'],
 qs:[{q:'¿Qué es un stub y qué hace el skeleton del servidor?',a:'El <b>stub</b> (cliente) tiene la misma firma que la función remota: <b>serializa</b> los argumentos en un mensaje, lo envía, espera la respuesta y la <b>deserializa</b>. Para quien la llama parece una llamada local. El <b>skeleton</b> (servidor) hace lo inverso: parsea el CALL, llama a la función real y serializa el resultado como RESULT.'}],
 hints:['El stub retorna un char*: no puede ser un arreglo local (desaparece al retornar). Usa static.','sscanf(msg, "RESULT %63s", estado) extrae el estado.'],
 think:['Servidor: get_estado real con un for y strcmp sobre la tabla.','atender: sscanf "CALL %s %s", verificar el nombre de la función, responder RESULT.','Stub: snprintf CALL, send, recv, sscanf RESULT y retornar un buffer static.'],
 errors:['Retornar un char estado[64] local desde el stub (puntero colgante).'],
 rubric:[{pts:2,t:'Tabla y búsqueda en el servidor'},{pts:2,t:'Parseo CALL y respuesta RESULT'},{pts:4,t:'Stub con send/recv/parseo y buffer static'},{pts:2,t:'Demostración con 5 naves + 1 inexistente'}]
},
{
 id:'R2', group:'cert', n:'R2 ⭐⭐', topic:'rpc', lvl:2, min:20, title:'Navegación Nauvoo — dispatch table',
 statement:`<p>Servidor RPC en el puerto 8002 con 4 funciones (<code>CALL &lt;funcion&gt; &lt;args&gt;</code> → <code>RESULT &lt;valor&gt;</code>):</p><ul class="clean"><li><code>calcular_quema(delta_v, masa)</code> = masa · (e^(delta_v/9800) − 1)</li><li><code>distancia_AU(origen, destino)</code> con Tierra 1.0, Marte 1.52, Ceres 2.77, Jupiter 5.2, Tycho 2.2</li><li><code>ruta_optima(origen, destino)</code>: secuencia de nodos más corta</li><li><code>estado_reactor(nave)</code>: OPTIMO, DEGRADADO o CRITICO con rand()</li></ul><p>Implementa una <b>dispatch table</b>: arreglo de <code>{char *nombre, handler_fn fn}</code>. Compilar con <code>-lm</code>.</p>`,
 files:['R2/r2_nauvoo.c'], comandos:{'r2_nauvoo.c':'gcc -Wall -o r2_nauvoo r2_nauvoo.c -lm'},
 qs:[{q:'¿Qué ventaja tiene la dispatch table frente a un if/else por función?',a:'Agregar una función remota es agregar <b>una línea</b> a la tabla; el despacho (buscar por nombre y llamar por puntero) no cambia. Todas las funciones comparten la firma <code>handler_fn</code>, así que el servidor no necesita conocerlas una por una.'},
     {q:'El enunciado no define el grafo de rutas. ¿Qué supuso la solución?',a:'Un grafo de conexiones directas (Tierra–Marte, Marte–Ceres, Marte–Tycho, Ceres–Tycho, Ceres–Jupiter, Tycho–Jupiter) y <b>BFS</b> para el camino con menos saltos. En la prueba, declara tu supuesto por escrito.'}],
 hints:['typedef void (*handler_fn)(const char *args, char *out, size_t n); es un puntero a función.','%199[^\\n] captura todos los argumentos juntos y cada handler los parsea.','exp() y fabs() están en math.h: compila con -lm.'],
 think:['Definir los 4 handlers con la misma firma.','Tabla: Entrada dispatch[] = {{"calcular_quema", calcular_quema}, …}.','atender: sscanf CALL → for por la tabla, strcmp del nombre, dispatch[i].fn(args, res, …), RESULT.'],
 errors:['Firmas distintas entre handlers (no compila en la tabla).','Olvidar -lm al compilar.'],
 rubric:[{pts:2,t:'Typedef de puntero a función y tabla'},{pts:3,t:'Los 4 handlers'},{pts:3,t:'Despacho por nombre y llamada por puntero'},{pts:2,t:'Formato RESULT y error para función desconocida'}]
},
{
 id:'R3', group:'cert', n:'R3 ⭐⭐⭐', topic:'rpc', lvl:3, min:25, title:'Lab de Protomolécula — RPC concurrente + flock',
 statement:`<p>Puerto 8003, <code>fork()</code> por cliente. El estado se guarda en <code>experimento.dat</code>: fase_actual, num_muestras y hasta 50 muestras {id, valor}. Funciones: <code>registrar_muestra(id, valor)</code>, <code>leer_estado()</code>, <code>incrementar_fase()</code> y <code>obtener_fase()</code>. Usa <code>flock()</code>: LOCK_EX para escribir y LOCK_SH para leer. Simula 3 clientes concurrentes: uno registra, otro lee cada segundo y otro incrementa la fase al llegar a 10 muestras.</p>`,
 files:['R3/r3_ilus.c','R3/r3_cliente.c'],
 qs:[{q:'¿Por qué el estado va en un archivo y no en una variable global?',a:'Con fork() cada hijo tiene su propia memoria: una variable global <b>no se comparte</b> entre clientes. El archivo sí es compartido. Para que no se pisen los cambios, se protege con flock.'},
     {q:'¿Por qué la modificación lee y escribe bajo el MISMO LOCK_EX?',a:'Para que "leer → modificar → escribir" sea <b>atómico</b>. Si lees con LOCK_SH, sueltas y luego escribes con LOCK_EX, otro proceso puede escribir en medio y una de las dos actualizaciones se pierde (<b>lost update</b>).'}],
 hints:['LOCK_SH permite varios lectores a la vez; LOCK_EX es exclusivo.','Antes de reescribir el archivo, vuelve al inicio con lseek(fd, 0, SEEK_SET).','Crea el archivo con un Estado vacío al iniciar el servidor.'],
 think:['Lectura: open, flock(LOCK_SH), read del struct, flock(LOCK_UN).','Escritura: open O_RDWR, flock(LOCK_EX), read, modificar, lseek a 0, write, flock(LOCK_UN).','Despacho: primero sscanf del nombre de la función y después sus argumentos.'],
 errors:['Soltar el lock entre leer y escribir.','Olvidar lseek antes de write (escribe al final del archivo).'],
 rubric:[{pts:2,t:'Archivo inicializado y estructura Estado'},{pts:3,t:'LOCK_SH para leer y LOCK_EX para modificar'},{pts:2,t:'Leer + modificar + escribir atómico'},{pts:2,t:'Las 4 funciones RPC'},{pts:1,t:'Clientes concurrentes de prueba'}]
},
{
 id:'I1', group:'cert', n:'I1 ⭐⭐', topic:'integracion', lvl:2, min:25, title:'Soporte vital — pipe + socket',
 statement:`<p>A (sensor) genera cada 2 s <code>VITAL O2=&lt;v&gt; CO2=&lt;v&gt; TEMP=&lt;v&gt;</code> (O2 80–100 %, CO2 0–5 %, TEMP 15–25 °C) y lo envía por pipe. B (procesador) decide las alertas: O2&lt;85 → ALERTA_O2, CO2&gt;3 → ALERTA_CO2, TEMP&gt;22 → ALERTA_TEMP, y envía <b>solo las alertas</b> por TCP a la base (puerto 6001), que las registra con hora y responde ACK_ALERTA. El procesador cierra el pipe al cerrar la conexión.</p>`,
 files:['I1/i1_base.c','I1/i1_procesador.c'],
 hints:['El procesador es el padre: crea el pipe, hace fork del sensor y después se conecta a la base.','Una lectura puede disparar varias alertas: un if por cada una, no else-if.'],
 think:['Procesador: pipe; fork (hijo = sensor, cierra p[0]); el padre cierra p[1], hace connect y lee el pipe con fdopen + fgets.','sscanf "VITAL O2=%f CO2=%f TEMP=%f"; por cada umbral cruzado, send + recv del ACK.','Base: servidor TCP común que imprime con strftime y responde ACK_ALERTA.'],
 errors:['Usar else-if y perder alertas simultáneas.','Conectarse a la base antes del fork: el hijo hereda el socket sin necesitarlo.'],
 rubric:[{pts:2,t:'Sensor por pipe con formato y rangos'},{pts:3,t:'Procesador: parsea y aplica los 3 umbrales'},{pts:2,t:'Envía solo alertas y espera el ACK'},{pts:2,t:'Base: registra con hora y responde'},{pts:1,t:'Cierres ordenados y wait()'}]
},
{
 id:'I2', group:'cert', n:'I2 ⭐⭐⭐', topic:'integracion', lvl:3, min:30, title:'Flota MCRN — pipe + socket + RPC',
 statement:`<p>Cada nave tiene un sensor (hijo) y un validador (padre) unidos por pipe. El sensor genera velocidad (0–1000 km/s), distancia_objetivo (0–500 km) y combustible (0–100 %). El validador se conecta por TCP al cuartel (puerto 8010) y llama por RPC <code>CALL solicitar_reabastecimiento &lt;nave&gt; &lt;combustible&gt;</code> si combustible &lt; 20 %, y <code>CALL solicitar_ordenes &lt;nave&gt; &lt;dist&gt;</code> si distancia &lt; 50 km. El cuartel (fork por cliente) responde <code>RESULT REBASTECER_EN &lt;base&gt;</code> o <code>RESULT ATACAR|RETIRARSE</code>.</p><p><code>./i2_nave Donnager &amp; ./i2_nave Scirocco &amp; ./i2_nave Tachi &amp;</code></p>`,
 files:['I2/i2_cuartel.c','I2/i2_nave.c'],
 hints:['Es I1 + R1: reutiliza el patrón pipe/fork y escribe un stub RPC.','Un solo stub genérico rpc_call(fn, nave, valor) sirve para las dos funciones.'],
 think:['Nave: pipe, fork del sensor, connect al cuartel, fgets del pipe, if por cada regla → rpc_call.','Stub: snprintf CALL, send, recv, verificar el prefijo "RESULT " y copiar el resto.','Cuartel: fork por cliente, sscanf "CALL %s %s %f" y responder según la función.'],
 errors:['srand() en el padre antes de fork: todos los hijos generan la misma secuencia "aleatoria".'],
 rubric:[{pts:2,t:'Sensor → validador por pipe'},{pts:2,t:'Reglas de combustible y distancia'},{pts:3,t:'Stub RPC'},{pts:3,t:'Cuartel concurrente con las 2 funciones'}]
},
{
 id:'I3', group:'cert', n:'I3 ⭐⭐⭐', topic:'integracion', lvl:3, min:40, title:'Puertas del Anillo — sistema de 3 capas',
 statement:`<p><b>Nodo</b>: cada 3 s envía <code>GATE_STATUS &lt;gate&gt; &lt;estado&gt; &lt;timestamp&gt;</code> al hub (puerto 9001), con estado INACTIVA, EXPLORANDO, ACTIVA o INESTABLE (aleatorio con peso). <b>Hub</b>: hasta 5 nodos (fork por cliente); guarda el último estado de cada gate. Si ≥3 están ACTIVA, envía <code>ALERT NIVEL_3 &lt;n&gt; gates activas</code> a Laconia (puerto 9002). Si un nodo se desconecta, su gate pasa a INACTIVA. <b>Laconia</b>: ante NIVEL_3 responde <code>RESULT PROTOCOLO_OSIRIS_ACTIVADO</code> e imprime la alerta.</p>`,
 files:['I3/i3_laconia.c','I3/i3_hub.c','I3/i3_nodo.c'],
 qs:[{q:'El hub usa fork() por nodo, pero debe agregar el estado de TODAS las gates. ¿Cómo se resuelve?',a:'Los hijos no comparten memoria: si cada hijo guardara la tabla, ninguno vería las otras gates. La solución usa el patrón del Ej. 12 de Lamport: los hijos <b>informan cada cambio al padre por una pipe</b> (struct de tamaño fijo, write atómico) y el padre mantiene la tabla única y decide la alerta. El padre hace select() entre el socket de escucha y la pipe.'},
     {q:'¿Por qué alertar solo al cruzar el umbral y no en cada mensaje?',a:'Si 3 gates siguen activas, cada GATE_STATUS volvería a disparar la alerta e inundaría a Laconia. Con un flag que se activa al cruzar a ≥3 y se reinicia al bajar de 3, se envía una alerta por episodio.'}],
 hints:['Orden de ejecución: Laconia, luego el hub, luego los nodos.','fdopen(fd, "r") también funciona con sockets y permite usar fgets.','Al salir del loop de fgets, el nodo se desconectó: el hijo avisa INACTIVA.'],
 think:['Nodo: loop de EVENTOS con estado ponderado (rand() % 100 en rangos), send y sleep.','Hub (hijo): fgets sobre el socket → write de un Cambio{gate, estado} a la pipe; al terminar, Cambio INACTIVA.','Hub (padre): select(srv, pipe); al leer un Cambio, actualizar la tabla, contar ACTIVA y alertar si cruza 3 (stub: connect, send, recv).','Laconia: servidor iterativo que responde a ALERT NIVEL_3.'],
 errors:['Guardar el estado en los hijos del hub.','Enviar la alerta en cada mensaje mientras haya ≥3 activas.'],
 rubric:[{pts:2,t:'Nodo con estados ponderados y formato correcto'},{pts:3,t:'Hub: fork + pipe hacia el padre'},{pts:2,t:'Tabla de último estado + INACTIVA al desconectar'},{pts:2,t:'Alerta a Laconia al cruzar a ≥3'},{pts:1,t:'Laconia responde e imprime'}]
}
);
