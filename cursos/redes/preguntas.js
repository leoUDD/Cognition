/* Banco de preguntas de alternativas para el examen (60 preguntas, 120 min).
   Secciones y pesos según el temario del examen. La PRIMERA alternativa es la correcta (se barajan al mostrar). */
Object.assign(examen, {
  titulo: 'Examen de alternativas', preguntas: 60, minutos: 120, exigencia: 0.6, meta: 0.7,
  secciones: [
    { id: 'posix', titulo: 'POSIX en C: fork, pipes, señales', peso: 15, teoria: 'ipc', tema: 'pipes' },
    { id: 'sockets', titulo: 'Sockets TCP en C', peso: 8, teoria: 'ipc', tema: 'sockets' },
    { id: 'raft', titulo: 'Algoritmo Raft', peso: 8, teoria: 'algoritmos', tema: 'raft' },
    { id: 'consistencia', titulo: 'Consistencia y replicación', peso: 7, teoria: 'consistencia', tema: 'consistencia' },
    { id: 'colas', titulo: 'Colas de mensajes y middleware', peso: 10, teoria: 'colas' },
    { id: 'relojes', titulo: 'Relojes lógicos', peso: 3, teoria: 'tiempo', tema: 'lamport' },
    { id: 'almacen', titulo: 'Almacenamiento distribuido', peso: 5, teoria: 'almacenamiento', tema: 'replicacion' },
    { id: 'patrones', titulo: 'Patrones y conceptos adicionales', peso: 4, teoria: 'almacenamiento' },
    { id: 'seguridad', titulo: 'Seguridad (Unidad IV, por si acaso)', peso: 0, teoria: 'seguridad' },
    { id: 'cloud', titulo: 'Cloud y Docker (por si acaso)', peso: 0, teoria: 'seguridad' }
  ]
});
const Q = (sec, id, q, ops, exp, code) => preguntas.push({ sec, id, q, ops, exp, code });

/* =================== 1. POSIX: fork, pipes, señales =================== */
Q('posix', 'po01', '¿Qué valor retorna <code>fork()</code> en el proceso <b>hijo</b>?',
  ['0', 'El PID del hijo', 'El PID del padre', '-1'],
  '<code>fork()</code> retorna <b>0 en el hijo</b>, el <b>PID del hijo en el padre</b> y <b>-1</b> si falla. Así cada proceso sabe cuál es con un solo <code>if</code>. El hijo puede conocer su PID con <code>getpid()</code> y el del padre con <code>getppid()</code>.');
Q('posix', 'po02', 'Tras un <code>fork()</code> exitoso, ¿qué valor recibe el proceso <b>padre</b>?',
  ['El PID del hijo recién creado', '0', 'Su propio PID', 'El PID de su propio padre'],
  'El padre recibe el <b>PID del hijo</b>: lo necesita para esperarlo con <code>waitpid(pid, …)</code> o enviarle señales. El 0 es solo para el hijo.');
Q('posix', 'po03', '¿Qué imprime este programa?',
  ['<code>hijo 6</code> y luego <code>padre 5</code>', '<code>hijo 6</code> y luego <code>padre 6</code>', '<code>hijo 5</code> y luego <code>padre 6</code>', 'Solo <code>padre 6</code>'],
  'Después del <code>fork()</code> cada proceso tiene su <b>propia copia</b> de la memoria. El hijo cambia <b>su</b> x a 6; la x del padre sigue en 5. Además, el padre imprime después, porque espera al hijo con <code>wait</code>.',
  `int x = 5;
pid_t p = fork();
if (p == 0) {
    x = x + 1;
    printf("hijo %d\\n", x);
    exit(0);
}
wait(NULL);
printf("padre %d\\n", x);`);
Q('posix', 'po04', '¿Qué significa que <code>fork()</code> use <b>copy-on-write</b>?',
  ['Comparten las páginas físicas hasta que uno escribe; ahí se copia esa página', 'La memoria del padre se copia completa en el mismo instante del fork', 'Comparten la memoria para siempre: lo que escribe uno lo ve el otro', 'Solo se copian las variables globales; las locales se comparten'],
  'Copiar toda la memoria en cada fork sería lento. Con copy-on-write ambos procesos <b>comparten las páginas físicas</b> marcadas como solo lectura; cuando uno <b>escribe</b>, el kernel copia <b>esa página</b>. Por eso el cambio del hijo no se ve en el padre, aunque al principio compartieran memoria física.');
Q('posix', 'po05', 'Un proceso abre un socket y luego hace <code>fork()</code>. ¿Qué pasa con ese socket?',
  ['Ambos procesos tienen un descriptor que apunta al mismo socket abierto', 'Solo el padre puede usarlo; el hijo debe abrirlo de nuevo', 'El hijo recibe un socket nuevo, conectado a otro puerto', 'El socket se cierra automáticamente en el hijo'],
  'Los <b>file descriptors abiertos se heredan</b>: pipes, sockets y archivos. Padre e hijo apuntan al mismo objeto del kernel, que se cierra de verdad recién cuando <b>todos</b> lo cierran. Por eso en un servidor concurrente cada uno cierra el descriptor que no usa.');
Q('posix', 'po06', 'Un proceso instala un handler para <code>SIGINT</code> con <code>signal()</code> y después hace <code>fork()</code>. ¿Qué ocurre con el hijo?',
  ['Hereda el mismo handler para SIGINT', 'Vuelve al comportamiento por defecto de SIGINT', 'Ignora SIGINT automáticamente', 'Debe volver a instalarlo o el programa no compila'],
  'Los <b>signal handlers instalados antes del fork se heredan</b>, igual que la memoria y los descriptores. (Se pierden recién si el hijo hace <code>exec()</code>, porque cambia el programa).');
Q('posix', 'po07', 'El hijo termina con <code>exit(3)</code>. ¿Qué imprime el padre?',
  ['3', '0', 'El PID del hijo', 'Nada: WIFEXITED es falso'],
  '<code>waitpid</code> guarda el estado en <code>st</code>. <code>WIFEXITED(st)</code> es verdadero si el hijo terminó normalmente (con exit), y <code>WEXITSTATUS(st)</code> extrae el código de salida: <b>3</b>. No se puede imprimir <code>st</code> directo porque codifica más información.',
  `int st;
waitpid(pid, &st, 0);
if (WIFEXITED(st)) {
    printf("%d\\n", WEXITSTATUS(st));
}`);
Q('posix', 'po08', '¿Qué es un proceso <b>zombie</b>?',
  ['Un proceso que ya terminó, pero cuyo padre aún no recogió su estado con wait', 'Un proceso que sigue ejecutándose aunque su padre ya terminó antes que él', 'Un proceso bloqueado indefinidamente en un read() sobre un pipe vacío', 'Un proceso que ignora todas las señales, incluso SIGTERM y SIGINT'],
  'Al terminar, el hijo deja una entrada en la tabla de procesos con su estado de salida, esperando que el padre la lea. Hasta entonces es <b>zombie</b>: no usa CPU ni memoria, pero ocupa un PID. (Un proceso cuyo padre murió es un <b>huérfano</b>, y lo adopta init).');
Q('posix', 'po09', '¿Por qué los zombies son un problema en un <b>servidor de larga ejecución</b> que hace fork por cliente?',
  ['Se acumula uno por cliente y pueden agotar los PID, haciendo fallar fork()', 'Cada zombie sigue consumiendo CPU mientras espera que el padre lo lea', 'Cada zombie mantiene abierta la conexión TCP con su cliente', 'Los zombies mantienen ocupado el puerto de escucha del servidor'],
  'Si el padre nunca llama a <code>wait</code>, cada hijo terminado queda como zombie. En un servidor que corre días, se acumulan miles: la tabla de procesos se llena y <b>fork() empieza a fallar</b>.');
Q('posix', 'po10', 'En el handler de <code>SIGCHLD</code>, ¿por qué se llama a <code>waitpid</code> dentro de un <b>while</b>?',
  ['Las señales no se encolan: varios hijos pueden terminar y generar una sola SIGCHLD', 'waitpid() suele fallar la primera vez y hay que reintentarlo varias veces', 'Cada hijo envía varias SIGCHLD seguidas y hay que consumirlas todas', 'Para bloquearse esperando también a los hijos que todavía siguen vivos'],
  'Si dos hijos terminan casi juntos, el padre puede recibir <b>una sola</b> SIGCHLD. El while recoge a todos los terminados. <code>WNOHANG</code> hace que waitpid no se bloquee cuando ya no quedan zombies (retorna 0) y el handler termina.',
  `void handler(int s) {
    while (waitpid(-1, NULL, WNOHANG) > 0) {
    }
}`);
Q('posix', 'po11', '¿Qué efecto tiene <code>signal(SIGCHLD, SIG_IGN)</code>?',
  ['No quedan zombies, pero el padre pierde el código de salida de sus hijos', 'Los hijos ya no pueden terminar hasta que el padre restaure el handler', 'El padre recibe el código de salida automáticamente sin llamar a wait', 'Los hijos quedan huérfanos y son adoptados de inmediato por init'],
  'Ignorar SIGCHLD le dice al kernel "no me interesa el estado de mis hijos": los recoge automáticamente y no hay zombies. El costo es que el padre <b>pierde la información de terminación</b>: no puede usar WEXITSTATUS. Si la necesita, debe usar un handler con waitpid.');
Q('posix', 'po12', 'Con <code>int fd[2]; pipe(fd);</code>, ¿qué extremo se usa para <b>escribir</b>?',
  ['fd[1]', 'fd[0]', 'Cualquiera de los dos', 'El que retorna pipe()'],
  '<b>fd[0] es lectura y fd[1] es escritura</b>, como stdin (0) y stdout (1). El pipe es <b>unidireccional</b>: para ida y vuelta hacen falta dos pipes.');
Q('posix', 'po13', 'Tres hijos escriben en el <b>mismo pipe</b> y el padre lee. ¿Qué sabe el padre de cada dato leído?',
  ['Nada sobre el autor: el pipe solo guarda bytes; el hijo debe poner su ID en el mensaje', 'El PID del hijo que escribió, que el kernel agrega al inicio de cada dato', 'El orden de creación de los hijos, porque cada uno escribe en su turno', 'Cuántos bytes escribió cada hijo, porque el pipe separa cada write()'],
  'El pipe es solo un <b>buffer FIFO de bytes</b>: no guarda información del escritor. Si el padre necesita saber quién envió qué, cada hijo debe poner su ID dentro del mensaje (por ejemplo "PID 1234: …").');
Q('posix', 'po14', 'Varios procesos escriben mensajes de <b>8000 bytes</b> en el mismo pipe (en Linux, PIPE_BUF = 4096). ¿Qué puede pasar?',
  ['Pueden intercalarse, porque solo son atómicas las escrituras de hasta PIPE_BUF', 'Nada: el kernel garantiza que todo write() en un pipe es atómico', 'write() falla con error, porque no se permite escribir más de PIPE_BUF', 'El kernel trunca cada mensaje a 4096 bytes y descarta el resto'],
  'POSIX garantiza que un <code>write()</code> de <b>hasta PIPE_BUF bytes</b> es atómico: no se mezcla con otros. Uno <b>mayor</b> puede partirse, y trozos de otros escritores pueden quedar en medio. Solución: mensajes pequeños, o un pipe por escritor.');
Q('posix', 'po15', '¿Qué garantiza un <code>write()</code> de <b>100 bytes</b> en un pipe con varios escritores?',
  ['Que esos 100 bytes quedan juntos, sin mezclarse con los de otros escritores', 'Que el lector los obtiene completos en un solo read(), sin cortes', 'Que se escriben antes que los datos de cualquier otro proceso', 'Nada: con varios escritores siempre pueden intercalarse los bytes'],
  'Como 100 ≤ PIPE_BUF, la escritura es <b>atómica</b>: los 100 bytes quedan contiguos en el pipe. Pero <b>no</b> garantiza que el lector los obtenga en un solo read(): el lector puede leer menos, o bytes de varios mensajes juntos.');
Q('posix', 'po16', '¿Cuál es la diferencia entre <code>pipe()</code> y <code>socketpair()</code>?',
  ['pipe() es unidireccional; socketpair() da dos sockets conectados, ambos de lectura y escritura', 'pipe() funciona entre máquinas distintas; socketpair() solo dentro de la misma máquina', 'socketpair() es unidireccional como pipe(), pero preserva los límites de cada mensaje', 'Son equivalentes: socketpair() es solo la versión moderna del mismo mecanismo'],
  'Con <code>pipe()</code> los datos van en <b>un sentido</b>: fd[1] → fd[0]. <code>socketpair()</code> crea <b>dos sockets conectados entre sí</b>: lo que escribes en sv[0] se lee en sv[1] y viceversa. Con un solo socketpair hay comunicación bidireccional. Ambos sirven solo en la misma máquina.');
Q('posix', 'po17', '¿Qué ventaja tiene <code>socketpair(AF_UNIX, SOCK_DGRAM, 0, sv)</code> sobre un pipe?',
  ['Preserva los límites: cada read() entrega exactamente un mensaje', 'Funciona entre máquinas distintas, a diferencia de un pipe', 'Es más rápido porque no pasa por el kernel al enviar datos', 'Garantiza que ningún mensaje se pierda si el receptor cae'],
  'Un pipe (y SOCK_STREAM) es un <b>flujo de bytes</b>: dos writes pueden leerse en un solo read. Con <b>SOCK_DGRAM</b> cada envío es un <b>datagrama</b> separado: un read() devuelve exactamente un mensaje.');
Q('posix', 'po18', 'Un proceso escribe en un pipe cuyo extremo de lectura ya fue cerrado por todos. Si no maneja señales, ¿qué ocurre?',
  ['Recibe SIGPIPE y, por defecto, el proceso termina', 'write() se bloquea hasta que alguien lea', 'write() retorna 0', 'Los datos quedan guardados para el próximo lector'],
  'Escribir en un pipe <b>sin lectores</b> genera <b>SIGPIPE</b>, cuya acción por defecto es <b>terminar el proceso</b>. Es la forma de avisar "nadie va a leer esto".');
Q('posix', 'po19', 'El mismo caso, pero el proceso ignora SIGPIPE (o la maneja). ¿Qué retorna <code>write()</code>?',
  ['-1, con errno = EPIPE', '0', 'La cantidad de bytes, como si nada', '-1, con errno = EAGAIN'],
  'Si SIGPIPE no mata al proceso, <code>write()</code> retorna <b>-1</b> y deja <b>errno = EPIPE</b> ("broken pipe"). El programa puede detectarlo y reaccionar, por ejemplo cerrando ordenadamente.');
Q('posix', 'po20', 'El padre solo lee del pipe, pero olvidó cerrar su copia de <code>fd[1]</code>. El hijo escribe y termina. ¿Qué pasa con el <code>read()</code> del padre?',
  ['Lee los datos, pero luego queda bloqueado para siempre en vez de recibir 0', 'Recibe 0 (fin de archivo) apenas el hijo termina, como corresponde', 'Retorna -1 con errno EPIPE, porque el escritor ya no existe', 'El kernel cierra fd[1] del padre automáticamente y el read retorna 0'],
  '<code>read()</code> devuelve <b>0 (EOF)</b> solo cuando <b>todos</b> los extremos de escritura están cerrados. Como el propio padre aún tiene fd[1] abierto, el kernel cree que podría llegar más: el read queda <b>bloqueado para siempre</b>. Regla: cada proceso cierra los extremos que no usa.');
Q('posix', 'po21', 'Un generador escribe un dato cada segundo con <code>sleep(1)</code>. ¿El receptor también necesita sleep() para esperar?',
  ['No: read() se bloquea solo hasta que hay datos, sin gastar CPU', 'Sí: sin sleep, read() retorna 0 y el receptor termina antes de tiempo', 'Sí: sin sleep, el receptor ocupa el 100 % de la CPU esperando', 'Solo si el pipe se abrió en modo no bloqueante con O_NONBLOCK'],
  'El sleep() marca el <b>ritmo</b> del generador. El receptor no lo necesita: un <code>read()</code> en un pipe vacío <b>se bloquea</b> (el proceso duerme) hasta que llega algo. Es espera eficiente, sin "busy waiting".');
Q('posix', 'po22', '¿Qué significa que <code>read()</code> sobre un pipe retorne <b>0</b>?',
  ['Fin de archivo: todos los escritores cerraron y no llegarán más datos', 'Que el pipe está vacío por ahora, pero pueden llegar más datos', 'Que ocurrió un error, y hay que revisar errno para saber cuál', 'Que el escritor envió un byte con valor cero'],
  'Retornar 0 es <b>EOF</b>. Un pipe vacío pero con escritores abiertos <b>bloquea</b>, no retorna 0. Un error retorna -1.');

/* =================== 2. Sockets TCP =================== */
Q('sockets', 'so01', '¿Cuál es el orden correcto de llamadas de un <b>servidor</b> TCP?',
  ['socket → bind → listen → accept', 'socket → listen → bind → accept', 'socket → connect → listen → accept', 'bind → socket → accept → listen'],
  '<b>socket</b> crea el socket, <b>bind</b> lo asocia a una dirección y puerto, <b>listen</b> lo pone en modo escucha y <b>accept</b> toma una conexión. El cliente usa socket → connect.');
Q('sockets', 'so02', '¿Qué hace <code>listen(fd, 10)</code>?',
  ['Pasa el socket a LISTEN y fija el backlog: la cola de conexiones pendientes', 'Bloquea al servidor hasta que se conecten 10 clientes simultáneamente', 'Acepta hasta 10 clientes en total y rechaza a los siguientes para siempre', 'Lee hasta 10 bytes del primer cliente que se conecte al puerto'],
  '<code>listen</code> marca el socket como <b>pasivo</b> (estado LISTEN). El 10 es el <b>backlog</b>: cuántas conexiones pueden esperar en cola mientras el servidor aún no llama a accept. No bloquea ni limita el total de clientes.');
Q('sockets', 'so03', '¿Qué retorna <code>accept()</code>?',
  ['Un descriptor nuevo para ese cliente; el de escucha sigue aceptando otros', 'El mismo descriptor de escucha, que ahora queda conectado al cliente', 'La dirección IP del cliente, codificada como un entero de 32 bits', 'La cantidad de bytes que el cliente envió en su primer mensaje'],
  'accept <b>extrae una conexión de la cola</b> y crea un <b>socket nuevo</b> solo para ese cliente. El de escucha sigue en LISTEN. Por eso un servidor maneja dos fd: el de escucha y uno por cliente.');
Q('sockets', 'so04', 'El cliente llama a <code>close()</code> de forma normal. ¿Qué obtiene el servidor en su siguiente <code>recv()</code>?',
  ['0: cierre ordenado (llegó un FIN)', '-1 con ECONNRESET', 'Se bloquea para siempre', 'El último mensaje repetido'],
  '<code>close()</code> envía un <b>FIN</b>. Del otro lado, recv() retorna <b>0</b>: "el otro cerró, no vendrán más datos". Es la señal para cerrar también el socket.');
Q('sockets', 'so05', 'Si la conexión termina <b>abruptamente</b> con un RST (por ejemplo, el proceso remoto cayó con datos pendientes), ¿qué retorna <code>recv()</code>?',
  ['-1, con errno = ECONNRESET', '0', 'El tamaño del buffer', '1'],
  'Un <b>RST</b> es un cierre abrupto: recv retorna <b>-1</b> y <b>errno = ECONNRESET</b> ("connection reset by peer"). Distinto del cierre ordenado con FIN, que da 0.');
Q('sockets', 'so06', 'Con <code>netstat</code> ves cientos de conexiones del servidor en estado <b>CLOSE_WAIT</b>. ¿Qué indica?',
  ['Los clientes cerraron (FIN), pero el servidor no llamó a close() en esos sockets', 'El servidor cerró primero y espera 2×MSL antes de liberar el puerto', 'Los clientes siguen enviando datos que el servidor todavía no ha leído', 'Es el estado normal de un servidor ocupado con muchos clientes activos'],
  '<b>CLOSE_WAIT</b> = el remoto ya cerró y el local <b>todavía no</b>. Muchos sockets ahí son casi siempre un <b>bug</b>: el servidor no cierra cuando recv() retorna 0. Se acumulan y agotan los descriptores.');
Q('sockets', 'so07', '¿Qué lado queda en <b>TIME_WAIT</b> y por qué?',
  ['El que inició el cierre; espera 2×MSL por segmentos retrasados', 'El que recibió el FIN; espera a que su aplicación llame a close()', 'Ambos lados, mientras quede algún dato sin leer en el buffer', 'Siempre el servidor, aunque haya sido el cliente quien cerró'],
  '<b>TIME_WAIT</b> le toca a quien hizo el <b>cierre activo</b> (llamó close primero). Espera <b>2×MSL</b> (MSL = vida máxima de un segmento) para que paquetes atrasados de la conexión vieja no se confundan con una nueva en el mismo puerto.');
Q('sockets', 'so08', 'Reinicias el servidor apenas lo detuviste y <code>bind()</code> falla con <b>EADDRINUSE</b>. ¿Por qué, y cómo se evita?',
  ['Conexiones en TIME_WAIT retienen el puerto; se evita con SO_REUSEADDR antes de bind', 'Otro programa tomó el puerto; la única solución es reiniciar el computador', 'Falta llamar a listen() antes de bind(); el orden de las llamadas está mal', 'El backlog quedó lleno; hay que aumentarlo en la llamada a listen()'],
  'Tras detener el servidor, sus conexiones quedan en <b>TIME_WAIT</b> y el puerto sigue asociado. Con <b>SO_REUSEADDR</b> (antes de bind) el kernel permite reutilizar el puerto aunque haya conexiones en TIME_WAIT.');
Q('sockets', 'so09', 'En un servidor concurrente con fork, ¿por qué el <b>hijo</b> cierra el socket de escucha?',
  ['No acepta clientes, y así no mantiene una referencia innecesaria al puerto', 'Si no lo cierra, el hijo aceptaría a todos los clientes nuevos en vez del padre', 'El padre no puede usar el socket de escucha mientras el hijo lo tenga abierto', 'Cerrarlo le envía un FIN al cliente para indicar que la conexión comenzó'],
  'El hijo solo atiende a <b>su</b> cliente. Si conserva el socket de escucha, mantiene viva una <b>referencia al puerto</b> sin razón.');
Q('sockets', 'so10', 'Si los hijos <b>no</b> cierran el socket de escucha y el padre termina mientras hay hijos atendiendo, ¿qué pasa?',
  ['El puerto sigue tomado mientras vivan esos hijos y el servidor no puede volver a hacer bind', 'Los hijos empiezan a aceptar clientes nuevos automáticamente en lugar del padre', 'Los clientes ya conectados se desconectan en ese mismo instante', 'Nada: el kernel libera el puerto apenas termina el proceso que hizo bind'],
  'Un socket se cierra de verdad cuando <b>todos</b> los procesos que lo tienen lo cierran. Si los hijos heredaron el de escucha, el puerto queda tomado hasta que el último termine, y el nuevo servidor no puede hacer bind.');
Q('sockets', 'so11', '¿Por qué el <b>padre</b> cierra el socket del cliente después del fork?',
  ['Si lo deja abierto, el cierre del hijo no termina la conexión y el padre acumula fd', 'El hijo no puede leer ni escribir en el socket mientras el padre lo tenga abierto', 'Para que el cliente reciba los datos más rápido al haber un solo dueño', 'Porque accept() solo permite un proceso dueño por socket y daría error'],
  'Tras el fork ambos tienen el fd del cliente. Si el padre no lo cierra, cuando el hijo hace close el socket <b>sigue abierto</b> en el padre: el cliente no recibe FIN, y el padre acumula un fd por cliente hasta agotarlos.');
Q('sockets', 'so12', 'El cliente hace dos <code>send()</code>: "HOLA\\n" y "CHAO\\n". ¿Qué puede recibir el servidor en un <code>recv()</code>?',
  ['Cualquier trozo: "HOLA\\nCHAO\\n" junto, solo "HO", o "HOLA\\nCH"', 'Siempre exactamente "HOLA\\n"', 'Siempre los dos mensajes por separado, uno por recv', 'Solo el último mensaje enviado'],
  'TCP es un <b>flujo de bytes</b>, no de mensajes: no conserva los límites de cada send(). Un recv puede traer <b>varios mensajes juntos</b> o <b>uno a medias</b>.');
Q('sockets', 'so13', '¿Cuál es la forma correcta de extraer mensajes completos terminados en <code>\'\\n\'</code> sobre TCP?',
  ['Acumular en un buffer y procesar cada línea cuando aparece \'\\n\'; el resto espera', 'Hacer un recv() por mensaje, porque cada send() del cliente llega en un recv()', 'Usar un buffer de 1 byte en recv() para que nunca se mezclen dos mensajes', 'Hacer sleep() antes de cada recv() para dar tiempo a que llegue el mensaje entero'],
  'Se usa un <b>buffer acumulador</b>: cada recv agrega bytes; mientras haya un <code>\'\\n\'</code>, se extrae esa línea completa y se procesa. El resto (un mensaje a medias) espera al siguiente recv.');
Q('sockets', 'so14', '¿Qué retorna <code>sscanf(buf, "%d %s", &id, nombre)</code> y por qué conviene revisarlo?',
  ['Cuántos campos asignó; si no es 2, la línea venía mal formada', 'Cuántos caracteres leyó del buffer, incluyendo los espacios', '0 si todo salió bien y -1 si el formato no coincide', 'El valor leído en id, o -1 si no había un número'],
  'sscanf retorna <b>cuántos campos asignó</b>. Con <code>if (sscanf(...) == 2)</code> validas que el mensaje traía ambos campos; si llega "HOLA" en vez de "5 Ana", retorna 0 y no usas basura.');
Q('sockets', 'so15', 'Sobre <code>ctime()</code>, ¿qué afirmación es correcta?',
  ['Buffer estático con \'\\n\' al final: no es thread-safe, pero sí seguro con fork()', 'Memoria nueva con malloc(), que el programa debe liberar con free()', 'No es seguro con fork(), porque padre e hijo comparten el mismo buffer', 'Retorna los segundos desde 1970 como entero, sin formatear'],
  '<code>ctime()</code> escribe en un <b>buffer estático</b> interno: dos hilos pueden pisarse (no thread-safe). Con <b>fork</b> no hay problema, porque cada proceso tiene su propia memoria. El texto incluye un <b>\'\\n\'</b> al final, así que ojo al concatenarlo.');

/* =================== 3. Raft =================== */
Q('raft', 'ra01', 'En Raft, ¿qué son los <b>heartbeats</b>?',
  ['Mensajes AppendEntries vacíos que el líder envía periódicamente', 'Mensajes RequestVote que los followers envían periódicamente', 'Pings ICMP del sistema operativo, ajenos al protocolo Raft', 'Un tipo de mensaje propio, distinto de AppendEntries y RequestVote'],
  'Raft no tiene un mensaje de heartbeat aparte: el líder envía <b>AppendEntries sin entradas</b>. Así mantiene su autoridad y evita que los followers inicien elecciones.');
Q('raft', 'ra02', 'Además de "estoy vivo", ¿qué información útil comunican los heartbeats de Raft?',
  ['El commit index del líder, para aplicar las entradas ya confirmadas', 'La lista completa de votos recibidos en la última elección', 'El término en que cada follower votó por última vez', 'La cantidad de followers que el líder ve conectados'],
  'Cada AppendEntries, incluso vacío, lleva el <b>commit index</b> del líder. Así los followers saben hasta qué entrada pueden aplicar a su máquina de estados.');
Q('raft', 'ra03', '¿Qué función cumplen los <b>terms</b> en Raft?',
  ['Funcionan como reloj lógico y delatan a líderes obsoletos', 'Miden en segundos cuánto tiempo lleva cada líder', 'Cuentan cuántas entradas tiene el log del líder', 'Identifican a cada nodo, como un ID permanente'],
  'El term es un número que solo crece, uno por elección. Funciona como <b>reloj lógico</b>: un mensaje con term menor viene de alguien desactualizado y se rechaza.');
Q('raft', 'ra04', 'Un líder recibe un mensaje con un <b>term mayor</b> que el suyo. ¿Qué hace?',
  ['Actualiza su term y pasa a follower: hay un mandato más nuevo', 'Ignora el mensaje: mientras sea líder, su term es el válido', 'Incrementa su term e inicia una elección para recuperar el mando', 'Responde con su log para que el otro se ponga al día'],
  'Un term mayor prueba que hubo una elección más reciente. El líder queda <b>obsoleto</b>: actualiza su term y vuelve a <b>follower</b>. Así se resuelve el líder viejo tras una partición.');
Q('raft', 'ra05', '¿Por qué en Raft cada nodo vota <b>como máximo por un candidato por term</b>?',
  ['Así dos candidatos no pueden tener mayoría en el mismo term: máximo un líder', 'Así las elecciones terminan en un solo round-trip de mensajes', 'Así siempre gana el nodo con el ID más alto del clúster', 'Así se reduce a la mitad la cantidad de mensajes por elección'],
  'Si cada nodo da un solo voto por term, dos candidatos no pueden tener <b>mayoría</b> en el mismo term: dos mayorías siempre comparten al menos un nodo, y ese nodo votó una sola vez. Resultado: <b>máximo un líder por term</b>.');
Q('raft', 'ra06', '¿Por qué el election timeout de Raft es <b>aleatorio</b> (por ejemplo, entre 150 y 300 ms)?',
  ['Para que normalmente uno solo se postule primero y no haya split votes', 'Para que siempre gane el nodo con la conexión de red más rápida', 'Para que un atacante no pueda predecir cuándo habrá elecciones', 'Para que todos se postulen a la vez y la elección sea más justa'],
  'Con el mismo timeout, todos se postularían juntos y se repartirían los votos (<b>split vote</b>). Con tiempos aleatorios, uno despierta antes, pide votos y suele ganar antes de que los demás se postulen.');
Q('raft', 'ra07', 'En un clúster Raft de <b>5 nodos</b>, ¿cuántos votos necesita un candidato para ganar?',
  ['3, incluyendo su propio voto', '3, sin contar su propio voto', '2', '5'],
  'Quórum = ⌊N/2⌋ + 1 = ⌊5/2⌋ + 1 = <b>3</b>, contando el voto que el candidato se da a sí mismo. Con 5 nodos se toleran 2 caídas.');
Q('raft', 'ra08', 'Un clúster Raft tiene <b>6 nodos</b>. ¿Cuántos votos se necesitan y cuántas caídas tolera?',
  ['4 votos; tolera 2 caídas', '3 votos; tolera 3 caídas', '4 votos; tolera 3 caídas', '3 votos; tolera 2 caídas'],
  'Quórum = ⌊6/2⌋ + 1 = <b>4</b>. Con 2 caídos quedan 4, que alcanzan; con 3 caídos quedan 3, que no. Tolera lo mismo que 5 nodos pero con un nodo más: por eso se usan números impares.');
Q('raft', 'ra09', '¿Cuándo se considera <b>committed</b> (confirmada) una entrada del log en Raft?',
  ['Cuando está replicada en la mayoría de los nodos', 'Cuando el líder la agrega a su propio log', 'Cuando todos los nodos la tienen', 'Cuando el cliente recibe la respuesta'],
  'El líder confirma una entrada cuando la <b>mayoría</b> la tiene en su log. No espera a todos (los caídos no bloquean) y no basta con que esté solo en el líder.');
Q('raft', 'ra10', 'Clúster de 5 nodos; el líder L queda aislado con 1 follower (2 nodos) y los otros 3 quedan del otro lado. ¿Qué pasa?',
  ['El grupo de 3 elige líder con term mayor; L no logra mayoría para confirmar', 'L sigue siendo el único líder legítimo y confirma entradas normalmente', 'Ningún grupo puede operar hasta que se repare la red entre ellos', 'Ambos grupos eligen líder, confirman entradas y luego las mezclan'],
  'El lado con <b>mayoría (3)</b> puede elegir líder. El lado con L tiene solo 2 de 5: L puede recibir pedidos, pero <b>nunca logrará mayoría para confirmarlos</b>. Así no hay dos líderes confirmando datos distintos.');
Q('raft', 'ra11', 'Se repara la red del caso anterior. ¿Qué pasa con el líder viejo L?',
  ['Ve un term mayor, pasa a follower y sus entradas no confirmadas se sobrescriben', 'Recupera el liderazgo porque fue elegido antes que el líder nuevo', 'Ambos líderes comparan logs y gana el que tenga más entradas', 'Conserva sus entradas y el nuevo líder las incorpora a su log'],
  'Al reconectarse, L recibe mensajes con un <b>term mayor</b>: reconoce al nuevo líder y pasa a follower. Las entradas que L no logró confirmar se <b>borran y sobrescriben</b> con el log del nuevo líder.');
Q('raft', 'ra12', 'Un <b>candidato</b> recibe un AppendEntries de otro nodo con el <b>mismo term</b> que el suyo. ¿Qué hace?',
  ['Reconoce al remitente como líder y vuelve a follower', 'Lo rechaza, porque un candidato no acepta AppendEntries', 'Incrementa su term y se postula nuevamente', 'Le responde con un RequestVote para pedirle su voto'],
  'Solo un líder envía AppendEntries, y en ese term ya hay uno (que ganó con mayoría). El candidato perdió: <b>reconoce al líder y vuelve a follower</b>.');
Q('raft', 'ra13', 'Un candidato con term 7 recibe un AppendEntries con <b>term 5</b>. ¿Qué hace?',
  ['Lo rechaza por venir de un líder obsoleto y sigue como candidato', 'Vuelve a follower y reconoce al remitente como líder', 'Baja su propio term a 5 para coincidir con el líder', 'Se proclama líder, porque su term es el mayor'],
  'Un term <b>menor</b> significa que el remitente está desactualizado. El mensaje se <b>rechaza</b> (y la respuesta le informa el term 7, para que el viejo líder se actualice).');

/* =================== 4. Consistencia y replicación =================== */
Q('consistencia', 'co01', 'Según CAP, ¿qué debe elegir un sistema <b>durante una partición de red</b>?',
  ['Entre rechazar operaciones (C) o aceptarlas con riesgo de inconsistencia (A)', 'Entre particionar la red o mantenerla unida mientras dura el problema', 'Entre baja latencia y alto throughput, según la carga del momento', 'Entre replicación síncrona o asíncrona, decidida para siempre al diseñar'],
  'Durante una partición no se puede tener todo: o se <b>rechazan</b> operaciones para no divergir (C), o se <b>aceptan</b> y se reconcilia después (A).');
Q('consistencia', 'co02', 'Respecto del teorema CAP, ¿qué afirmación es correcta?',
  ['La elección entre C y A es operacional durante la partición; sin partición, el sistema puede dar ambas', 'Un sistema elige C o A una vez, en el diseño, y la pierde para siempre', 'Un sistema puede renunciar a la tolerancia a particiones y ser CA en una red real', 'CAP dice que siempre hay que elegir disponibilidad'],
  'La elección aplica <b>mientras dura la partición</b>. Con la red sana, el sistema puede ser consistente y disponible a la vez. En redes reales las particiones ocurren, así que P no es opcional.');
Q('consistencia', 'co03', '¿Qué exige la <b>linearizabilidad</b>?',
  ['Que el orden respete el tiempo real: si A termina antes de que B empiece, A va primero', 'Solo que cada proceso vea sus propias operaciones en el orden en que las hizo', 'Que las réplicas converjan al mismo valor en algún momento, sin plazo', 'Que cada proceso lea siempre su propia escritura, aunque cambie de réplica'],
  'Es el modelo más fuerte: el sistema se comporta como <b>una sola copia</b>, y el orden respeta el <b>reloj de pared</b>. Si una escritura terminó, cualquier lectura que empiece después debe verla.');
Q('consistencia', 'co04', 'P1 escribe x = 1 y la escritura <b>termina</b>. Después, P2 lee x y obtiene <b>0</b> (el valor viejo). ¿Qué modelo permite este resultado?',
  ['Secuencial, pero no linearizable', 'Linearizable, pero no secuencial', 'Ninguno de los dos modelos', 'Ambos modelos lo permiten'],
  'La <b>secuencial</b> exige un orden global que respete el orden de programa de cada proceso, pero <b>no el tiempo real</b>: vale el orden "P2 lee 0, luego P1 escribe 1". La <b>linearizabilidad</b> lo prohíbe, porque la escritura terminó antes de que empezara la lectura.');
Q('consistencia', 'co05', '¿Qué garantiza la <b>consistencia eventual</b>?',
  ['Que, sin nuevas escrituras, las réplicas convergen, sin plazo garantizado', 'Que las réplicas convergen en menos de un segundo tras cada escritura', 'Que toda lectura devuelve la escritura más reciente del sistema', 'Que los conflictos se resuelven siempre con last-writer-wins'],
  'Solo promete <b>convergencia eventual</b>: no dice cuándo, ni cómo se resuelven los conflictos.');
Q('consistencia', 'co06', 'Cambias tu foto de perfil, recargas la página y ves la foto vieja (te tocó otra réplica). ¿Qué garantía falta?',
  ['Read-your-writes', 'Consistencia eventual', 'Tolerancia a particiones', 'Atomicidad'],
  '<b>Read-your-writes</b>: un proceso siempre ve <b>su propia</b> escritura (o una más nueva), aunque lea de otra réplica. Que otros usuarios vean la foto vieja un rato es aceptable en consistencia eventual; que la veas <b>tú</b> después de cambiarla, no.');
Q('consistencia', 'co07', 'En <b>replicación síncrona</b>, el primario confirma la escritura al cliente…',
  ['…después de que las réplicas la aplicaron: más consistencia, más latencia', '…de inmediato, y luego replica en segundo plano sin esperar', '…solo cuando el cliente lo pide explícitamente en la petición', '…cuando la mitad de las réplicas la leyó al menos una vez'],
  'Síncrona = <b>esperar a las réplicas</b> antes de responder. Todas quedan al día (consistencia fuerte), pero cada escritura tarda lo que tarde la réplica más lenta.');
Q('consistencia', 'co08', 'Con <b>replicación asíncrona</b>, el primario confirma una escritura y se cae antes de replicarla. ¿Qué pasa?',
  ['Esa escritura puede perderse: el backup promovido no la tiene', 'Nada: el backup ya la tenía', 'El cliente recibe un error y reintenta automáticamente', 'El sistema se bloquea hasta que vuelva el primario'],
  'Asíncrona = confirmar <b>antes</b> de replicar: rápido, pero las réplicas pueden estar atrasadas. Si el primario cae justo después, el backup que asume <b>no tiene</b> esas últimas escrituras confirmadas.');
Q('consistencia', 'co09', 'Con N = 3 réplicas, ¿qué configuración de quórum garantiza que una lectura vea la última escritura confirmada?',
  ['W = 2, R = 2', 'W = 1, R = 1', 'W = 1, R = 2', 'W = 2, R = 1'],
  'La regla es <b>W + R &gt; N</b>: así el conjunto que escribió y el que lee <b>se intersecan</b> en al menos una réplica con el valor nuevo. 2 + 2 = 4 &gt; 3 ✓. Las otras suman 2 o 3, que no superan 3.');
Q('consistencia', 'co10', 'Con N = 3, compara <b>W = 3, R = 1</b> contra <b>W = 2, R = 2</b>. ¿Qué es correcto?',
  ['W=3,R=1 lee rápido, pero no puede escribir si cae una réplica; W=2,R=2 tolera una caída', 'W=3,R=1 no garantiza leer lo último, porque solo se consulta una réplica', 'Son equivalentes en todo, porque ambas suman exactamente 4', 'W=2,R=2 no tolera ninguna caída, porque necesita mayoría en ambas'],
  'Ambas cumplen W + R &gt; N. Con <b>W = 3</b> la escritura necesita <b>todas</b> las réplicas: una caída bloquea las escrituras, a cambio de leer de una sola (rápido). <b>W = 2, R = 2</b> equilibra: ambas operaciones toleran una caída.');
Q('consistencia', 'co11', 'Con N = 3, W = 1 y R = 1, ¿qué puede ocurrir?',
  ['Leer un valor viejo: la réplica leída puede no tener la escritura', 'Nada: con N = 3 siempre se lee el último valor escrito', 'Que las escrituras fallen apenas cae una réplica cualquiera', 'Que las lecturas se bloqueen hasta que las 3 coincidan'],
  'W + R = 2, que no supera 3: no hay intersección garantizada. Es rápido y muy disponible, pero solo da <b>consistencia eventual</b>.');
Q('consistencia', 'co12', 'Durante un split-brain, ambas particiones aceptaron escrituras sobre el mismo dato. ¿Qué afirmación es correcta?',
  ['Quedan versiones divergentes; se resuelven con LWW, merge o CRDTs, a elección del sistema', 'La consistencia eventual las resuelve sola, quedándose siempre con la primera escritura', 'No puede ocurrir si la replicación es asíncrona, porque solo un lado escribe', 'Basta con reiniciar las réplicas para que acuerden un valor común'],
  'Hay <b>dos historias distintas</b> del mismo dato. Se resuelven con <b>last-writer-wins</b> (simple, pero pierde una), <b>merge semántico</b> (la aplicación combina) o <b>CRDTs</b> (estructuras que se mezclan solas). La consistencia eventual solo promete que converge, no cómo.');
Q('consistencia', 'co13', '¿Qué efecto tiene <b>agregar más réplicas</b>?',
  ['Más disponibilidad para leer, pero escribir exige más coordinación', 'Las escrituras se vuelven más simples porque hay más copias', 'Se elimina la necesidad de consenso entre las réplicas', 'Bajan a la vez la latencia de lectura y la de escritura'],
  'Más réplicas = más lugares desde donde leer si algo falla. Pero cada escritura debe llegar a más nodos para mantenerlos consistentes: <b>más coordinación</b>.');

/* =================== 5. Colas de mensajes =================== */
Q('colas', 'cq01', '¿Qué semántica de entrega <b>nunca reintenta</b> y por lo tanto puede <b>perder</b> mensajes, pero nunca los duplica?',
  ['At-most-once', 'At-least-once', 'Exactly-once', 'Publish-subscribe'],
  '<b>At-most-once</b> ("como máximo una vez"): se envía y no se reintenta. Si se pierde, se perdió. Sirve cuando perder alguno es aceptable (métricas, telemetría).');
Q('colas', 'cq02', 'Con entrega <b>at-least-once</b>, ¿qué problema debe manejar el consumidor?',
  ['Mensajes duplicados, por los reintentos', 'Mensajes perdidos sin aviso', 'Desorden entre todas las particiones', 'Mensajes corruptos en tránsito'],
  'At-least-once <b>reintenta hasta confirmar</b>: nunca pierde, pero si la confirmación se pierde, reenvía algo que ya se procesó. El consumidor debe ser <b>idempotente</b> o <b>deduplicar</b>.');
Q('colas', 'cq03', '¿Qué se necesita para lograr <b>exactly-once</b>?',
  ['Deduplicar y confirmar de forma transaccional', 'Solo reintentar hasta que el mensaje llegue', 'Solo un broker con discos muy confiables', 'Usar auto-ack para confirmar al instante'],
  'Exactly-once = at-least-once (no perder) + <b>deduplicación</b> (no repetir), con la confirmación hecha de forma <b>transaccional</b>: procesar y marcar como procesado ocurren juntos o no ocurren.');
Q('colas', 'cq04', 'El consumidor procesa un pago y envía el ACK, pero el ACK <b>se pierde</b>. ¿Qué pasa?',
  ['El broker lo reentrega y, sin deduplicar, se cobra dos veces', 'El broker sabe que se procesó y no lo vuelve a enviar', 'El mensaje pasa a la dead letter queue para revisión', 'El productor recibe un error y debe reenviar el pago'],
  'El broker solo sabe lo que confirmaron. Sin ACK, asume que no se procesó y <b>reentrega</b>. Por eso el consumidor <b>no puede confiar solo en el broker</b>: debe deduplicar (registrar IDs procesados) o ser idempotente.');
Q('colas', 'cq05', '¿Cuál de estas operaciones es <b>idempotente</b>?',
  ['Fijar el saldo de la cuenta en $100', 'Sumar $100 al saldo de la cuenta', 'Insertar una fila nueva en la tabla de pagos', 'Enviar un correo de confirmación'],
  'Una operación es <b>idempotente</b> si aplicarla varias veces da el mismo resultado que una vez. "Fijar en 100" deja 100 aunque se repita; "sumar 100" duplicado suma 200.');
Q('colas', 'cq06', 'Para deduplicar en el consumidor, ¿qué se hace típicamente?',
  ['Guardar los IDs ya procesados e ignorar los repetidos', 'Pedirle al broker que nunca reenvíe un mensaje', 'Cambiar la semántica de entrega a at-most-once', 'Procesar cada mensaje dos veces y comparar'],
  'Cada mensaje lleva un <b>ID único</b>. El consumidor guarda los IDs procesados (idealmente en la misma transacción que el efecto) y, si llega uno repetido, lo confirma sin procesarlo otra vez.');
Q('colas', 'cq07', 'En Kafka, ¿qué orden está garantizado?',
  ['El orden dentro de cada partición, no entre particiones', 'El orden global de todos los mensajes del topic', 'Ningún orden: los mensajes llegan en cualquier orden', 'El orden según el timestamp que pone cada productor'],
  'Cada partición es un <b>log ordenado</b>: los consumidores leen en el orden de escritura. Entre particiones distintas <b>no hay garantía</b>.');
Q('colas', 'cq08', 'Los eventos de un mismo pedido ("creado", "pagado", "enviado") deben procesarse en orden. ¿Qué se hace en Kafka?',
  ['Usar el ID del pedido como partition key', 'Crear un topic distinto para cada tipo de evento', 'Enviar los eventos con auto-ack activado', 'Usar más particiones para procesarlos más rápido'],
  'Misma <b>partition key → misma partición</b>, y dentro de una partición el orden se respeta. Pedidos distintos pueden ir en paralelo en otras particiones.');
Q('colas', 'cq09', 'Un topic tiene <b>4 particiones</b> y un consumer group tiene <b>6 consumidores</b>. ¿Qué pasa?',
  ['4 trabajan con una partición cada uno y 2 quedan sin trabajo', 'Cada consumidor recibe 4/6 de una partición repartida', 'Kafka crea 2 particiones más para tener una por consumidor', 'Los 6 consumidores reciben todos los mensajes del topic'],
  'En un <b>consumer group</b>, cada partición la procesa <b>exactamente un miembro</b> a la vez. Con más consumidores que particiones, los que sobran quedan inactivos (sirven de respaldo si uno cae).');
Q('colas', 'cq10', '¿Para qué sirven los <b>consumer groups</b>?',
  ['Repartir particiones entre consumidores para procesar en paralelo, una vez cada mensaje', 'Que cada consumidor del grupo reciba una copia de todos los mensajes del topic', 'Garantizar el orden global de los mensajes entre todas las particiones', 'Comprimir y agrupar mensajes para ahorrar ancho de banda en la red'],
  'El grupo <b>reparte particiones</b>: más consumidores = más paralelismo, y cada mensaje lo procesa uno solo del grupo. (Grupos distintos sí reciben cada uno todos los mensajes).');
Q('colas', 'cq11', 'Con <b>ACK manual</b>, el consumidor se cae después de recibir un mensaje pero antes de confirmarlo. ¿Qué pasa?',
  ['El broker lo reentrega, porque no fue confirmado', 'El mensaje se pierde, porque ya fue entregado', 'El broker lo descarta y avisa al productor', 'El mensaje queda bloqueado para siempre'],
  'Con ACK manual se confirma <b>después de procesar con éxito</b>. Si no llega la confirmación, el broker <b>reentrega</b>. Así no se pierden mensajes (at-least-once).');
Q('colas', 'cq12', '¿Cuál es el riesgo del <b>auto-ack</b>?',
  ['Si el consumidor falla al procesar, el mensaje se pierde', 'Todos los mensajes llegan duplicados al consumidor', 'El sistema es más lento por las confirmaciones', 'Obliga a usar una sola partición por topic'],
  'Con auto-ack, el broker da el mensaje por entregado <b>antes de saber</b> si se procesó bien. Si el consumidor se cae a mitad de camino, el mensaje <b>se pierde</b>.');
Q('colas', 'cq13', '¿Qué es <b>back-pressure</b>?',
  ['Que el receptor le pida al productor bajar su tasa de envío', 'Que los mensajes fallidos vuelvan al productor para reenviarlos', 'Que el broker comprima los mensajes cuando la red está lenta', 'Que los mensajes se procesen en orden inverso al de llegada'],
  'Si el productor envía más rápido de lo que se consume, las colas crecen hasta agotar memoria o perder mensajes. Con <b>back-pressure</b>, el que recibe <b>frena</b> al que envía.');
Q('colas', 'cq14', '¿Para qué sirve una <b>dead letter queue (DLQ)</b>?',
  ['Apartar los mensajes que fallan tras N reintentos, sin bloquear el resto', 'Guardar los mensajes de los consumidores que se cayeron', 'Almacenar los mensajes que ya se procesaron con éxito', 'Dar prioridad a los mensajes urgentes sobre los normales'],
  'Un mensaje "venenoso" (mal formado, con un bug) fallaría para siempre y frenaría la cola. Tras N intentos se mueve a la <b>DLQ</b>: el resto sigue fluyendo y alguien lo revisa después.');
Q('colas', 'cq15', '¿En qué patrón cada mensaje es consumido por <b>exactamente un</b> receptor?',
  ['Point-to-point', 'Publish-subscribe', 'Gossip', 'Broadcast'],
  '<b>Point-to-point</b> (cola): cada mensaje lo toma un solo consumidor, útil para repartir tareas. En <b>publish-subscribe</b>, cada suscriptor del topic recibe su copia.');
Q('colas', 'cq16', 'Un servicio publica "nuevo usuario registrado" y lo reciben a la vez el servicio de correos, el de analítica y el de bonos. ¿Qué patrón es?',
  ['Publish-subscribe', 'Point-to-point', 'Request-reply', 'Saga'],
  'En <b>publish-subscribe</b> el mensaje se entrega a <b>todos los suscriptores</b> del topic. El productor no necesita saber quiénes son.');
Q('colas', 'cq17', '¿Qué ventaja tiene hacer <b>request-reply a través de un broker</b>?',
  ['Desacoplamiento temporal: no necesitan estar activos a la vez', 'Es más rápido que una llamada directa entre los servicios', 'Garantiza entrega exactly-once sin ningún esfuerzo adicional', 'Evita tener que asociar cada respuesta con su solicitud'],
  'La solicitud queda en el broker hasta que el servicio la procesa, y la respuesta queda hasta que el solicitante la lee. Ninguno tiene que estar conectado al mismo tiempo que el otro.');
Q('colas', 'cq18', '¿Cuál es el <b>beneficio principal</b> de usar un broker de mensajes?',
  ['Desacoplamiento temporal: el broker guarda los mensajes si el consumidor no está', 'Los mensajes viajan más rápido que en una conexión directa entre servicios', 'Elimina la necesidad de manejar fallas en productores y consumidores', 'Garantiza el orden global de todos los mensajes de todos los productores'],
  'El broker actúa como <b>buffer persistente</b>: si el consumidor está caído o lento, los mensajes esperan. El productor no depende de que el otro esté vivo en ese momento.');

/* =================== 6. Relojes lógicos =================== */
Q('relojes', 're01', 'Un proceso con reloj de Lamport <b>L = 4</b> recibe un mensaje con timestamp <b>9</b>. ¿Cuánto vale L después?',
  ['10', '9', '5', '13'],
  'Regla de recepción: <b>L = max(L, T) + 1 = max(4, 9) + 1 = 10</b>. El max pone al receptor por delante del emisor; el +1 cuenta el evento de recibir.');
Q('relojes', 're02', 'Un proceso con <b>L = 12</b> recibe un mensaje con timestamp <b>5</b>. ¿Cuánto vale L después?',
  ['13', '6', '12', '17'],
  'max(12, 5) + 1 = <b>13</b>. Si fuera T + 1 = 6, el reloj <b>retrocedería</b> y se rompería la garantía de que lo posterior tiene timestamp mayor.');
Q('relojes', 're03', 'Un proceso parte con L = 0 y hace: evento local, envío, evento local. ¿Qué timestamp lleva el mensaje enviado?',
  ['2', '1', '3', '0'],
  'Se incrementa <b>antes de cada evento</b>, y el envío también es un evento: local → 1, envío → <b>2</b> (el mensaje lleva 2), local → 3.');
Q('relojes', 're04', 'P1 tiene <b>[3, 0, 0]</b> y envía un mensaje (con ese vector) a P2, que tiene <b>[0, 2, 0]</b>. ¿Qué vector queda en P2?',
  ['[3, 3, 0]', '[3, 2, 0]', '[3, 2, 1]', '[4, 3, 0]'],
  'Máximo componente a componente: [max(0,3), max(2,0), max(0,0)] = [3, 2, 0]. Luego P2 <b>incrementa su propia componente</b> (la segunda): <b>[3, 3, 0]</b>.');
Q('relojes', 're05', 'Dos eventos tienen los vectores <b>[2, 1, 0]</b> y <b>[1, 2, 0]</b>. ¿Qué relación tienen?',
  ['Son concurrentes', 'El primero ocurrió antes que el segundo', 'El segundo ocurrió antes que el primero', 'Son el mismo evento'],
  'Ninguno es ≤ al otro en <b>todas</b> las componentes: el primero gana en la 1.ª y el segundo en la 2.ª. Entonces son <b>concurrentes</b>: ninguno pudo influir en el otro.');
Q('relojes', 're06', 'Con relojes de Lamport, <b>L(a) = 3</b> y <b>L(b) = 7</b>. ¿Qué se puede concluir?',
  ['Nada seguro: puede ser a → b o pueden ser concurrentes', 'Que a ocurrió antes que b, es decir, a → b', 'Que son concurrentes, porque los valores son distintos', 'Que b ocurrió antes que a, es decir, b → a'],
  'Lamport garantiza: si a → b, entonces L(a) &lt; L(b). Pero <b>no al revés</b>: L(a) &lt; L(b) no implica a → b. Para detectar concurrencia se necesitan <b>vectores</b>.');
Q('relojes', 're07', 'V(a) = [1, 2, 0] y V(b) = [2, 3, 1]. ¿Qué relación hay?',
  ['a → b (a ocurrió antes que b)', 'b → a', 'Son concurrentes', 'No se puede saber con vectores'],
  'Cada componente de V(a) es ≤ que la de V(b) (1≤2, 2≤3, 0≤1) y son distintos: <b>V(a) &lt; V(b)</b>, entonces <b>a → b</b>. Con vectores la relación sí se puede determinar.');

/* =================== 7. Almacenamiento distribuido =================== */
Q('almacen', 'al01', '¿Qué ventaja y qué riesgo tiene el <b>sharding por rango</b>?',
  ['Consultas por rango eficientes, con riesgo de hot spots', 'Carga uniforme, pero sin consultas por rango eficientes', 'No tiene desventajas frente al sharding por hash', 'Evita hot spots, pero hace lentas las búsquedas por clave'],
  'Con rangos (A–F en un shard, G–M en otro…) las claves cercanas quedan juntas: una consulta "entre X e Y" toca pocos shards. Pero si muchas claves caen en el mismo rango, ese shard se satura (<b>hot spot</b>).');
Q('almacen', 'al02', '¿Qué caracteriza al <b>sharding por hash</b>?',
  ['Reparte uniforme, pero las consultas por rango son ineficientes', 'Mantiene juntas las claves cercanas para consultas por rango', 'Siempre genera hot spots en el último shard', 'Requiere un coordinador central para cada lectura'],
  'El hash "desordena" las claves y las reparte parejo. El costo: claves consecutivas quedan en shards distintos, así que una consulta por rango debe preguntar a <b>todos</b>.');
Q('almacen', 'al03', 'Una tabla de eventos se particiona por rango de <b>timestamp</b>. ¿Qué problema aparece?',
  ['Todas las escrituras nuevas caen en el último shard', 'Las consultas por rango de fechas se vuelven lentas', 'Los datos antiguos se pierden al cambiar de rango', 'Ya no se pueden ordenar los eventos por fecha'],
  'Los eventos nuevos siempre tienen el timestamp más reciente: van <b>todos al mismo shard</b>, el del rango actual. Es el hot spot clásico del sharding por rango.');
Q('almacen', 'al04', '¿Qué es un <b>Write-Ahead Log (WAL)</b>?',
  ['Un log secuencial donde cada escritura se registra antes de aplicarse', 'Una copia completa de la base de datos en otra máquina', 'Un log que se escribe después de aplicar cada cambio', 'Un índice auxiliar para acelerar las búsquedas'],
  '<b>Write-ahead</b> = escribir <b>antes</b> en el log (que es secuencial y rápido), y después aplicar a la estructura principal. Si hay un crash a mitad, el log tiene la operación.');
Q('almacen', 'al05', 'Tras un crash, ¿cómo usa una base de datos su WAL?',
  ['Hace replay de las entradas no aplicadas', 'Borra el log y parte desde un estado vacío', 'Descarta las operaciones que estaban en el log', 'Pide a los clientes reenviar sus operaciones'],
  'Las operaciones confirmadas están en el WAL aunque no alcanzaran a aplicarse. Al reiniciar se <b>re-ejecutan</b> (replay) y el estado queda como si no hubiera habido crash.');
Q('almacen', 'al06', 'En Chord, ¿para qué sirve la <b>finger table</b>?',
  ['Apunta a nodos a distancias exponenciales: búsqueda en O(log N)', 'Guarda una copia de todas las claves: búsqueda en O(1)', 'Guarda solo al sucesor y al predecesor: búsqueda en O(N)', 'Registra los nodos caídos para saltarlos: búsqueda en O(N/2)'],
  'Con solo el sucesor, buscar costaría O(N) saltos. La finger table apunta a nodos a distancia 1, 2, 4, 8… del anillo: cada salto <b>acerca a la mitad</b> de la distancia, y la búsqueda toma <b>O(log N)</b>.');
Q('almacen', 'al07', '¿Qué hace un nodo nuevo al <b>ingresar</b> a un anillo Chord?',
  ['Contacta a un nodo, toma su rango del sucesor y se actualizan las fingers', 'Pide al coordinador central la posición que le corresponde en el anillo', 'Copia todas las claves del sistema para poder responder cualquier búsqueda', 'Reemplaza al nodo con menor ID y hereda todas sus claves y fingers'],
  'Chord no tiene coordinador: el nuevo nodo <b>contacta a cualquiera</b>, encuentra su posición, <b>asume parte del rango de su sucesor</b> (las claves que ahora le tocan) y se actualizan las finger tables.');
Q('almacen', 'al08', '¿Qué es <b>read repair</b>?',
  ['Si una réplica leída está atrasada, el coordinador le envía el valor nuevo', 'Reparar el disco de una réplica después de un crash usando el WAL', 'Releer todas las réplicas hasta que todas coincidan en el valor', 'Borrar las réplicas atrasadas y crear copias nuevas desde cero'],
  'La lectura consulta <b>varias réplicas</b>. Si detecta que alguna está atrasada, aprovecha y le <b>envía la versión nueva</b>. Así las réplicas convergen como efecto de las lecturas.');
Q('almacen', 'al09', '¿Qué caracteriza a <b>event sourcing</b>?',
  ['Guardar todos los eventos inmutables para reconstruir cualquier estado pasado', 'Guardar solo el estado actual y sobrescribirlo con cada cambio', 'Enviar cada evento a todos los nodos usando un protocolo gossip', 'Particionar los datos por fecha del evento para consultas por rango'],
  'En vez de guardar "saldo = 50", guarda "depósito 100", "retiro 50"… El estado actual se obtiene <b>reproduciendo</b> los eventos, y se puede reconstruir el estado en <b>cualquier momento</b> del pasado: auditoría completa.');

/* =================== 8. Patrones y conceptos adicionales =================== */
Q('patrones', 'pa01', '¿Cuál es la diferencia principal entre una <b>Saga</b> y <b>2PC</b>?',
  ['Saga compensa sin bloquear; 2PC bloquea recursos hasta decidir', 'Saga bloquea recursos; 2PC confirma cada paso por separado', 'Son lo mismo: Saga es el nombre comercial de 2PC', '2PC deshace los pasos con acciones compensatorias'],
  '<b>2PC</b> mantiene los recursos <b>bloqueados</b> en todos los participantes hasta que el coordinador decide. La <b>Saga</b> confirma cada paso localmente y, si un paso posterior falla, ejecuta <b>compensaciones</b> que deshacen los anteriores.');
Q('patrones', 'pa02', 'En una Saga de viaje (reservar vuelo → reservar hotel → cobrar), falla el <b>cobro</b>. ¿Qué ocurre?',
  ['Se ejecutan acciones compensatorias: cancelar el hotel y cancelar el vuelo', 'Se hace rollback automático, como en una transacción ACID', 'Se reintenta para siempre', 'El vuelo y el hotel quedan reservados sin pagar'],
  'Los pasos anteriores ya se confirmaron, así que no hay rollback automático. La Saga ejecuta las <b>compensaciones</b> en orden inverso: cancelar hotel, cancelar vuelo.');
Q('patrones', 'pa03', '¿Qué problema tiene <b>2PC</b> si el coordinador cae entre la fase de PREPARE y la de COMMIT?',
  ['Quienes votaron Sí quedan bloqueados sin saber si confirmar o abortar', 'Los participantes confirman solos al no recibir respuesta', 'La transacción se confirma igual al volver el coordinador', 'Nada grave: los participantes abortan solos y liberan todo'],
  '2PC es <b>bloqueante</b>: quien votó Sí prometió confirmar si se lo piden, así que no puede abortar solo. Hasta que el coordinador vuelva, mantiene los recursos <b>bloqueados</b>.');
Q('patrones', 'pa04', '¿Cuántos bits aleatorios tiene un <b>UUID v4</b>?',
  ['122 de 128', '128 de 128', '64 de 128', '96 de 128'],
  'Un UUID tiene 128 bits; en la versión 4, 6 bits indican versión y variante, y los otros <b>122 son aleatorios</b>.');
Q('patrones', 'pa05', '¿Por qué se usan UUID v4 como identificadores en sistemas distribuidos?',
  ['Cada nodo los genera sin coordinarse, con colisiones despreciables', 'Son secuenciales, así que permiten ordenar por fecha de creación', 'Los asigna un servidor central que garantiza que no se repitan', 'Ocupan menos espacio que un entero de 64 bits'],
  'Con 122 bits aleatorios, la probabilidad de que dos coincidan es despreciable. Cada nodo los genera <b>por su cuenta</b>, sin pedirle a un servidor central el siguiente número.');
Q('patrones', 'pa06', '¿Cómo funciona un <b>protocolo gossip</b>?',
  ['Cada nodo comparte su estado con pares al azar, sin coordinador', 'Un coordinador central envía el estado a todos los nodos', 'Cada nodo envía su estado a todos los demás en cada ronda', 'Los nodos votan qué información merece propagarse'],
  'Como un rumor: cada nodo cuenta lo que sabe a unos pocos al azar, y ellos a otros. <b>Sin coordinador</b>, y tolera fallas porque hay muchos caminos.');
Q('patrones', 'pa07', 'En gossip, ¿en cuántas rondas aproximadamente llega la información a todos los nodos?',
  ['O(log N), probabilística', 'O(N), determinista', 'O(1), en una sola ronda', 'O(N²), con todos a todos'],
  'Cada ronda, más o menos se <b>duplica</b> la cantidad de nodos que saben: 1, 2, 4, 8… Llegar a N toma unas <b>log N rondas</b>. Es convergencia <b>probabilística</b>: muy probable, no garantizada.');
Q('patrones', 'pa08', '¿Cuándo sirve un <b>pipe</b> y cuándo hace falta <b>TCP</b>?',
  ['Pipe: emparentados por fork, mismo host; TCP: independientes, cualquier máquina', 'Pipe: procesos en máquinas distintas; TCP: solo dentro del mismo host', 'Pipe y TCP sirven para lo mismo; solo cambia la velocidad de envío', 'Pipe: cualquier proceso del host, emparentado o no; TCP: solo remotos'],
  'Un pipe se crea <b>antes del fork</b> y lo heredan los descendientes: solo sirve entre procesos <b>emparentados</b> en el <b>mismo host</b>. TCP conecta procesos que no se conocen, en cualquier máquina de la red.');

/* ---- Colas: contenidos de la clase (Unidad III) ---- */
Q('colas', 'cq19', 'Según la clase, ¿cuál es el problema principal de la <b>comunicación síncrona</b> entre cliente y servidor?',
  ['El cliente queda bloqueado esperando la respuesta y, si el servidor es lento o cae, todos fallan', 'Los mensajes llegan desordenados porque no hay un buffer intermedio', 'El servidor no puede saber qué cliente le envió cada mensaje', 'Obliga a usar un broker externo como Redis o Kafka'],
  'En la llamada síncrona, el cliente hace <code>send</code> y queda <b>bloqueado</b> en <code>wait_response()</code>: no puede hacer otra cosa, un servidor lento arruina la experiencia y una caída arrastra a todos. Las colas lo resuelven con un buffer intermedio.');
Q('colas', 'cq20', 'Un servicio envía eventos de logging a una cola y sigue trabajando, <b>sin esperar respuesta</b>. ¿Qué patrón es?',
  ['Fire-and-forget', 'Request-reply', 'Fan-out / fan-in', 'Point-to-point con ACK manual'],
  '<b>Fire-and-forget</b>: "dispara y olvida". El productor envía y continúa, sin esperar respuesta. La clase lo usa para logging y analytics.');
Q('colas', 'cq21', 'Una tarea grande se divide en partes que procesan varios workers en paralelo, y luego se juntan los resultados. ¿Qué patrón es?',
  ['Fan-out / fan-in', 'Publish-subscribe', 'Fire-and-forget', 'Request-reply'],
  '<b>Fan-out</b> reparte el trabajo entre varios workers; <b>fan-in</b> reúne sus resultados. Es el patrón de procesamiento paralelo.');
Q('colas', 'cq22', 'Según las ventajas de las colas vistas en clase, ¿qué significa que la cola actúe como <b>buffer</b>?',
  ['Absorbe picos de carga: los mensajes esperan hasta que el consumidor pueda procesarlos', 'Garantiza que ningún mensaje se procese dos veces', 'Ordena los mensajes por prioridad antes de entregarlos', 'Cifra los mensajes mientras esperan en la cola'],
  'Si llegan más mensajes de los que el consumidor alcanza a procesar, la cola los <b>guarda</b> y el consumidor los procesa cuando puede. El productor no se bloquea.');
Q('colas', 'cq23', '¿Qué tecnología de mensajería se asocia en clase a <b>alto throughput y streaming</b>, para big data y logs?',
  ['Apache Kafka', 'Redis Pub/Sub', 'RabbitMQ', 'Amazon SQS'],
  'Según la clase: <b>Kafka</b> → alto throughput y streaming; <b>RabbitMQ</b> (AMQP) → routing flexible y workflows complejos; <b>Redis Pub/Sub</b> → ligero y simple, en tiempo real (el del proyecto); <b>SQS</b> → servicio administrado de AWS.');
Q('colas', 'cq24', 'En el proyecto, el game server ejecuta <code>PUBLISH game-events …</code> en Redis, y la UI, el leaderboard y el logger ejecutan <code>SUBSCRIBE game-events</code>. ¿Qué ocurre con cada evento?',
  ['Lo reciben todos los suscriptores del canal', 'Lo recibe solo el primer suscriptor que lo pida', 'Se reparte entre los suscriptores por turnos', 'Queda guardado hasta que lo lea el logger'],
  'Es <b>publish-subscribe</b>: cada evento publicado en el canal <code>game-events</code> se entrega a <b>todos</b> los suscriptores. (Redis Pub/Sub no guarda mensajes: un suscriptor desconectado en ese momento se lo pierde).');

/* =================== Fuera del temario: seguridad (Unidad IV) =================== */
Q('seguridad', 'sg01', 'De los tres pilares de la seguridad (CIA), ¿cuál se protege con <b>HMAC, firma digital y hash</b>?',
  ['Integridad', 'Confidencialidad', 'Disponibilidad', 'Autorización'],
  '<b>Integridad</b>: que los datos no se modificaron sin permiso. La <b>confidencialidad</b> se protege con cifrado, TLS y control de acceso; la <b>disponibilidad</b>, con replicación, failover y mitigación de DDoS.');
Q('seguridad', 'sg02', '¿Qué diferencia hay entre <b>autenticación</b> y <b>autorización</b>?',
  ['Autenticación: quién eres; autorización: qué puedes hacer, y va después', 'Autenticación: qué puedes hacer; autorización: quién eres, y va primero', 'Son sinónimos: ambas verifican la contraseña en cada petición', 'La autorización va primero, y solo si pasa se verifica la identidad'],
  '<b>Autenticación</b> = ¿quién eres? (contraseña, certificado, token). <b>Autorización</b> = ¿qué puedes hacer? (roles, scopes, ACLs). La autenticación <b>siempre precede</b> a la autorización.');
Q('seguridad', 'sg03', 'Sobre un <b>JWT</b> (header.payload.signature), ¿qué afirmación es correcta?',
  ['Solo está firmado: el payload se lee decodificando Base64; no lleves datos sensibles', 'El payload va cifrado con el secret, así que puede llevar contraseñas sin riesgo', 'La firma cifra el header para que nadie sepa qué algoritmo se usó', 'El servidor guarda cada token emitido en una tabla para validarlo después'],
  'Un JWT <b>no cifra</b> el payload: solo lo <b>firma</b>. Cualquiera puede leer los claims decodificando Base64, pero no puede modificarlos sin invalidar la firma.');
Q('seguridad', 'sg04', '¿Cómo valida un servidor un JWT firmado con HS256?',
  ['Recalcula la firma de header.payload con el secret, compara y revisa exp', 'Descifra el payload con su clave privada y revisa que traiga un usuario', 'Busca el token en la base de datos para confirmar que lo emitió antes', 'Le pide al cliente su contraseña de nuevo y la compara con el token'],
  'Validar = <b>recalcular la firma</b> (HMAC-SHA256 de header.payload con el secret) y comparar, de forma segura ante ataques de tiempo. Después se revisa la <b>expiración</b> (<code>exp</code>). No hace falta guardar el token: JWT es <b>stateless</b>.');
Q('seguridad', 'sg05', '¿Por qué es <b>difícil revocar</b> un JWT antes de que expire?',
  ['Es stateless: nadie guarda los tokens, y uno válido sirve hasta su exp', 'Está cifrado, y el servidor no puede leerlo para invalidarlo', 'Solo el usuario que lo recibió tiene permiso para revocarlo', 'El KDC que lo emitió deja de estar disponible tras emitirlo'],
  'El JWT es <b>autocontenido</b>: el servidor lo valida con la firma, sin consultar ningún registro. Por eso se usan <b>expiraciones cortas</b> (por ejemplo, 15 min) y refresh tokens. Kerberos, en cambio, es stateful y revoca vía el KDC.');
Q('seguridad', 'sg06', 'En el <b>Authorization Code Flow</b> de OAuth2, ¿qué hace la app cliente con el código de autorización?',
  ['Lo cambia, con su secret, por un access token', 'Lo usa directamente como token ante la API', 'Lo reenvía al usuario para que inicie sesión', 'Lo guarda como la contraseña del usuario'],
  'Flujo: login → redirect al servidor de autorización → este devuelve un <b>código</b> → la app envía <b>código + secret</b> → recibe un <b>access token</b> (por ejemplo, un JWT) → llama a la API con <code>Bearer</code>.');
Q('seguridad', 'sg07', '¿Qué caracteriza a <b>Kerberos</b>?',
  ['Tickets (TGT y de servicio) emitidos por un KDC; la contraseña nunca viaja', 'Envía la contraseña cifrada con RSA a cada servicio en cada petición', 'Es stateless: cada servicio valida tokens firmados sin consultar a nadie', 'Usa OAuth2 por debajo y solo funciona en APIs REST públicas en internet'],
  'Kerberos da <b>Single Sign-On</b>: el cliente obtiene un <b>TGT</b> del KDC y con él pide <b>service tickets</b> para cada servicio. Usa cifrado <b>simétrico</b> (AES), y la contraseña <b>nunca viaja</b>. Es el de Active Directory.');
Q('seguridad', 'sg08', '¿Qué algoritmo simétrico es el estándar actual, y cuál está roto?',
  ['AES es el estándar; DES (56 bits) está roto desde 1998', 'DES es el estándar; AES está deprecado desde 2023', '3DES es el estándar; AES solo se usa en legacy', 'RSA es el estándar simétrico; DES es asimétrico'],
  '<b>AES</b> (128/192/256 bits) es el estándar. <b>3DES</b> es legacy y está deprecado. <b>DES</b> (56 bits) fue roto en 1998 y no debe usarse nunca. RSA es <b>asimétrico</b>.');
Q('seguridad', 'sg09', '¿Por qué no se debe usar AES en modo <b>ECB</b>, y qué modo se recomienda?',
  ['ECB deja ver patrones; se recomienda GCM, que además autentica', 'ECB es muy lento; se recomienda DES, que cifra mucho más rápido', 'ECB exige un IV por bloque; se recomienda CBC, que no usa IV', 'ECB no cifra el último bloque; se recomienda ECB con padding extra'],
  'En <b>ECB</b> bloques iguales dan cifrados iguales: el <b>patrón</b> se ve. <b>GCM</b> cifra como CTR y además <b>autentica</b> (AEAD), con un IV único por mensaje. Es el de TLS 1.3.');
Q('seguridad', 'sg10', 'En criptografía asimétrica, ¿para qué sirve la <b>clave pública</b> de alguien?',
  ['Cifrar para que solo él lea, y verificar sus firmas', 'Firmar documentos en su nombre ante terceros', 'Descifrar los mensajes que otros le envían a él', 'Regenerar su clave privada si la llega a perder'],
  'La <b>pública</b> se reparte: con ella <b>cifras</b> para el dueño y <b>verificas</b> su firma. La <b>privada</b> es secreta: el dueño <b>descifra</b> y <b>firma</b> con ella.');
Q('seguridad', 'sg11', '¿Cómo funciona la <b>firma digital</b> de Alice?',
  ['Cifra el hash con su privada; Bob lo descifra con la pública de Alice y compara', 'Cifra el mensaje con la pública de Bob; Bob lo descifra con su propia privada', 'Cifra el hash con la pública de Bob; Bob lo descifra con su clave privada', 'Adjunta su contraseña al mensaje; Bob la compara con la que tiene registrada'],
  'Firma = <b>hash del mensaje cifrado con la clave privada</b> del emisor. El receptor la descifra con la <b>pública</b> del emisor, calcula el hash del mensaje recibido y compara: si coinciden, es <b>auténtico e íntegro</b>.');
Q('seguridad', 'sg12', '¿Por qué las contraseñas se guardan con <b>bcrypt o Argon2</b> y no con SHA-256 directo?',
  ['Porque son deliberadamente lentos e incluyen salt, lo que frena la fuerza bruta', 'Porque SHA-256 es reversible y permite recuperar la contraseña', 'Porque bcrypt cifra la contraseña y se puede descifrar si el usuario la olvida', 'Porque SHA-256 produce colisiones con cualquier contraseña corta'],
  'SHA-256 es <b>rápido</b>: bueno para integridad, malo para contraseñas, porque un atacante prueba miles de millones por segundo. bcrypt y Argon2 son <b>lentos a propósito</b> (factor de costo) y traen <b>salt</b> aleatorio.');
Q('seguridad', 'sg13', 'Si cambias "hola" por "Hola", el SHA-256 cambia completamente. ¿Cómo se llama esa propiedad?',
  ['Efecto avalancha', 'Resistencia a colisiones', 'Irreversibilidad', 'Determinismo'],
  '<b>Avalancha</b>: un cambio mínimo en la entrada produce un hash totalmente distinto. Las otras propiedades: <b>determinista</b> (misma entrada → mismo hash), <b>irreversible</b> y <b>resistente a colisiones</b>.');
Q('seguridad', 'sg14', 'Un usuario cambia <code>/pedidos/41</code> por <code>/pedidos/42</code> en la URL y ve el pedido de otra persona. ¿Qué vulnerabilidad es y cómo se mitiga?',
  ['IDOR: verificar en el backend que el recurso es del usuario', 'SQL injection: sanitizar los parámetros recibidos en la URL', 'MITM: activar TLS obligatorio en todos los endpoints de la API', 'Falta de rate limiting: limitar las peticiones por cada IP'],
  '<b>IDOR</b> (Insecure Direct Object Reference): acceder al recurso de otro solo cambiando su ID. La mitigación es verificar el <b>ownership</b> en el backend: que el pedido 42 sea del usuario que lo pide.');
Q('seguridad', 'sg15', '¿Qué agrega <b>mTLS</b> respecto de TLS normal?',
  ['Que el cliente también presenta un certificado: autenticación mutua', 'Que el tráfico se cifra dos veces, una por cada lado de la conexión', 'Que ya no hacen falta certificados ni una autoridad certificadora', 'Que el servidor deja de presentar certificado y solo lo pide el cliente'],
  'En TLS normal solo el <b>servidor</b> se autentica. En <b>mTLS</b> ambos presentan certificados verificados por la CA. Es la base de <b>Zero Trust</b> entre microservicios: "nunca confiar, siempre verificar" cada llamada.');
Q('seguridad', 'sg16', '¿Para qué sirve un <b>correlation ID</b> en logs distribuidos?',
  ['Relacionar los logs que distintos servicios generan para una misma petición', 'Cifrar las líneas de log para que nadie pueda modificarlas después', 'Ordenar por hora los logs de cada servidor según su reloj local', 'Identificar al usuario en los logs sin tener que guardar su nombre'],
  'Se genera al entrar la petición (en el API gateway) y viaja en un header a cada servicio. Cada log lo incluye, así se reconstruye el <b>trace completo</b>: sin él, errores en API, DB y AUTH parecen eventos sueltos.');
Q('seguridad', 'sg17', 'En los logs ves 500 intentos de login fallidos para <code>admin</code> desde la misma IP en 5 segundos. ¿Qué ataque es?',
  ['Fuerza bruta', 'SQL injection', 'Escalamiento de privilegios', 'IDOR'],
  'Muchos <b>FAIL de autenticación</b> desde la misma IP en poco tiempo es la señal de <b>fuerza bruta</b>. Se mitiga con rate limiting y bloqueo temporal.');
Q('seguridad', 'sg18', '¿Dónde deben guardarse los secrets (claves, contraseñas de BD) de 100 microservicios en producción?',
  ['En un gestor de secretos como Vault o un KMS, nunca hardcodeados en el código', 'En el código fuente, en un archivo de constantes compartido', 'En variables de entorno escritas en el Dockerfile', 'En el payload de cada JWT, para que viajen con las peticiones'],
  'Regla de oro: <b>nunca hardcodear secrets</b>. Se usan <b>Vault</b> (secretos dinámicos y auditoría de accesos), <b>PKI</b> con certificados de corta duración o un <b>Cloud KMS</b> (las claves no salen del HSM).');

/* =================== Fuera del temario: cloud y Docker =================== */
Q('cloud', 'cl01', 'En <b>PaaS</b> (por ejemplo, Heroku), ¿qué gestionas tú?',
  ['Solo la aplicación y los datos', 'Desde el sistema operativo hacia arriba', 'Nada: solo usas una aplicación terminada', 'Solo los servidores físicos y la red'],
  'En <b>IaaS</b> (EC2) gestionas desde el sistema operativo hacia arriba. En <b>PaaS</b>, solo la <b>aplicación y los datos</b>. En <b>SaaS</b> (Gmail, Slack) solo usas la aplicación.');
Q('cloud', 'cl02', '¿Cuál de estos es un ejemplo de <b>SaaS</b>?',
  ['Gmail', 'AWS EC2', 'Google App Engine', 'Azure VMs'],
  '<b>SaaS</b> = usar una aplicación terminada (Gmail, Slack, GitHub). EC2 y Azure VMs son <b>IaaS</b>; App Engine es <b>PaaS</b>.');
Q('cloud', 'cl03', 'Según la analogía de la clase, ¿qué relación hay entre una <b>imagen</b> y un <b>contenedor</b> de Docker?',
  ['Imagen = clase (plantilla inmutable); contenedor = objeto (instancia ejecutándose)', 'Imagen = objeto en ejecución; contenedor = la plantilla desde donde se crea', 'Son lo mismo: imagen es el nombre en Linux y contenedor el nombre en Windows', 'El contenedor agrupa varias imágenes, igual que un registry como Docker Hub'],
  '<b>Imagen</b> = plantilla inmutable (SO base + dependencias + app), creada con <code>docker build</code>. <b>Contenedor</b> = proceso aislado que se ejecuta desde una imagen con <code>docker run</code>.');
Q('cloud', 'cl04', '¿Qué problema resuelven los contenedores?',
  ['El "funciona en mi máquina": llevan app, dependencias y config a todos lados', 'Que los servidores físicos se queden sin RAM al correr muchas aplicaciones', 'Que el código fuente se pueda ejecutar sin compilarlo antes en cada máquina', 'Que cada usuario necesite instalar un sistema operativo distinto para la app'],
  'Entre el laptop y producción cambian versiones (Ubuntu, Python, Redis), variables de entorno y librerías. El contenedor lleva <b>todo lo necesario</b>, y la app funciona igual en desarrollo, staging y producción.');
Q('cloud', 'cl05', '¿Para qué sirve <b>Docker Compose</b>?',
  ['Definir y levantar juntos varios contenedores con un solo comando', 'Construir una sola imagen más rápido usando varios núcleos', 'Subir las imágenes a AWS automáticamente después de cada build', 'Convertir un contenedor en una máquina virtual completa'],
  'Con un <code>docker-compose.yml</code> se describen todos los servicios, sus imágenes y puertos, y <code>docker-compose up</code> los levanta juntos.');

/* =====================================================================
   SEGUNDO BANCO: preguntas nuevas para que el simulacro no se repita
   ===================================================================== */

/* ---- POSIX ---- */
Q('posix', 'po23', '¿Cuántos procesos hay en total (contando el original) después de ejecutar esto?',
  ['4', '3', '2', '6'],
  'El primer <code>fork()</code> deja 2 procesos. <b>Ambos</b> ejecutan el segundo fork, y cada uno se duplica: 2 × 2 = <b>4</b>. Regla: n forks seguidos producen 2ⁿ procesos.',
  `fork();
fork();`);
Q('posix', 'po24', '¿Cuántos procesos hay en total (contando el original) al terminar este ciclo?',
  ['8', '4', '3', '6'],
  'En cada vuelta, <b>todos</b> los procesos que existen hacen fork y se duplican: 1 → 2 → 4 → <b>8</b>. Los hijos también siguen el ciclo, porque heredan el valor de i.',
  `for (int i = 0; i < 3; i++) {
    fork();
}`);
Q('posix', 'po25', '¿Qué se imprime? (la salida va a un terminal y "A" no termina en \\n)',
  ['"AB" dos veces: el buffer con "A" se copió al hijo', '"A" una vez y "B" dos veces, en ese orden', '"AB" una sola vez, porque solo el padre imprime', '"A" dos veces y "B" una vez, solo en el hijo'],
  'printf guarda "A" en un <b>buffer</b> y no lo escribe hasta ver un \\n. El fork <b>copia la memoria</b>, buffer incluido, así que ambos procesos tienen "A" pendiente y luego agregan "B\\n": sale <b>AB dos veces</b>. Se evita con <code>fflush(stdout)</code> antes del fork.',
  `printf("A");
fork();
printf("B\\n");`);
Q('posix', 'po26', 'El padre termina mientras el hijo sigue corriendo. ¿Qué retorna <code>getppid()</code> en el hijo?',
  ['El PID del proceso que lo adoptó (init o un subreaper)', 'El PID del padre original, aunque ya no exista', '0, porque el hijo quedó sin padre', '-1, y errno indica que el padre murió'],
  'Un hijo sin padre es un <b>huérfano</b>. El kernel se lo asigna a <b>init</b> (PID 1) o a un proceso "subreaper", que se encarga de recogerlo cuando termine.');
Q('posix', 'po27', '<code>waitpid(pid, &st, WNOHANG)</code> retorna <b>0</b>. ¿Qué significa?',
  ['Que el hijo sigue vivo: no hay estado que recoger todavía', 'Que el hijo terminó con exit(0)', 'Que ocurrió un error y hay que revisar errno', 'Que el hijo ya fue recogido antes por otro wait'],
  'Con <b>WNOHANG</b>, waitpid no se bloquea: retorna el <b>PID</b> si recogió un hijo terminado, <b>0</b> si el hijo aún no termina y <b>-1</b> si hay error. El código de salida va en <code>st</code>, no en el retorno.');
Q('posix', 'po28', 'Tras <code>waitpid(pid, &st, 0)</code>, <code>WIFEXITED(st)</code> es <b>falso</b>. ¿Qué indica?',
  ['Que el hijo no terminó con exit; por ejemplo, lo mató una señal', 'Que el hijo terminó con exit(0), sin errores de ningún tipo', 'Que el hijo todavía se está ejecutando y no ha terminado', 'Que waitpid falló y la variable st no tiene información'],
  'WIFEXITED es verdadero solo si el hijo terminó <b>normalmente</b> (exit o return de main). Si lo mató una señal (por ejemplo, un SIGKILL), es falso y <code>WIFSIGNALED(st)</code> es verdadero. En ese caso WEXITSTATUS no tiene sentido.');
Q('posix', 'po29', 'Un programa hace <code>fork()</code> y <b>después</b> cada proceso llama a <code>pipe(fd)</code>. ¿Pueden comunicarse por ese pipe?',
  ['No: cada uno creó un pipe distinto y no comparten ninguno', 'Sí: pipe() siempre conecta al padre con sus hijos', 'Sí, siempre que usen los mismos números de fd', 'Solo si el padre escribe y el hijo lee'],
  'Un pipe se hereda solo si existe <b>antes</b> del fork. Si cada proceso lo crea después, tiene <b>su propio pipe</b>, aunque los números de fd coincidan. Regla: <b>pipe() primero, fork() después</b>.');
Q('posix', 'po30', 'El padre envía por <code>p1</code> y el hijo responde por <code>p2</code>. ¿De qué descriptor lee el padre la respuesta?',
  ['p2[0]', 'p1[0]', 'p2[1]', 'p1[1]'],
  'La respuesta viaja por <b>p2</b> (hijo → padre). El hijo escribe en <b>p2[1]</b> y el padre lee de <b>p2[0]</b>. En cada pipe, [0] es lectura y [1] escritura.',
  `int p1[2], p2[2];
pipe(p1);     /* padre -> hijo */
pipe(p2);     /* hijo -> padre */`);
Q('posix', 'po31', 'El padre pide <code>read(fd, buf, 100)</code> en un pipe y recibe <b>20</b>. ¿Qué significa?',
  ['Es normal: había 20 bytes; el resto puede llegar después', 'Hubo un error de lectura y se perdieron los otros 80 bytes', 'El escritor cerró el pipe justo después de esos 20 bytes', 'El pipe tiene un límite fijo de 20 bytes por cada lectura'],
  'read retorna <b>lo que haya disponible</b>, hasta el máximo pedido. Leer menos no es un error ni significa fin. El fin se indica con <b>0</b>, y los errores con -1.');
Q('posix', 'po32', 'Un servidor escribe a un cliente que ya se desconectó y el servidor <b>muere sin mensaje</b>. ¿Qué pasó y cómo se evita?',
  ['Recibió SIGPIPE; se ignora con signal(SIGPIPE, SIG_IGN) y se revisa EPIPE', 'Recibió SIGCHLD; se instala un handler con waitpid', 'Se llenó el buffer del socket; se usa un buffer más grande', 'El cliente le envió un SIGKILL; hay que bloquear esa señal'],
  'Escribir en una conexión cerrada genera <b>SIGPIPE</b>, que mata el proceso por defecto. Ignorándola, <code>write</code>/<code>send</code> retorna -1 con <b>errno = EPIPE</b>, y el servidor puede cerrar ese cliente y seguir atendiendo a los demás.');
Q('posix', 'po33', 'Un proceso usa 2 GB de memoria y hace fork. ¿Por qué el fork es casi instantáneo?',
  ['Copy-on-write: no copia los 2 GB, comparte páginas hasta que alguien escribe', 'Porque el hijo no recibe memoria, solo los descriptores abiertos', 'Porque el kernel comprime la memoria antes de copiarla al hijo', 'Porque el hijo usa la memoria del padre para siempre, sin copia'],
  'Gracias a <b>copy-on-write</b>, el fork solo duplica las tablas de páginas. Las páginas se copian <b>de a una</b> cuando alguno escribe en ellas. Así fork es barato aunque el proceso sea grande.');
Q('posix', 'po34', 'El padre instala un handler para SIGTERM, luego hace fork, y después alguien envía SIGTERM <b>al hijo</b>. ¿Qué pasa?',
  ['El hijo ejecuta el mismo handler, porque lo heredó', 'El hijo termina, porque los handlers no se heredan', 'La señal se redirige al padre, que la maneja', 'El hijo la ignora hasta instalar su propio handler'],
  'Los <b>handlers instalados antes del fork se heredan</b>: el hijo reacciona igual que el padre. (Se perderían si el hijo hiciera exec()).');
Q('posix', 'po35', '¿Por qué <code>kill -9</code> no elimina un proceso <b>zombie</b>?',
  ['Porque ya está muerto: desaparece cuando el padre lo recoge', 'Porque los zombies ignoran todas las señales, incluida SIGKILL', 'Porque solo el usuario root puede enviar señales a un zombie', 'Porque kill -9 solo afecta a procesos en primer plano'],
  'Un zombie <b>ya terminó</b>: es solo una entrada en la tabla de procesos esperando que el padre lea su estado. Desaparece cuando el padre hace wait, o cuando el padre muere e init lo adopta y lo recoge.');
Q('posix', 'po36', 'Tras <code>socketpair(AF_UNIX, SOCK_STREAM, 0, sv)</code> y un fork, ¿cómo suelen repartirse los extremos?',
  ['El padre usa sv[0] y cierra sv[1]; el hijo, al revés', 'El padre lee de sv[0] y el hijo escribe en ese mismo sv[0]', 'Ambos usan sv[0], y sv[1] queda reservado para los errores', 'Cada uno necesita además un pipe propio para poder responder'],
  'Los dos extremos son <b>bidireccionales</b>: cada proceso se queda con uno y cierra el otro. Lo que el padre escribe en sv[0] lo lee el hijo en sv[1], y viceversa. No hace falta un segundo canal.');
Q('posix', 'po37', 'El lector de un pipe es muy lento y el pipe se <b>llena</b> (en Linux, unos 64 KB). ¿Qué le pasa al escritor?',
  ['write() se bloquea hasta que el lector libere espacio', 'write() descarta los datos que no caben', 'write() retorna 0 y el escritor debe reintentar', 'El kernel agranda el pipe sin límite'],
  'Un pipe tiene un buffer de tamaño fijo. Si se llena, <code>write</code> <b>se bloquea</b> hasta que el lector consuma datos. Es una forma natural de <b>back-pressure</b>: el rápido espera al lento.');

/* ---- Sockets ---- */
Q('sockets', 'so16', '¿Cuál es la secuencia típica de un <b>cliente</b> TCP?',
  ['socket → connect → send/recv → close', 'socket → bind → listen → accept', 'connect → socket → send/recv → close', 'socket → accept → send/recv → close'],
  'El cliente no necesita bind (el sistema le asigna un puerto) ni listen/accept: crea el socket y hace <b>connect</b> a la IP y puerto del servidor.');
Q('sockets', 'so17', '¿Qué hace <code>accept()</code> si no hay ninguna conexión pendiente?',
  ['Se bloquea hasta que llegue un cliente', 'Retorna 0 de inmediato', 'Retorna -1 con errno = ECONNRESET', 'Crea una conexión vacía para usar después'],
  'En un socket bloqueante, <code>accept</code> <b>espera</b> hasta que haya una conexión en la cola del backlog. Por eso el servidor queda "detenido" en accept cuando no hay clientes.');
Q('sockets', 'so18', 'Un servidor llama a <code>close()</code> en cada conexión antes que sus clientes. ¿Dónde se acumulan las conexiones en TIME_WAIT?',
  ['En el servidor, porque es el que cierra primero', 'En los clientes, porque reciben el FIN', 'En ninguno: TIME_WAIT solo ocurre con errores', 'En ambos por igual, sin importar quién cierra'],
  'TIME_WAIT le toca a quien hace el <b>cierre activo</b> (envía el primer FIN). Si siempre cierra el servidor, él acumula TIME_WAIT. Los clientes pasan por CLOSE_WAIT hasta que cierran.');
Q('sockets', 'so19', 'En el hijo que atiende a un cliente, <code>recv()</code> retorna 0. ¿Qué debería hacer?',
  ['Cerrar el socket del cliente y terminar el hijo', 'Volver a llamar recv(), porque el mensaje aún no llega', 'Enviar un mensaje vacío para confirmar la conexión', 'Reiniciar la conexión con connect()'],
  'recv = 0 es un <b>cierre ordenado</b>: el cliente no enviará nada más. Lo correcto es <code>close()</code> y terminar. Si no cierra, ese socket queda en <b>CLOSE_WAIT</b>.');
Q('sockets', 'so20', '¿Para qué sirve <code>htons(8080)</code> al llenar <code>sin_port</code>?',
  ['Convierte el puerto al orden de bytes de la red', 'Valida que el puerto sea mayor a 1024', 'Convierte el número de puerto a texto', 'Reserva el puerto en el sistema operativo'],
  'Los números en la red van en <b>big-endian</b> (orden de red). <code>htons</code> = host to network short. Sin él, en una máquina little-endian el servidor escucharía en otro puerto.');
Q('sockets', 'so21', 'Después de un recv, el buffer acumulado tiene <code>"PING\\nPO"</code>. ¿Qué hace un parser correcto?',
  ['Procesa "PING" y guarda "PO" para completarlo con el próximo recv', 'Procesa "PING" y "PO" como dos comandos separados', 'Descarta todo, porque el mensaje vino mezclado', 'Espera a que el buffer termine en \\n para procesar algo'],
  'Se extrae cada línea <b>completa</b> (hasta el \\n) y se procesa. Lo que queda sin \\n es un <b>mensaje a medias</b>: se guarda en el buffer hasta que llegue el resto ("NG\\n").');
Q('sockets', 'so22', '¿Qué retorna <code>sscanf("MOVE 3 abc", "MOVE %d %d", &a, &b)</code>?',
  ['1', '2', '0', '-1'],
  'Lee "MOVE" (texto fijo), luego <code>%d</code> = 3 (asigna a) y después intenta <code>%d</code> con "abc", que falla. Asignó <b>1</b> campo. Por eso se valida <code>== 2</code>: este mensaje está mal formado.');
Q('sockets', 'so23', '¿En qué momento hay que llamar a <code>setsockopt(..., SO_REUSEADDR, ...)</code>?',
  ['Antes de bind()', 'Después de listen()', 'Después de accept()', 'Antes de cada recv()'],
  'SO_REUSEADDR afecta cómo <b>bind</b> verifica si el puerto está ocupado (por ejemplo, por conexiones en TIME_WAIT). Llamarlo después del bind no sirve.');
Q('sockets', 'so24', '¿Qué imprime <code>printf("[%s] conectado\\n", ctime(&t));</code>?',
  ['La fecha, un salto de línea, y "] conectado" en la línea siguiente', 'La fecha y "conectado" en la misma línea, entre corchetes', 'Basura, porque ctime retorna un número', 'Nada, porque ctime necesita memoria reservada antes'],
  'El texto de <code>ctime</code> <b>termina en \'\\n\'</b>. Al ponerlo dentro de los corchetes, el salto de línea queda antes del "]". Hay que quitar el \\n o usar otro formato.');

/* ---- Raft ---- */
Q('raft', 'ra14', 'Un follower no recibe heartbeats antes de que venza su election timeout. ¿Qué hace?',
  ['Pasa a candidato, sube su term, se vota y pide votos', 'Se proclama líder y envía AppendEntries a todos los nodos', 'Espera otro timeout completo antes de tomar cualquier acción', 'Le pide al líder que reenvíe el último heartbeat perdido'],
  'Sin heartbeat asume que no hay líder: pasa a <b>candidato</b>, hace <b>term + 1</b>, se <b>vota a sí mismo</b> y pide votos con <b>RequestVote</b>. Necesita mayoría para ganar.');
Q('raft', 'ra15', '¿Cuántos nodos caídos tolera un clúster Raft de <b>3 nodos</b>?',
  ['1', '0', '2', '3'],
  'Quórum = ⌊3/2⌋ + 1 = 2. Con 1 caído quedan 2, que alcanzan; con 2 caídos queda 1, que no. Regla: con N = 2f + 1 nodos se toleran <b>f</b> fallas.');
Q('raft', 'ra16', 'Clúster de 5 nodos con uno caído: dos candidatos del mismo term reciben 2 votos cada uno. ¿Qué pasa?',
  ['Split vote: nueva elección con term mayor', 'Gana el candidato con el ID más alto del clúster', 'Ambos son líderes hasta que uno de ellos se caiga', 'Gana el que haya enviado RequestVote primero'],
  'Es un <b>split vote</b>: ninguno llega a 3. Los candidatos esperan un timeout <b>aleatorio</b> y uno se postula de nuevo con <b>term + 1</b>, normalmente antes que el otro.');
Q('raft', 'ra17', 'Un candidato pide el voto a un nodo cuyo log es <b>más actualizado</b> que el del candidato. ¿Qué hace ese nodo?',
  ['Niega el voto: el líder debe tener todo lo ya confirmado', 'Vota igual, porque aún no votó en ese term', 'Vota y además le envía su log para que lo copie', 'Se convierte él mismo en líder sin elección'],
  'Regla de seguridad: solo se vota por un candidato cuyo log esté <b>al menos tan actualizado</b> como el propio. Así un nodo atrasado no puede ganar y borrar entradas ya confirmadas.');
Q('raft', 'ra18', 'En un clúster de 5, el líder replicó una entrada en <b>2 followers</b>. ¿Está committed?',
  ['Sí: con el propio líder son 3 de 5, que es mayoría', 'No: necesita que la tengan los 4 followers', 'No: necesita 3 followers además del líder', 'Solo si el cliente ya recibió la respuesta'],
  'La entrada está en el líder + 2 followers = <b>3 de 5</b>, que es mayoría. El líder la cuenta como committed y avisa del nuevo commit index en el siguiente AppendEntries.');
Q('raft', 'ra19', '¿Qué relación debe haber entre el intervalo de heartbeat y el election timeout?',
  ['El heartbeat debe ser mucho más frecuente que el timeout', 'Deben ser iguales para que el sistema esté sincronizado', 'El timeout debe ser más corto que el heartbeat', 'No hay relación: son configuraciones independientes'],
  'Si los heartbeats llegan menos seguido que el timeout, los followers iniciarían elecciones con un líder sano. Por eso el heartbeat va, por ejemplo, cada 50 ms, y el timeout es de 150–300 ms.');
Q('raft', 'ra20', 'El líder viejo, aislado en la minoría, recibe una escritura de un cliente. ¿Qué pasa con ella?',
  ['La agrega a su log, pero nunca la confirma ni responde OK', 'La confirma, porque él sigue siendo el líder', 'La reenvía al nuevo líder, que la confirma', 'La rechaza de inmediato, porque sabe que está aislado'],
  'El líder viejo <b>no sabe</b> que fue reemplazado: agrega la entrada, pero nunca juntará mayoría para confirmarla. El cliente no recibe confirmación, y al volver la red esa entrada se sobrescribe.');
Q('raft', 'ra21', 'Un follower recibe un AppendEntries cuyo <code>prev_log_index</code>/<code>prev_log_term</code> no coincide con su log. ¿Qué pasa?',
  ['Lo rechaza; el líder reintenta con un índice anterior', 'Lo acepta igual y agrega la entrada al final de su log', 'Se postula como candidato por tener un log distinto', 'Le envía su propio log al líder para que se corrija'],
  'Es la verificación de <b>Log Matching</b>: el follower solo agrega si su log coincide hasta ese punto. Si no, rechaza; el líder retrocede hasta encontrar dónde coinciden y desde ahí el follower <b>sobrescribe</b> lo que difiere.');

/* ---- Consistencia ---- */
Q('consistencia', 'co14', 'Durante una partición, un sistema bancario rechaza transferencias en el lado minoritario. ¿Qué eligió según CAP?',
  ['Consistencia (CP)', 'Disponibilidad (AP)', 'Tolerancia a particiones sola', 'Ninguna, porque rechazó operaciones'],
  'Rechazar operaciones para no tener saldos distintos en cada lado es elegir <b>consistencia</b> sobre disponibilidad: es un sistema <b>CP</b>.');
Q('consistencia', 'co15', 'Durante una partición, un carrito de compras sigue aceptando productos en ambos lados y los une al volver la red. ¿Qué eligió?',
  ['Disponibilidad (AP)', 'Consistencia (CP)', 'Linearizabilidad', 'Replicación síncrona'],
  'Seguir aceptando operaciones y <b>reconciliar después</b> es elegir <b>disponibilidad</b>: un sistema <b>AP</b> con consistencia eventual.');
Q('consistencia', 'co16', 'P1 escribe x = 1 y después y = 1. P2 lee y = 1 y después lee x = 0. ¿Viola la consistencia secuencial?',
  ['Sí: si vio y = 1, debió ver x = 1, que P1 escribió antes', 'No: la secuencial no exige ningún orden entre procesos', 'No: solo la linearizabilidad prohíbe este resultado', 'Sí, pero solo si las operaciones fueron en paralelo'],
  'La secuencial exige un orden global que respete el <b>orden de programa</b> de cada proceso. En P1, x = 1 va antes que y = 1. Si P2 ve y = 1, en ese orden global x = 1 ya ocurrió, así que no puede leer x = 0.');
Q('consistencia', 'co17', '¿Qué modelo se comporta como si hubiera <b>una sola copia</b> del dato, respetando el tiempo real?',
  ['Linearizabilidad', 'Consistencia secuencial', 'Read-your-writes', 'Consistencia eventual'],
  'La <b>linearizabilidad</b> da la ilusión de una sola copia: cada operación tiene efecto en un instante entre su inicio y su fin, y el orden respeta el reloj real.');
Q('consistencia', 'co18', '¿Cuál es una forma simple de garantizar <b>read-your-writes</b> con varias réplicas?',
  ['Leer de la réplica donde el usuario escribió', 'Usar replicación asíncrona con más réplicas', 'Leer siempre de la réplica más cercana al usuario', 'Configurar los quórums con W = 1 y R = 1'],
  'Si el usuario lee de la <b>misma réplica</b> donde escribió (o del primario), siempre verá su propia escritura. Otra opción es usar quórums con W + R > N.');
Q('consistencia', 'co19', 'Con N = 5, ¿qué configuración tolera 2 réplicas caídas tanto al leer como al escribir, y además lee lo último?',
  ['W = 3, R = 3', 'W = 5, R = 1', 'W = 1, R = 5', 'W = 2, R = 2'],
  'W = 3 y R = 3: 3 + 3 = 6 > 5 ✓, y con 2 caídas quedan 3 réplicas, suficientes para ambas. W = 5 no tolera ninguna caída al escribir; W = 2, R = 2 suma 4 y no garantiza leer lo último.');
Q('consistencia', 'co20', 'Con replicación síncrona a 3 réplicas, una de ellas se vuelve muy lenta. ¿Qué efecto tiene?',
  ['Todas las escrituras se vuelven lentas, porque se espera a esa réplica', 'Solo las lecturas de esa réplica se vuelven lentas', 'Nada: la replicación síncrona no espera a las réplicas', 'Esa réplica se descarta y las escrituras siguen rápidas'],
  'Síncrona = confirmar recién cuando las réplicas aplicaron el cambio. Cada escritura tarda lo que tarde la <b>réplica más lenta</b>: es el costo de la consistencia fuerte.');

/* ---- Colas ---- */
Q('colas', 'cq25', 'Con entrega <b>at-least-once</b> y un consumidor <b>idempotente</b>, ¿qué se logra en la práctica?',
  ['El mismo efecto que exactly-once: los duplicados no cambian nada', 'Que el broker deje de reenviar mensajes duplicados', 'Que se pierdan mensajes, como en at-most-once', 'Orden global de todos los mensajes del sistema'],
  'At-least-once no pierde mensajes y puede duplicar. Si procesar un duplicado no cambia nada (idempotencia), el resultado es <b>como si cada mensaje se procesara una vez</b>.');
Q('colas', 'cq26', 'Con ACK manual, el consumidor procesa un pedido y <b>se cae antes de enviar el ACK</b>. ¿Qué pasará?',
  ['Se reentrega, y el pedido podría procesarse dos veces', 'Se pierde, porque el broker ya lo había entregado antes', 'No se reenvía, porque el broker sabe que se procesó', 'Pasa directo a la dead letter queue para revisarlo'],
  'El broker nunca recibió la confirmación, así que lo <b>reentrega</b>. Como el procesamiento sí ocurrió, se produce un <b>duplicado</b>: hay que deduplicar o ser idempotente.');
Q('colas', 'cq27', 'Un topic tiene 3 particiones y los eventos se envían con el ID del usuario como key. ¿Qué orden se garantiza?',
  ['Los eventos de un mismo usuario llegan en orden', 'Todos los eventos del topic llegan en orden', 'Ningún orden, ni siquiera por usuario', 'El orden de cada partición entre todos los usuarios'],
  'Misma key → misma partición → <b>orden FIFO</b> para ese usuario. Entre usuarios distintos (posiblemente en otras particiones) no hay garantía.');
Q('colas', 'cq28', 'Los eventos "A" (key = 1) y "B" (key = 2) se envían en ese orden. ¿Se procesarán en ese orden?',
  ['No necesariamente: pueden ir a particiones distintas', 'Sí, porque Kafka respeta el orden de envío', 'Sí, si el consumidor usa ACK manual', 'No, Kafka siempre los invierte'],
  'Con keys distintas pueden caer en <b>particiones distintas</b>, y entre particiones no hay orden garantizado. Si importa su orden relativo, deben compartir key.');
Q('colas', 'cq29', 'Un topic tiene <b>6 particiones</b> y un consumer group tiene <b>3 consumidores</b>. ¿Cómo se reparten?',
  ['2 particiones por consumidor', '6 particiones para cada consumidor', '1 partición por consumidor y 3 sin asignar', 'Todas al primero y los otros 2 de respaldo'],
  'Cada partición la procesa un solo miembro del grupo, y se reparten entre todos: 6 / 3 = <b>2 por consumidor</b>.');
Q('colas', 'cq30', 'Dos consumer groups <b>distintos</b> están suscritos al mismo topic. ¿Qué recibe cada grupo?',
  ['Cada grupo recibe todos los mensajes del topic', 'Los mensajes se reparten entre los dos grupos', 'Solo el grupo que se suscribió primero recibe', 'Cada grupo recibe solo las particiones pares'],
  'El reparto de particiones ocurre <b>dentro</b> de un grupo. Grupos distintos son independientes: cada uno recibe <b>todos</b> los mensajes. Así funciona pub-sub en Kafka.');
Q('colas', 'cq31', '¿Por qué no se reintenta para siempre un mensaje que falla siempre?',
  ['Porque bloquearía la cola; tras N intentos va a la DLQ', 'Porque el broker borra los mensajes tras un minuto', 'Porque cada reintento duplica el mensaje en la cola', 'Porque el productor deja de enviar mientras se reintenta'],
  'Un mensaje "venenoso" (mal formado, con un bug) fallaría <b>siempre</b> y frenaría al resto. Tras N intentos se mueve a la <b>dead letter queue</b> para revisarlo, y el flujo sigue.');
Q('colas', 'cq32', 'El productor genera 1000 mensajes/s, el consumidor procesa 200/s y la cola crece sin parar. ¿Qué mecanismo lo resuelve?',
  ['Back-pressure: avisar al productor que reduzca su tasa', 'Auto-ack, para que el consumidor confirme más rápido', 'Una dead letter queue para los mensajes que sobran', 'At-most-once, para descartar los mensajes lentos'],
  'Con <b>back-pressure</b>, el consumidor o el broker señalizan al productor que <b>baje el ritmo</b>, antes de que la cola agote la memoria o se pierdan mensajes. (Otra opción es agregar consumidores).');
Q('colas', 'cq33', 'En request-reply sobre un broker, ¿cómo sabe el solicitante qué respuesta corresponde a cada solicitud?',
  ['Cada solicitud lleva un ID de correlación que la respuesta repite', 'El broker entrega las respuestas en el mismo orden', 'El solicitante espera la respuesta antes de enviar otra', 'Cada respuesta va a una cola distinta por mensaje'],
  'Como solicitud y respuesta viajan desacopladas, se usa un <b>correlation ID</b>: el solicitante lo pone en la solicitud y el que responde lo copia en la respuesta.');
Q('colas', 'cq34', '¿En qué caso es aceptable usar <b>at-most-once</b>?',
  ['Métricas de CPU, donde perder una muestra no importa', 'Pagos con tarjeta de crédito, que no pueden perderse', 'Pedidos de compra que deben procesarse todos sin falta', 'Transferencias de dinero entre cuentas bancarias'],
  'At-most-once puede <b>perder</b> mensajes. Es aceptable cuando un dato suelto no importa, como telemetría frecuente. Para pagos o pedidos se necesita at-least-once o exactly-once.');

/* ---- Relojes ---- */
Q('relojes', 're08', 'P1 (L = 0) hace un evento local y luego envía m a P2. P2 (L = 0) hace un evento local y luego recibe m. ¿Qué timestamp tiene la recepción en P2?',
  ['3', '2', '1', '4'],
  'P1: local → 1, envío → <b>2</b> (m lleva 2). P2: local → 1, recepción → max(1, 2) + 1 = <b>3</b>.');
Q('relojes', 're09', 'P3 tiene <b>[0, 0, 1]</b> y recibe un mensaje de P1 con <b>[2, 0, 0]</b>. ¿Qué vector queda en P3?',
  ['[2, 0, 2]', '[2, 0, 1]', '[3, 0, 1]', '[2, 1, 2]'],
  'Máximo componente a componente: [2, 0, 1]. Luego P3 incrementa <b>su</b> componente (la tercera): <b>[2, 0, 2]</b>.');
Q('relojes', 're10', 'V(a) = [1, 0, 0] y V(b) = [0, 1, 0]. Con Lamport, ambos podrían tener L = 1. ¿Qué muestra esto?',
  ['Son concurrentes, y Lamport no puede detectarlo', 'a ocurrió antes que b, como indica el vector', 'Son el mismo evento, porque L es igual', 'b ocurrió antes, porque tiene la segunda componente'],
  'Ningún vector es ≤ al otro: son <b>concurrentes</b>. Con Lamport podrían tener el mismo número (o cualquier par), sin poder decir nada. Por eso existen los vectores.');

/* ---- Almacenamiento ---- */
Q('almacen', 'al10', 'Con sharding por <b>hash</b> del ID, ¿qué pasa con la consulta "usuarios con edad entre 20 y 30"?',
  ['Hay que preguntar a todos los shards', 'Basta con preguntar a un solo shard', 'No se puede responder con sharding', 'Se responde con el shard del primer usuario'],
  'El hash reparte los datos sin relación con la edad. Los usuarios de 20 a 30 años pueden estar en <b>cualquier shard</b>, así que hay que consultarlos todos y juntar los resultados.');
Q('almacen', 'al11', '¿Por qué el WAL se escribe de forma <b>secuencial</b>?',
  ['Porque agregar al final del archivo es muy rápido', 'Porque así los datos quedan cifrados en el disco', 'Porque así nunca hace falta hacer replay tras un crash', 'Porque así solo un proceso a la vez puede leerlo'],
  'Agregar al <b>final</b> de un archivo es mucho más rápido que modificar en distintos lugares del disco. La operación queda segura rápido y la estructura principal se actualiza después.');
Q('almacen', 'al12', 'En Chord con <b>1024 nodos</b>, ¿cuántos saltos toma aproximadamente encontrar una clave?',
  ['Unos 10', 'Unos 1024', 'Unos 512', 'Siempre 1'],
  'La finger table permite búsquedas en <b>O(log N)</b>: log₂(1024) = <b>10</b> saltos. Sin fingers, siguiendo solo al sucesor, serían hasta 1023.');
Q('almacen', 'al13', '¿Cuándo actúa el <b>read repair</b>?',
  ['Durante una lectura que detecta réplicas desactualizadas', 'Cada noche, en un proceso de mantenimiento', 'Cuando un nodo se cae y vuelve a la red', 'Antes de cada escritura, para validar las réplicas'],
  'Ocurre <b>al leer</b>: la lectura consulta varias réplicas, y si alguna devuelve una versión vieja, el coordinador le envía la nueva. Las lecturas reparan los datos de paso.');
Q('almacen', 'al14', 'Con event sourcing, ¿cómo se obtiene el saldo actual de una cuenta?',
  ['Reproduciendo sus eventos, a veces desde un snapshot', 'Leyendo el campo saldo, que se sobrescribe en cada cambio', 'Consultando solo el último evento guardado de la cuenta', 'Pidiéndolo a la réplica más actualizada del clúster'],
  'El estado actual <b>no se guarda</b>: se calcula reproduciendo los eventos (depósitos, retiros…). Para no reproducir millones cada vez, se guardan <b>snapshots</b> periódicos y se reproducen solo los eventos posteriores.');

/* ---- Patrones ---- */
Q('patrones', 'pa09', 'Una Saga tiene los pasos 1, 2 y 3. El paso 3 falla. ¿Qué compensaciones se ejecutan?',
  ['Las de los pasos 2 y 1, en ese orden', 'Las de los pasos 1, 2 y 3', 'Solo la del paso 3', 'Ninguna: se reintenta el paso 3'],
  'El paso 3 no se completó, así que no hay nada que deshacer ahí. Se compensan los pasos ya confirmados, en <b>orden inverso</b>: primero el 2, después el 1.');
Q('patrones', 'pa10', 'En 2PC, un participante vota <b>No</b> en la fase de PREPARE. ¿Qué hace el coordinador?',
  ['Envía ABORT a todos los participantes', 'Envía COMMIT a los que votaron Sí', 'Vuelve a preguntar hasta que todos digan Sí', 'Confirma igual, porque la mayoría votó Sí'],
  '2PC exige <b>unanimidad</b>: basta un No (o un silencio) para que el coordinador envíe <b>ABORT</b> a todos. Así la transacción ocurre en todos o en ninguno.');
Q('patrones', 'pa11', 'Con gossip en un clúster de <b>1000 nodos</b>, ¿en cuántas rondas aproximadamente llega la información a todos?',
  ['Unas 10', 'Unas 1000', 'Unas 500', 'Siempre 1'],
  'Gossip converge en <b>O(log N)</b> rondas: cada ronda, aproximadamente se duplica la cantidad de nodos que saben. log₂(1000) ≈ <b>10</b>.');
Q('patrones', 'pa12', '¿Qué desventaja tiene un ID autoincremental central frente a UUID v4 en un sistema distribuido?',
  ['Necesita un coordinador central: cuello de botella y punto de falla', 'Produce colisiones frecuentes cuando varios nodos generan IDs', 'Ocupa más espacio en disco que un UUID de 128 bits', 'Impide ordenar los registros según su fecha de creación'],
  'Un contador central obliga a <b>pedir cada ID</b> a un solo lugar: cuello de botella y punto único de falla. Con UUID v4, cada nodo genera IDs <b>sin coordinarse</b>.');
