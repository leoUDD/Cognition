/* Referencia rápida de C para el ramo: sintaxis básica y patrones del curso.
   referencia.push({ id, grupo, titulo, cuando, texto (HTML), codigo }) */
referencia.push(
/* ================= Sintaxis básica ================= */
{ id: 'simbolos', grupo: 'Sintaxis básica', titulo: 'Cómo leer los símbolos de C',
  texto: `Antes de escribir C conviene saber <b>leer en voz alta</b> cada símbolo. Si puedes decir una línea en español, puedes escribirla. Abajo está cada símbolo con su lectura.`,
  codigo: `void lamport_send(Node *n, int *ts) {   /* "recibe un puntero a Node y un puntero a int" */
    n->clock++;                         /* "al clock del Node apuntado por n, súmale 1"    */
    *ts = n->clock;                     /* "en la caja apuntada por ts, guarda ese clock"  */
}
lamport_send(&p1, &ts);                 /* "llama pasando DÓNDE están p1 y ts"            */`,
  partes: [
    { s: ';', d: `Fin de una instrucción. Como el punto final de una oración.`, ojo: `No va después de <code>}</code> de una función ni después de <code>if (...)</code>. <code>if (x); {...}</code> hace que el if no controle nada. Sí va después de la <code>}</code> de un <code>struct</code> o <code>typedef</code>.` },
    { s: '{  }', d: `Un <b>bloque</b>: agrupa varias instrucciones para que cuenten como una (el cuerpo de una función, de un if o de un for).` },
    { s: '(  )', d: `Tres usos: los parámetros de una función <code>f(a, b)</code>, la condición de <code>if</code>/<code>while</code>/<code>for</code>, y agrupar en una expresión <code>(a + b) * 2</code>.` },
    { s: '[ ]', d: `Índice de un arreglo. <code>v[2]</code> se lee "el elemento 2 de v" (el tercero, porque se parte en 0). En una declaración, <code>char buf[64]</code> dice el tamaño.` },
    { s: '=', d: `<b>Asignar</b>: "guarda en la izquierda el valor de la derecha". <code>x = 5</code>.`, ojo: `<code>if (x = 5)</code> asigna en vez de comparar y siempre es verdadero.` },
    { s: '==   !=', d: `<b>Comparar</b>: "¿son iguales?" / "¿son distintos?". Dan 1 (verdadero) o 0 (falso).`, ojo: `Para strings no sirven: usa <code>strcmp</code>.` },
    { s: '<  >  <=  >=', d: `Menor, mayor, menor o igual, mayor o igual.` },
    { s: '&&   ||   !', d: `"y", "o", "no". <code>if (n > 0 &amp;&amp; buf[0] == 'Q')</code>: las dos deben cumplirse. <code>!terminado</code>: "no terminado".`, ojo: `<code>&amp;&amp;</code> (doble) es lógico. <code>&amp;</code> (simple) es otra cosa: dirección o operación de bits.` },
    { s: '+  -  *  /  %', d: `Aritmética. <code>%</code> es el <b>resto</b> de la división: <code>7 % 3</code> es 1. Sirve para acotar <code>rand() % 6</code> (da 0..5) o saber si es par <code>n % 2 == 0</code>.`, ojo: `<code>7 / 2</code> entre enteros da 3, no 3.5. Para decimales, al menos uno debe ser float: <code>7 / 2.0</code>.` },
    { s: 'x++   x--', d: `Sumar o restar 1. <code>reloj++</code> es lo mismo que <code>reloj = reloj + 1</code>.` },
    { s: 'x += 5', d: `Atajo de <code>x = x + 5</code>. Existen también <code>-=</code>, <code>*=</code>, <code>/=</code>.` },
    { s: '&x', d: `"La <b>dirección</b> de x": dónde vive x en memoria. Se usa para que una función pueda <b>modificar</b> x (scanf, sscanf, tus funciones con punteros).` },
    { s: 'int *p', d: `En una <b>declaración</b>, el <code>*</code> dice el tipo: "p es un puntero a int", es decir, p guarda una dirección.` },
    { s: '*p', d: `En una <b>expresión</b>, el <code>*</code> significa "ve a la caja cuya dirección guarda p". <code>*p = 3</code> escribe 3 allí; <code>int y = *p</code> lee lo que hay.` },
    { s: 'a.campo', d: `Campo de un struct que <b>tienes</b>: <code>p1.clock</code>.` },
    { s: 'p->campo', d: `Campo de un struct que tienes <b>apuntado</b> (p es puntero): <code>n->clock</code>. Es un atajo de <code>(*n).clock</code>.`, ojo: `Regla rápida: variable struct, usas punto; puntero a struct, usas flecha.` },
    { s: `'A'   "A"`, d: `Comilla simple: <b>un</b> carácter (tipo char). Comilla doble: un <b>string</b> (arreglo de char que termina en <code>'\\0'</code>).`, ojo: `<code>'Q'</code> y <code>"Q"</code> no son lo mismo. <code>buf[0] == 'Q'</code> está bien; <code>buf[0] == "Q"</code> está mal.` },
    { s: `\\n   \\0`, d: `Caracteres especiales: <code>\\n</code> es salto de línea; <code>\\0</code> es el carácter 0, que marca el <b>fin de un string</b>.` },
    { s: '#include  #define', d: `Instrucciones para el <b>preprocesador</b>, que actúa antes de compilar. <code>#include</code> trae declaraciones de una biblioteca; <code>#define PORT 5000</code> reemplaza el texto PORT por 5000. No llevan <code>;</code>.` },
    { s: 'cond ? a : b', d: `Operador ternario, un if en una sola expresión: "si cond, a; si no, b". <code>int m = a &gt; b ? a : b;</code>` },
    { s: '/* ... */   //', d: `Comentarios: el compilador los ignora.` }
  ],
  recuerda: `Lee cada línea en voz alta antes de escribirla. Si dices "la dirección de", es <code>&amp;</code>. Si dices "lo apuntado por", es <code>*</code>. Si dices "el campo de… apuntado", es <code>-&gt;</code>.` },
{ id: 'programa', grupo: 'Sintaxis básica', titulo: 'Estructura de un programa',
  texto: 'Todo programa tiene <code>#include</code> arriba (las bibliotecas que usas) y una función <code>main</code>. Cada instrucción termina en <code>;</code>. Los bloques van entre <code>{ }</code>.',
  codigo: `#include <stdio.h>      /* printf */
#include <stdlib.h>     /* exit, atoi, atof, rand */
#include <string.h>     /* strcmp, strcpy, strlen, memset */
#include <unistd.h>     /* fork, pipe, read, write, close, sleep */

int main(int argc, char *argv[]) {     /* argv[1] es el primer argumento */
    printf("Hola %s\\n", argc > 1 ? argv[1] : "mundo");
    return 0;
}` },
{ id: 'tipos', grupo: 'Sintaxis básica', titulo: 'Variables, tipos y printf',
  texto: 'Los tipos más usados son <code>int</code>, <code>float</code>/<code>double</code>, <code>char</code> y <code>char[]</code> para strings. En <code>printf</code>, cada <code>%</code> se reemplaza por un valor, en orden.',
  codigo: `int n = 5;
float v = 3.5f;
char letra = 'A';
char nombre[16] = "ARES-1";          /* string: arreglo de char que termina en '\\0' */

printf("%d\\n", n);         /* entero            -> 5        */
printf("%.2f\\n", v);       /* float, 2 decimales -> 3.50    */
printf("%s\\n", nombre);    /* string            -> ARES-1   */
printf("%c\\n", letra);     /* un carácter        -> A        */
printf("%02X\\n", 10);      /* hexadecimal, 2 dígitos -> 0A  */
printf("%ld\\n", (long)time(NULL));   /* long (con <time.h>)  */` },
{ id: 'control', grupo: 'Sintaxis básica', titulo: 'if, for, while, break y continue',
  texto: 'En C, 0 es falso y cualquier otro número es verdadero. <code>continue</code> salta a la siguiente vuelta; <code>break</code> sale del loop.',
  codigo: `if (x > 10) {
    ...
} else if (x > 5) {
    ...
} else {
    ...
}

for (int i = 0; i < n; i++) { ... }          /* i = 0, 1, ..., n-1 */

int n;
while ((n = recv(fd, buf, sizeof(buf) - 1, 0)) > 0) {   /* leer hasta que cierren */
    if (n < 3) continue;     /* ignora esta vuelta */
    if (buf[0] == 'Q') break; /* sale del while */
}` },
{ id: 'funciones', grupo: 'Sintaxis básica', titulo: 'Funciones',
  texto: 'Primero el tipo de retorno, luego el nombre y los parámetros. <code>void</code> significa que no retorna nada. Una función debe estar declarada <b>antes</b> de usarse. En C no se pueden definir funciones dentro de otras.',
  codigo: `int max2(int a, int b) {
    return a > b ? a : b;        /* operador ternario: cond ? si : no */
}

void saludar(const char *nombre) {   /* const: la función no lo modifica */
    printf("Hola %s\\n", nombre);
}` },
{ id: 'punteros', grupo: 'Sintaxis básica', titulo: 'Punteros, & y ->',
  texto: 'Piensa la memoria como cajas: cada variable es una caja con un <b>valor</b> y una <b>dirección</b> (dónde está). Un puntero es una variable que guarda una dirección. En C las funciones reciben <b>copias</b> de los argumentos; por eso, si una función debe <b>modificar</b> una variable de quien la llama, hay que pasarle su dirección con <code>&amp;</code> y la función escribe ahí con <code>*</code> o <code>-&gt;</code>.',
  codigo: `typedef struct { int clock; char id[8]; } Node;

/* SIN puntero: recibe COPIAS, main no ve los cambios */
void send_malo(Node n, int ts) { n.clock++; ts = n.clock; }

/* CON punteros: recibe DÓNDE están las variables de main */
void lamport_send(Node *n, int *ts) {
    n->clock++;          /* al clock del Node apuntado, súmale 1 (= (*n).clock++) */
    *ts = n->clock;      /* en la caja apuntada por ts, guarda el clock          */
}

void incrementar(int *p) {
    (*p)++;              /* ¡paréntesis! *p++ movería el puntero, no el valor */
}

int main(void) {
    Node p1 = { 0, "P1" };
    int ts;
    lamport_send(&p1, &ts);   /* p1.clock = 1, ts = 1 */
    incrementar(&ts);         /* ts = 2 */
    return 0;
}` },
{ id: 'arreglos', grupo: 'Sintaxis básica', titulo: 'Arreglos y matrices',
  texto: 'Los índices parten en 0. C no revisa los límites: salirse del arreglo es un error silencioso. <code>sizeof(arr) / sizeof(arr[0])</code> da la cantidad de elementos (solo con el arreglo original, no con un puntero).',
  codigo: `int v[3] = {0, 0, 0};          /* v[0], v[1], v[2] */
int fds[3][3][2];              /* 3 x 3 pipes (cada pipe: 2 enteros) */

#define N (sizeof(eventos) / sizeof(eventos[0]))

for (int i = 0; i < 3; i++)
    v[i] = i * 10;` },
{ id: 'structs', grupo: 'Sintaxis básica', titulo: 'struct, typedef y enum',
  texto: 'Un <code>struct</code> agrupa campos. Con <code>typedef</code> le das un nombre corto. Un <code>enum</code> crea constantes con nombre (0, 1, 2…). Asignar un struct a otro con <code>=</code> copia todos sus campos.',
  codigo: `typedef enum { REQUEST, REPLY, RELEASE } MsgType;

typedef struct {
    MsgType type;
    int ts;
    int pid;
} Msg;

Msg m = { REQUEST, 5, 1 };     /* en el orden de los campos */
Msg copia = m;                 /* copia el struct completo */
if (m.type == REQUEST) { ... }` },
{ id: 'strings', grupo: 'Sintaxis básica', titulo: 'Strings: comparar, copiar, armar y leer',
  texto: 'Un string es un <code>char[]</code> terminado en <code>\'\\0\'</code>. <b>Nunca</b> compares con <code>==</code>: usa <code>strcmp</code>. Para <b>armar</b> un mensaje usa <code>snprintf</code> y para <b>leer campos</b> de un mensaje, <code>sscanf</code>.',
  codigo: `char msg[64], id[16];
int seq; float v;

if (strcmp(id, "ARES-1") == 0) { ... }          /* iguales */
if (strncmp(msg, "HELLO", 5) == 0) { ... }       /* empieza con HELLO */

snprintf(msg, sizeof msg, "TELEM %s %d %.2f\\n", id, seq, v);   /* armar */

if (sscanf(msg, "TELEM %15s %d %f", id, &seq, &v) == 3) {     /* leer */
    /* %15s: máximo 15 caracteres (cabe en id[16]) */
    /* sscanf retorna cuántos campos leyó: úsalo para validar */
}
msg[strcspn(msg, "\\n")] = '\\0';     /* quitar el \\n final */
int largo = strlen(msg);
strcpy(destino, origen);              /* copiar (destino debe tener espacio) */` },
{ id: 'conversiones', grupo: 'Sintaxis básica', titulo: 'Conversiones y números al azar',
  texto: '<code>atoi</code> y <code>atof</code> convierten texto a número. <code>rand()</code> da un entero al azar; con <code>%</code> lo acotas. Llama a <code>srand</code> una vez por proceso (en el hijo, después de fork, con <code>getpid()</code>).',
  codigo: `int n = atoi("42");
float v = atof("3.60");

srand(getpid());
int dado = 1 + rand() % 6;                 /* 1..6 */
float rad = (rand() % 1001) / 100.0f;      /* 0.00..10.00 */
int r = rand() % 100;                      /* para probabilidades: r < 20 -> 20 % */` },
{ id: 'memoria', grupo: 'Sintaxis básica', titulo: 'memset, memcpy y memmove',
  texto: '<code>memset</code> llena con un valor (típico: dejar en 0 un struct). <code>memcpy</code> copia bytes. <code>memmove</code> también, pero funciona cuando origen y destino se solapan (lo usa el buffer acumulador).',
  codigo: `struct sockaddr_in addr;
memset(&addr, 0, sizeof addr);           /* todo en 0 */

int a[3] = {1, 2, 3}, b[3];
memcpy(b, a, sizeof a);

memmove(buf, buf + 10, total - 10 + 1);  /* correr el resto al inicio (+1 por el '\\0') */` },
{ id: 'errores', grupo: 'Sintaxis básica', titulo: 'Manejo de errores',
  texto: 'Casi todas las llamadas al sistema retornan <b>−1</b> si fallan. <code>perror</code> imprime el motivo. En prueba no siempre se pide, pero suma puntos en bind, connect y fork.',
  codigo: `if (bind(srv, (struct sockaddr *)&addr, sizeof addr) < 0) {
    perror("bind");          /* ej: "bind: Address already in use" */
    exit(1);
}
pid_t pid = fork();
if (pid < 0) { perror("fork"); exit(1); }` },
/* ================= Patrones del curso ================= */
{ id: 'p-pipe', grupo: 'Patrones del curso', titulo: 'pipe + fork (padre e hijo)', cuando: 'Dos procesos emparentados se pasan datos: sensor → puente, productor → consumidor.',
  texto: 'Orden: <b>pipe() antes de fork()</b>, después cada uno <b>cierra el extremo que no usa</b>. El lector sabe que terminó cuando <code>read</code>/<code>fgets</code> da EOF, y eso solo pasa cuando <b>todos</b> los extremos de escritura están cerrados.',
  codigo: `int fd[2];
pipe(fd);                         /* fd[0] = leer, fd[1] = escribir */
pid_t pid = fork();
if (pid == 0) {                   /* ---- HIJO: escribe ---- */
    close(fd[0]);
    char msg[32];
    int len = snprintf(msg, sizeof msg, "DATO %d\\n", 42);
    write(fd[1], msg, len);
    close(fd[1]);                 /* -> EOF para el padre */
    exit(0);
}
/* ---- PADRE: lee ---- */
close(fd[1]);                     /* si no lo cierras, nunca llega EOF */
FILE *in = fdopen(fd[0], "r");    /* para leer línea a línea */
char linea[64];
while (fgets(linea, sizeof linea, in) != NULL) {
    int x;
    if (sscanf(linea, "DATO %d", &x) == 1) printf("recibí %d\\n", x);
}
fclose(in);
wait(NULL);                       /* recoger al hijo */` },
{ id: 'p-servidor', grupo: 'Patrones del curso', titulo: 'Servidor TCP concurrente (fork por cliente)', cuando: 'Un programa espera conexiones en un puerto y atiende a varios clientes a la vez.',
  texto: 'Son siempre los mismos 5 pasos: <b>socket → bind → listen → accept → fork</b>. El hijo cierra <code>srv</code> y atiende; el padre cierra <code>cli</code> y vuelve a <code>accept</code>. Para no dejar zombis: <code>signal(SIGCHLD, SIG_IGN)</code>.',
  codigo: `#include <sys/socket.h>
#include <netinet/in.h>
#include <signal.h>

int srv = socket(AF_INET, SOCK_STREAM, 0);
int opt = 1;
setsockopt(srv, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof opt);

struct sockaddr_in addr;
memset(&addr, 0, sizeof addr);
addr.sin_family = AF_INET;
addr.sin_addr.s_addr = INADDR_ANY;       /* escuchar en todas las interfaces */
addr.sin_port = htons(PORT);             /* ¡htons! */
bind(srv, (struct sockaddr *)&addr, sizeof addr);
listen(srv, 10);
signal(SIGCHLD, SIG_IGN);                /* sin zombis */

while (1) {
    int cli = accept(srv, NULL, NULL);   /* nuevo descriptor para ESTE cliente */
    if (fork() == 0) {                   /* hijo */
        close(srv);
        atender(cli);                    /* tu protocolo */
        close(cli);
        exit(0);
    }
    close(cli);                          /* padre */
}` },
{ id: 'p-atender', grupo: 'Patrones del curso', titulo: 'Atender un cliente: loop recv → responder', cuando: 'La función que atiende a cada cliente según el protocolo.',
  texto: '<code>recv</code> retorna los bytes leídos, <b>0</b> si el cliente cerró y −1 si hay error. Siempre agrega <code>\'\\0\'</code> antes de tratar el buffer como string. Luego, un <code>if</code> por cada tipo de mensaje del protocolo.',
  codigo: `void atender(int fd) {
    char buf[256], resp[256];
    int n;
    while ((n = recv(fd, buf, sizeof(buf) - 1, 0)) > 0) {
        buf[n] = '\\0';
        char nombre[32];
        if (sscanf(buf, "HOLA %31s", nombre) == 1) {
            snprintf(resp, sizeof resp, "BIENVENIDO %s\\n", nombre);
        } else if (strncmp(buf, "CHAO", 4) == 0) {
            send(fd, "BYE\\n", 4, 0);
            break;
        } else {
            snprintf(resp, sizeof resp, "ERROR\\n");
        }
        send(fd, resp, strlen(resp), 0);
    }
}` },
{ id: 'p-cliente', grupo: 'Patrones del curso', titulo: 'Cliente TCP', cuando: 'Un programa se conecta a un servidor, envía mensajes y lee respuestas.',
  texto: '<b>socket → connect → send/recv → close</b>. La IP en texto se convierte con <code>inet_pton</code> y el puerto con <code>htons</code>.',
  codigo: `#include <arpa/inet.h>

int fd = socket(AF_INET, SOCK_STREAM, 0);
struct sockaddr_in srv;
memset(&srv, 0, sizeof srv);
srv.sin_family = AF_INET;
srv.sin_port = htons(PORT);
inet_pton(AF_INET, "127.0.0.1", &srv.sin_addr);
if (connect(fd, (struct sockaddr *)&srv, sizeof srv) < 0) { perror("connect"); exit(1); }

char msg[128], buf[256];
snprintf(msg, sizeof msg, "HOLA %s\\n", "Leo");
send(fd, msg, strlen(msg), 0);
int n = recv(fd, buf, sizeof(buf) - 1, 0);
if (n > 0) { buf[n] = '\\0'; printf("Servidor: %s", buf); }
close(fd);` },
{ id: 'p-select', grupo: 'Patrones del curso', titulo: 'select(): esperar varias fuentes a la vez', cuando: 'Un proceso debe atender varias pipes o sockets sin bloquearse en uno solo.',
  texto: 'En cada vuelta: <b>FD_ZERO</b>, <b>FD_SET</b> de cada descriptor, <b>select</b> con el mayor fd + 1 y luego <b>FD_ISSET</b> para ver cuáles leer. select modifica el conjunto, así que <b>se rearma en cada vuelta</b>.',
  codigo: `#include <sys/select.h>

while (abiertos > 0) {
    fd_set rd;
    FD_ZERO(&rd);
    int maxfd = -1;
    for (int i = 0; i < N; i++)
        if (fds[i] >= 0) { FD_SET(fds[i], &rd); if (fds[i] > maxfd) maxfd = fds[i]; }

    select(maxfd + 1, &rd, NULL, NULL, NULL);    /* NULL = esperar sin límite */

    for (int i = 0; i < N; i++) {
        if (fds[i] < 0 || !FD_ISSET(fds[i], &rd)) continue;
        int n = read(fds[i], buf, sizeof buf);
        if (n <= 0) { close(fds[i]); fds[i] = -1; abiertos--; }   /* EOF */
        else { /* procesar buf */ }
    }
}
/* Con timeout: struct timeval tv = {1, 0}; select(..., &tv); */` },
{ id: 'p-acumulador', grupo: 'Patrones del curso', titulo: 'Buffer acumulador (mensajes por línea en TCP)', cuando: 'El protocolo usa líneas terminadas en \\n y un recv puede traer medio mensaje o varios pegados.',
  texto: 'Se agrega lo que llega al final del buffer y se procesa <b>solo cuando hay un \\n</b>. Lo que sobra se corre al inicio con <code>memmove</code>.',
  codigo: `char buf[4096];
int total = 0, n;
while ((n = recv(fd, buf + total, sizeof(buf) - total - 1, 0)) > 0) {
    total += n;
    buf[total] = '\\0';
    char *nl;
    while ((nl = strchr(buf, '\\n')) != NULL) {
        *nl = '\\0';                         /* buf es ahora UNA línea */
        procesar_linea(buf);
        int usado = (nl - buf) + 1;
        memmove(buf, nl + 1, total - usado + 1);   /* +1 copia el '\\0' */
        total -= usado;
    }
}` },
{ id: 'p-stub', grupo: 'Patrones del curso', titulo: 'RPC: stub (cliente) y skeleton (servidor)', cuando: 'Llamar una función remota con el protocolo CALL / RESULT.',
  texto: 'El <b>stub</b> parece una función normal: arma el CALL, envía, recibe y extrae el RESULT. El buffer de retorno es <code>static</code> para que sobreviva al return. El <b>skeleton</b> hace lo inverso en el servidor.',
  codigo: `/* ---- cliente ---- */
char *get_estado(int sock, const char *id) {
    static char res[64];
    char msg[128];
    snprintf(msg, sizeof msg, "CALL get_estado %s\\n", id);
    send(sock, msg, strlen(msg), 0);
    int n = recv(sock, msg, sizeof(msg) - 1, 0);
    if (n <= 0) return NULL;
    msg[n] = '\\0';
    if (sscanf(msg, "RESULT %63s", res) != 1) return NULL;
    return res;
}

/* ---- servidor (dentro del loop recv) ---- */
char fn[32], arg[64];
if (sscanf(buf, "CALL %31s %63s", fn, arg) == 2 && strcmp(fn, "get_estado") == 0)
    snprintf(resp, sizeof resp, "RESULT %s\\n", buscar(arg));
else
    snprintf(resp, sizeof resp, "RESULT ERROR\\n");` },
{ id: 'p-dispatch', grupo: 'Patrones del curso', titulo: 'Dispatch table (punteros a función)', cuando: 'Un servidor RPC con varias funciones, sin un if por cada una.',
  texto: 'Todas las funciones tienen la <b>misma firma</b>. Una tabla de pares <code>{nombre, función}</code> permite buscar por nombre y llamar por puntero.',
  codigo: `typedef void (*handler_fn)(const char *args, char *out, size_t n);

void suma(const char *args, char *out, size_t n) {
    int a, b; sscanf(args, "%d %d", &a, &b);
    snprintf(out, n, "%d", a + b);
}
typedef struct { const char *nombre; handler_fn fn; } Entrada;
Entrada tabla[] = { { "suma", suma } /* , { "otra", otra } */ };

for (size_t i = 0; i < sizeof tabla / sizeof tabla[0]; i++)
    if (strcmp(tabla[i].nombre, fn) == 0)
        tabla[i].fn(args, res, sizeof res);      /* llamada por puntero */` },
{ id: 'p-flock', grupo: 'Patrones del curso', titulo: 'Estado compartido en archivo con flock()', cuando: 'Varios procesos (fork) deben leer y modificar el mismo estado.',
  texto: 'Con fork las variables no se comparten: el estado va en un archivo. <b>LOCK_SH</b> para leer y <b>LOCK_EX</b> para modificar. Lee, modifica y escribe <b>bajo el mismo LOCK_EX</b>.',
  codigo: `#include <fcntl.h>
#include <sys/file.h>

Estado e;
int fd = open("estado.dat", O_RDWR);
flock(fd, LOCK_EX);              /* nadie más lee ni escribe */
read(fd, &e, sizeof e);
e.contador++;                    /* modificar */
lseek(fd, 0, SEEK_SET);          /* volver al inicio antes de escribir */
write(fd, &e, sizeof e);
flock(fd, LOCK_UN);
close(fd);` },
{ id: 'p-lamport', grupo: 'Patrones del curso', titulo: 'Reglas de Lamport en C', cuando: 'Cualquier ejercicio con relojes lógicos.',
  texto: '<b>Interno:</b> +1. <b>Envío:</b> +1 y el mensaje lleva el reloj. <b>Recepción:</b> max(reloj, ts) + 1. En C el máximo se escribe con un <code>if</code>.',
  codigo: `int reloj = 0;

reloj++;                                  /* evento interno */

reloj++;                                  /* envío */
msg.ts = reloj;

if (msg.ts > reloj) reloj = msg.ts;       /* recepción */
reloj++;` },
{ id: 'p-tiempo', grupo: 'Patrones del curso', titulo: 'Hora, esperas y tiempo transcurrido', cuando: 'Timestamps reales, heartbeats, imprimir con hora o esperar.',
  texto: '<code>time(NULL)</code> da los segundos actuales. <code>strftime</code> le da formato. <code>sleep</code> espera segundos y <code>usleep</code>, microsegundos.',
  codigo: `#include <time.h>

time_t ahora = time(NULL);
char hora[16];
strftime(hora, sizeof hora, "%H:%M:%S", localtime(&ahora));
printf("[%s] alerta\\n", hora);

int silencio = (int)(time(NULL) - ultimo);   /* segundos transcurridos */
sleep(1);          /* 1 segundo */
usleep(300000);    /* 0,3 segundos */` }
);

/* Qué patrones usa cada ejercicio (se muestran como "Patrones que usa" al abrirlo) */
Object.assign(usaPatrones, {
  L06: ['p-lamport', 'punteros'], L07: ['strings', 'punteros'], L08: ['p-lamport', 'punteros'], L09: ['p-lamport', 'p-atender'], L10: ['arreglos', 'structs'],
  L11: ['p-pipe', 'p-select', 'p-lamport'], L12: ['p-servidor', 'p-acumulador', 'p-select', 'p-pipe', 'p-lamport'], L13: ['p-pipe', 'p-select', 'p-lamport'],
  C01A: ['p-servidor', 'p-atender', 'strings'], C01B: ['p-cliente', 'strings'],
  P1: ['p-pipe'], P2: ['p-pipe'], P3: ['p-pipe', 'p-select', 'p-tiempo'],
  S1: ['p-servidor', 'p-cliente'], S2: ['p-servidor', 'p-atender'], S3: ['p-acumulador', 'p-atender', 'p-tiempo'],
  R1: ['p-stub', 'p-servidor'], R2: ['p-dispatch', 'p-servidor'], R3: ['p-flock', 'p-stub', 'p-servidor'],
  I1: ['p-pipe', 'p-cliente', 'p-servidor', 'p-tiempo'], I2: ['p-pipe', 'p-stub', 'p-servidor'], I3: ['p-servidor', 'p-pipe', 'p-select', 'p-cliente'],
  X1: ['funciones'], X2: ['structs', 'strings'], X3: ['funciones'], X4: ['p-tiempo', 'structs'], X5: ['structs', 'punteros'], X6: ['structs', 'arreglos'], X7: ['structs', 'punteros'], X8: ['arreglos', 'structs', 'funciones']
});

/* ===== Pieza por pieza: cada elemento de la sintaxis explicado =====
   partes: [{ s: sintaxis, d: qué es y para qué sirve (HTML), ojo: error típico (opcional) }]
   recuerda: un truco para no olvidarlo */
const PIEZAS = {
programa: { partes: [
  { s: '#include <stdio.h>', d: `Trae las <b>declaraciones</b> de una biblioteca para poder usar sus funciones. <code>stdio.h</code> trae printf, fgets, fdopen; <code>stdlib.h</code> trae exit, atoi, rand; <code>string.h</code> trae strcmp, strlen, memset; <code>unistd.h</code> trae fork, pipe, read, write, close.`, ojo: `Si olvidas uno, gcc avisa "implicit declaration of function". En papel, escribe los includes primero.` },
  { s: 'int main(...)', d: `El punto de partida: el programa empieza a ejecutarse aquí. Retorna un <code>int</code> al sistema operativo.` },
  { s: 'int argc', d: `<b>arg</b>ument <b>c</b>ount: cuántas palabras tiene la línea de comandos, contando el nombre del programa. <code>./server 5000</code> da argc = 2.` },
  { s: 'char *argv[]', d: `<b>arg</b>ument <b>v</b>ector: arreglo de strings con esas palabras. <code>argv[0]</code> es "./server" y <code>argv[1]</code> es "5000" (como texto; para número usa <code>atoi(argv[1])</code>).` },
  { s: 'return 0;', d: `Termina main avisando "todo salió bien". Un número distinto de 0 indica error.` }],
  recuerda: `Esqueleto mínimo en papel: includes, main, return 0. Llénalo después.` },
tipos: { partes: [
  { s: 'int', d: `Entero (sin decimales): contadores, relojes, descriptores, puertos.` },
  { s: 'float   double', d: `Números con decimales. <code>double</code> tiene más precisión. <code>3.5f</code>: la <code>f</code> indica que la constante es float.` },
  { s: 'char', d: `Un solo carácter, entre comillas simples: <code>'A'</code>.` },
  { s: 'char nombre[16]', d: `Un <b>string</b>: arreglo de hasta 15 caracteres más el <code>'\\0'</code> final.`, ojo: `El tamaño debe considerar el <code>'\\0'</code>. "ARES-1" ocupa 7, no 6.` },
  { s: 'printf("...", a, b)', d: `Imprime el texto reemplazando cada <code>%</code> por el siguiente argumento, en orden.` },
  { s: '%d', d: `<b>d</b>ecimal: un <code>int</code>.` },
  { s: '%f   %.2f', d: `Un float/double. <code>.2</code> indica dos decimales.` },
  { s: '%s', d: `Un <b>s</b>tring (char[] o char*).` },
  { s: '%c', d: `Un <b>c</b>arácter.` },
  { s: '%02X', d: `He<b>X</b>adecimal en mayúsculas, con ancho 2 y rellenado con 0: 10 se imprime "0A".` },
  { s: '%ld', d: `<b>l</b>ong <b>d</b>ecimal: un entero largo, como el valor de <code>time(NULL)</code> convertido con <code>(long)</code>.` },
  { s: '\\n', d: `Salto de línea. Sin él, la salida puede quedarse en el buffer y no aparecer cuando esperas.` }],
  recuerda: `Para leer el formato de printf: cada % pide un valor, en orden.` },
control: { partes: [
  { s: 'if (cond) {...}', d: `Ejecuta el bloque solo si cond es verdadera. En C, verdadero significa "distinto de 0".` },
  { s: 'else if / else', d: `Alternativas: se evalúan en orden y se ejecuta solo la primera que se cumple.` },
  { s: 'for (ini; cond; paso)', d: `Tres partes separadas por <code>;</code>: qué hacer al inicio (<code>int i = 0</code>), cuándo seguir (<code>i &lt; n</code>) y qué hacer al final de cada vuelta (<code>i++</code>).`, ojo: `Si usas <code>i &lt;= n</code>, recorres un elemento de más y te sales del arreglo.` },
  { s: 'while (cond) {...}', d: `Repite mientras cond sea verdadera. Se usa cuando no sabes cuántas vueltas habrá (leer hasta que cierren).` },
  { s: 'while ((n = recv(...)) > 0)', d: `Patrón típico: primero <b>asigna</b> a n lo que retorna recv y luego <b>compara</b> n con 0. Los paréntesis internos son obligatorios.`, ojo: `Sin ellos, <code>n = recv(...) &gt; 0</code> guarda en n el resultado de la comparación (0 o 1), no los bytes leídos.` },
  { s: 'while (1)', d: `Loop infinito (1 siempre es verdadero). Típico en servidores; se sale con <code>break</code> o <code>exit</code>.` },
  { s: 'continue;', d: `Salta el resto de esta vuelta y pasa a la siguiente.` },
  { s: 'break;', d: `Sale del loop más cercano (o del switch).` }],
  recuerda: `<b>continue</b> = "esta vuelta no"; <b>break</b> = "se acabó el loop".` },
funciones: { partes: [
  { s: 'int max2(int a, int b)', d: `Se lee de izquierda a derecha: retorna un <code>int</code>, se llama <code>max2</code> y recibe dos int llamados a y b.` },
  { s: 'void', d: `"Nada": la función no retorna valor. En <code>main(void)</code> significa que no recibe parámetros.` },
  { s: 'return expr;', d: `Termina la función y entrega el valor a quien la llamó.` },
  { s: 'parámetros = copias', d: `Los parámetros reciben <b>copias</b> de los argumentos. Si la función cambia <code>a</code>, la variable original no cambia. Para modificarla hay que usar punteros.` },
  { s: 'const char *nombre', d: `Un puntero a texto que la función promete <b>no modificar</b>. Es la forma habitual de recibir strings de solo lectura.` },
  { s: 'a > b ? a : b', d: `Ternario: "si a &gt; b, entonces a; si no, b". Es un if que produce un valor.` },
  { s: 'declarar antes de usar', d: `El compilador lee de arriba hacia abajo. Escribe la función antes de main, o pon solo su firma arriba: <code>int max2(int a, int b);</code>` }],
  recuerda: `Firma = <b>qué devuelve, cómo se llama, qué recibe</b>. Escríbela primero y después el cuerpo.` },
punteros: { partes: [
  { s: 'int ts;', d: `Una caja normal que guarda un entero. Tiene un valor y una dirección.` },
  { s: '&ts', d: `"La <b>dirección</b> de ts", o sea, dónde vive. Es lo que le das a una función para que pueda escribir en ts.`, ojo: `Para pasar el valor (que la función solo lea) escribe <code>ts</code>; para que la función lo cambie, <code>&amp;ts</code>.` },
  { s: 'int *ts  (parámetro)', d: `En una declaración: "ts guarda la dirección de un int". Dentro de lamport_send, <code>ts</code> no es el número sino <b>dónde está</b> el número de main.` },
  { s: '*ts = n->clock;', d: `En una expresión, <code>*ts</code> es "la caja apuntada por ts". Esta línea escribe el clock dentro de la variable ts de main.`, ojo: `<code>ts = n-&gt;clock</code> (sin *) cambia la dirección guardada, no el número de main. El compilador avisa: "makes pointer from integer".` },
  { s: 'Node *n', d: `n guarda la dirección de un Node (por ejemplo, la de p1). Así la función trabaja sobre el p1 original y no sobre una copia.` },
  { s: 'n->clock', d: `"El campo clock del Node apuntado por n". Es lo mismo que <code>(*n).clock</code>; la flecha es el atajo.`, ojo: `<code>n.clock</code> con n puntero da error: "n is a pointer; did you mean '-&gt;'?"` },
  { s: 'p1.clock', d: `Con el struct mismo (no un puntero) se usa punto.` },
  { s: '(*p)++', d: `Incrementa el <b>valor</b> apuntado. Los paréntesis hacen que primero se vaya a la caja y después se sume.`, ojo: `<code>*p++</code> se interpreta como <code>*(p++)</code>: avanza el puntero y deja el valor igual.` },
  { s: 'tres usos de *', d: `En una declaración (<code>int *p</code>) indica el tipo puntero. En una expresión (<code>*p = 3</code>) significa ir a la caja apuntada. Entre dos números (<code>a * b</code>) es multiplicación.` },
  { s: 'cuándo pasar puntero', d: `Pregúntate si la función debe <b>modificar</b> la variable de quien la llama. Si debe, usa <code>&amp;</code> al llamar y <code>*</code> en el parámetro. Si solo la lee, pásala normal (como <code>ts_recv</code> en lamport_recv).` }],
  recuerda: `<code>&amp;</code> = "¿dónde está?". <code>*</code> = "ve allí". <code>-&gt;</code> = "ve allí y toma este campo".` },
arreglos: { partes: [
  { s: 'int v[3]', d: `Tres enteros seguidos en memoria: <code>v[0]</code>, <code>v[1]</code> y <code>v[2]</code>.`, ojo: `<code>v[3]</code> no existe. C no avisa y escribirlo puede romper otra variable.` },
  { s: '= {0, 0, 0}', d: `Inicializa en orden. <code>int v[10] = {0};</code> deja todo en 0.` },
  { s: 'int fds[3][3][2]', d: `Arreglo de varias dimensiones: <code>fds[i][j]</code> es el pipe de i hacia j y <code>fds[i][j][0]</code> su extremo de lectura.` },
  { s: 'sizeof(arr) / sizeof(arr[0])', d: `Bytes totales dividido por bytes de un elemento = cantidad de elementos.`, ojo: `Si arr llegó como parámetro de una función, en realidad es un puntero y sizeof da el tamaño del puntero (8 bytes), no del arreglo.` },
  { s: '#define N (...)', d: `Le da un nombre a una expresión. Los paréntesis evitan sorpresas de precedencia.` },
  { s: 'arreglo = dirección', d: `El nombre de un arreglo funciona como la dirección de su primer elemento. Por eso <code>recv(fd, buf, ...)</code> se escribe sin <code>&amp;</code>.` }],
  recuerda: `Índices de 0 a n−1. El for típico es <code>i = 0; i &lt; n; i++</code>.` },
structs: { partes: [
  { s: 'typedef struct {...} Msg;', d: `Define un tipo nuevo llamado <code>Msg</code> que agrupa varios campos. Sin typedef tendrías que escribir <code>struct Msg</code> cada vez.`, ojo: `Lleva <code>;</code> al final, después del nombre.` },
  { s: 'typedef enum { REQUEST, REPLY } MsgType;', d: `Constantes con nombre: REQUEST vale 0 y REPLY vale 1. Hace el código más legible que usar números sueltos.` },
  { s: 'Msg m = { REQUEST, 5, 1 };', d: `Crea un Msg llenando los campos <b>en el orden en que se declararon</b>.` },
  { s: 'm.ts', d: `Accede al campo ts de m (m es un struct, no un puntero, así que se usa punto).` },
  { s: 'Msg copia = m;', d: `Copia <b>todos</b> los campos (los arreglos internos también). Cambiar copia no afecta a m.` },
  { s: 'Msg *pm = &m;  pm->ts', d: `Con un puntero al struct se usa flecha.` }],
  recuerda: `struct = una ficha con casillas. Punto si tienes la ficha; flecha si tienes su dirección.` },
strings: { partes: [
  { s: `'\\0'`, d: `El carácter que marca el <b>fin</b> del string. Todas las funciones de string se detienen ahí.`, ojo: `Después de <code>recv</code>, ponlo tú: <code>buf[n] = '\\0';</code>` },
  { s: 'strcmp(a, b) == 0', d: `<b>str</b>ing <b>c</b>o<b>mp</b>are: retorna 0 si son <b>iguales</b>.`, ojo: `<code>if (strcmp(a, b))</code> es verdadero cuando son <b>distintos</b>. Escribe siempre <code>== 0</code>.` },
  { s: 'strncmp(msg, "HELLO", 5)', d: `Compara solo los primeros 5 caracteres. Sirve para preguntar "¿empieza con HELLO?".` },
  { s: 'snprintf(dest, tam, fmt, ...)', d: `Como printf, pero <b>escribe en un string</b> en vez de la pantalla. <code>tam</code> evita escribir de más. Retorna cuántos caracteres escribió (útil para <code>write</code>).` },
  { s: 'sscanf(src, fmt, &a, &b)', d: `Lo inverso: <b>lee</b> campos desde un string. Retorna <b>cuántos</b> campos leyó, y eso se usa para validar.`, ojo: `Los números van con <code>&amp;</code> (<code>&amp;seq</code>). Los char[] van sin <code>&amp;</code> porque el arreglo ya es una dirección (<code>id</code>).` },
  { s: '%15s', d: `En sscanf: lee una palabra de máximo 15 caracteres, para que quepa en <code>char id[16]</code>.` },
  { s: 'strcspn(msg, "\\n")', d: `Posición del primer <code>\\n</code>. Con <code>msg[...] = '\\0'</code> se corta el salto de línea final.` },
  { s: 'strlen(s)', d: `Largo del string sin contar el <code>'\\0'</code>. Úsalo en <code>send(fd, s, strlen(s), 0)</code>.` },
  { s: 'strcpy(dest, src)', d: `Copia un string. <code>dest = src</code> no funciona con arreglos.` }],
  recuerda: `<b>snprintf arma, sscanf desarma, strcmp compara</b>.` },
conversiones: { partes: [
  { s: 'atoi("42")', d: `<b>A</b>SCII <b>to</b> <b>i</b>nt: de texto a entero.` },
  { s: 'atof("3.6")', d: `<b>A</b>SCII <b>to</b> <b>f</b>loat: de texto a número con decimales (retorna double).` },
  { s: 'rand()', d: `Un entero pseudoaleatorio grande, entre 0 y RAND_MAX.` },
  { s: 'rand() % 6', d: `El resto de dividir por 6 da un número entre 0 y 5. <code>1 + rand() % 6</code> da entre 1 y 6.` },
  { s: 'srand(getpid())', d: `Fija la <b>semilla</b>. Con la misma semilla, rand repite la misma secuencia. Usar el pid hace que cada proceso tenga una distinta.`, ojo: `Si llamas srand antes del fork, padre e hijo generan los mismos números.` },
  { s: '/ 100.0f', d: `Dividir por un float obliga a hacer la división con decimales.` }],
  recuerda: `<b>a</b>to<b>i</b> = "de <b>A</b>SCII a <b>i</b>nt".` },
memoria: { partes: [
  { s: 'memset(&x, 0, sizeof x)', d: `Llena con un mismo byte los <code>sizeof x</code> bytes que empiezan en la dirección de x. Con 0, deja todo en cero.` },
  { s: 'memcpy(dest, src, n)', d: `Copia n bytes de src a dest. Sirve para cualquier dato, no solo strings.` },
  { s: 'memmove(dest, src, n)', d: `Igual que memcpy, pero funciona aunque las zonas se <b>solapen</b>. Por eso el buffer acumulador usa memmove.` },
  { s: 'sizeof x', d: `Tamaño en bytes de x. Se calcula al compilar.` }],
  recuerda: `mem<b>set</b> = llenar, mem<b>cpy</b> = copiar, mem<b>move</b> = copiar cuando se pisan.` },
errores: { partes: [
  { s: '< 0  /  == -1', d: `Las llamadas al sistema (socket, bind, connect, fork, pipe) retornan −1 si fallan.` },
  { s: 'perror("bind")', d: `Imprime tu texto seguido del motivo real del error, por ejemplo "bind: Address already in use".` },
  { s: 'exit(1)', d: `Termina el programa inmediatamente con código de error 1.` },
  { s: 'pid_t pid = fork();', d: `<code>pid_t</code> es el tipo para ids de proceso. fork retorna 0 en el hijo, el pid del hijo en el padre y −1 si falló.` }],
  recuerda: `Llamada al sistema → <code>if (... &lt; 0) { perror(...); exit(1); }</code>` },
'p-pipe': { partes: [
  { s: 'int fd[2];', d: `Dos descriptores: los dos extremos del tubo.` },
  { s: 'pipe(fd)', d: `Crea el tubo. <code>fd[0]</code> es para <b>leer</b> y <code>fd[1]</code> para <b>escribir</b>.`, ojo: `Debe ir <b>antes</b> de fork, para que ambos procesos hereden el mismo tubo.` },
  { s: 'pid_t pid = fork();', d: `Duplica el proceso. Desde aquí hay dos procesos ejecutando el mismo código; se distinguen por el valor de pid.` },
  { s: 'if (pid == 0)', d: `"Si soy el hijo". En el padre, pid es el número del hijo (mayor que 0).` },
  { s: 'close(fd[0])', d: `Cierra el extremo que <b>este</b> proceso no usa.`, ojo: `Si el padre no cierra fd[1], nunca recibirá EOF y quedará esperando para siempre.` },
  { s: 'write(fd[1], msg, len)', d: `Escribe len bytes de msg en el tubo.` },
  { s: 'exit(0)', d: `El hijo termina aquí. Sin exit, seguiría ejecutando el código del padre.` },
  { s: 'fdopen(fd[0], "r")', d: `Convierte el descriptor en un <code>FILE *</code> para poder leer línea a línea con fgets.` },
  { s: 'fgets(linea, tam, in)', d: `Lee una línea completa (hasta el <code>\\n</code>). Retorna NULL cuando llega EOF.` },
  { s: 'wait(NULL)', d: `Espera a que termine un hijo. Así no queda un proceso zombi.` }],
  recuerda: `<b>0 lee, 1 escribe</b> (como stdin = 0 y stdout = 1). pipe → fork → cerrar lo que no uso.` },
'p-servidor': { partes: [
  { s: 'socket(AF_INET, SOCK_STREAM, 0)', d: `Crea un socket. <code>AF_INET</code> = IPv4, <code>SOCK_STREAM</code> = TCP. Retorna un descriptor (como un archivo).` },
  { s: 'setsockopt(... SO_REUSEADDR ...)', d: `Permite reusar el puerto en seguida si reinicias el servidor.` },
  { s: 'struct sockaddr_in addr', d: `La "dirección" del servidor: familia, IP y puerto.` },
  { s: 'INADDR_ANY', d: `Escuchar en todas las interfaces de red del equipo.` },
  { s: 'htons(PORT)', d: `<b>h</b>ost <b>to</b> <b>n</b>etwork <b>s</b>hort: convierte el número de puerto al orden de bytes de la red.`, ojo: `Sin htons el puerto queda con otro número y el cliente no se conecta.` },
  { s: '(struct sockaddr *)&addr', d: `bind recibe un tipo genérico, así que se <b>convierte</b> (cast) el puntero a sockaddr_in en uno a sockaddr.` },
  { s: 'bind(srv, ...)', d: `Asocia el socket a ese puerto: "este socket es el del puerto 5000".` },
  { s: 'listen(srv, 10)', d: `Empieza a aceptar conexiones. Hasta 10 pueden esperar en la cola.` },
  { s: 'int cli = accept(srv, NULL, NULL)', d: `Espera a un cliente y retorna un descriptor <b>nuevo</b> solo para él. srv sigue disponible para otros clientes.` },
  { s: 'if (fork() == 0)', d: `Un hijo por cliente: así se atiende a varios a la vez.` },
  { s: 'close(srv) en el hijo / close(cli) en el padre', d: `Cada uno cierra lo que no usa: el hijo solo habla con su cliente; el padre solo acepta.` },
  { s: 'signal(SIGCHLD, SIG_IGN)', d: `Ignora el aviso de hijo terminado, para que los hijos no queden zombis.` }],
  recuerda: `<b>S</b>ocket, <b>B</b>ind, <b>L</b>isten, <b>A</b>ccept, <b>F</b>ork. Truco: "<b>S</b>iempre <b>B</b>usco <b>L</b>a <b>A</b>yuda <b>F</b>inal".` },
'p-atender': { partes: [
  { s: 'recv(fd, buf, sizeof(buf) - 1, 0)', d: `Recibe hasta tamaño−1 bytes (deja espacio para el <code>'\\0'</code>). Retorna bytes leídos, <b>0 si el cliente cerró</b> y −1 si hubo error.` },
  { s: 'buf[n] = \'\\0\';', d: `Convierte lo recibido en string. recv no lo agrega.` },
  { s: 'sscanf(buf, "HOLA %31s", nombre) == 1', d: `"¿El mensaje es HOLA seguido de una palabra?". Si sí, la palabra queda en nombre.` },
  { s: 'strncmp(buf, "CHAO", 4) == 0', d: `"¿Empieza con CHAO?".` },
  { s: 'send(fd, resp, strlen(resp), 0)', d: `Envía la respuesta. El tercer argumento es cuántos bytes enviar.` },
  { s: 'break', d: `Sale del loop y termina de atender al cliente.` }],
  recuerda: `recv → <code>'\\0'</code> → un if por mensaje → send.` },
'p-cliente': { partes: [
  { s: 'socket(...)', d: `Igual que en el servidor.` },
  { s: 'inet_pton(AF_INET, "127.0.0.1", &srv.sin_addr)', d: `<b>p</b>resentation <b>to</b> <b>n</b>etwork: convierte la IP de texto a binario y la guarda en el struct (por eso el <code>&amp;</code>).` },
  { s: 'connect(fd, (struct sockaddr *)&srv, sizeof srv)', d: `Se conecta al servidor. Retorna −1 si no hay nadie escuchando ("Connection refused").` },
  { s: 'send / recv', d: `Enviar y recibir. Mismo uso que en el servidor.` },
  { s: 'close(fd)', d: `Cierra la conexión. El servidor recibe 0 en su recv.` }],
  recuerda: `El cliente no hace bind, listen ni accept: <b>socket → connect → hablar → close</b>.` },
'p-select': { partes: [
  { s: 'fd_set rd;', d: `Un "conjunto" de descriptores que quieres vigilar.` },
  { s: 'FD_ZERO(&rd)', d: `Vacía el conjunto.` },
  { s: 'FD_SET(fd, &rd)', d: `Agrega fd al conjunto.` },
  { s: 'select(maxfd + 1, &rd, NULL, NULL, NULL)', d: `Se bloquea hasta que <b>alguno</b> tenga datos para leer. El primer argumento es el mayor descriptor + 1. Los NULL son: sin escritura, sin excepciones y sin límite de tiempo.`, ojo: `select <b>modifica</b> rd y deja solo los que están listos. Por eso hay que rearmarlo en cada vuelta.` },
  { s: 'FD_ISSET(fd, &rd)', d: `"¿Este fd está listo para leer?".` },
  { s: 'n <= 0 → close, fds[i] = -1', d: `EOF: esa fuente terminó. Se marca con −1 para no vigilarla más.` },
  { s: 'struct timeval tv = {1, 0}', d: `Límite de espera: 1 segundo y 0 microsegundos. Si pasa el tiempo, select retorna 0.` }],
  recuerda: `<b>ZERO → SET → select → ISSET</b>, en cada vuelta.` },
'p-acumulador': { partes: [
  { s: 'buf + total', d: `Aritmética de punteros: "la posición total dentro de buf". Lo nuevo se agrega a continuación de lo anterior.` },
  { s: 'sizeof(buf) - total - 1', d: `El espacio que queda (menos 1 para el <code>'\\0'</code>).` },
  { s: 'strchr(buf, \'\\n\')', d: `Busca el primer <code>\\n</code>. Retorna un <b>puntero</b> a él o NULL si no hay.` },
  { s: '*nl = \'\\0\';', d: `Escribe un fin de string <b>en lugar del</b> <code>\\n</code>. Ahora buf contiene solo la primera línea.` },
  { s: 'nl - buf', d: `Restar punteros da la distancia: en qué posición estaba el <code>\\n</code>.` },
  { s: 'memmove(buf, nl + 1, ...)', d: `Corre lo que sobra (después del <code>\\n</code>) al inicio del buffer.` }],
  recuerda: `TCP no respeta los mensajes: <b>acumula, corta en \\n y corre lo que sobra</b>.` },
'p-stub': { partes: [
  { s: 'char *get_estado(...)', d: `La función retorna un puntero a texto, el resultado.` },
  { s: 'static char res[64];', d: `<code>static</code>: la variable sobrevive después del return. Sin static, res se destruye al salir y el puntero retornado apunta a basura.` },
  { s: '"CALL get_estado %s\\n"', d: `El mensaje del protocolo: tipo, función y argumentos.` },
  { s: 'return NULL;', d: `"No hay resultado": indica que hubo error.` },
  { s: 'stub vs skeleton', d: `El <b>stub</b> (en el cliente) parece una función local, pero envía el CALL. El <b>skeleton</b> (en el servidor) recibe el CALL, llama la función real y responde RESULT.` }],
  recuerda: `Stub: <b>armar → send → recv → desarmar</b>. Skeleton: <b>recv → desarmar → llamar → armar → send</b>.` },
'p-dispatch': { partes: [
  { s: 'typedef void (*handler_fn)(...)', d: `Define el tipo "puntero a una función que recibe (args, out, n) y no retorna nada". Los paréntesis en <code>(*handler_fn)</code> son los que lo hacen puntero.` },
  { s: '{ "suma", suma }', d: `Un par: el nombre como texto y la función. Escribir una función sin <code>()</code> da su dirección.` },
  { s: 'tabla[i].fn(args, res, sizeof res)', d: `Llama a la función guardada en la tabla, igual que si escribieras <code>suma(...)</code>.` },
  { s: 'size_t', d: `Tipo entero sin signo para tamaños (el que retorna sizeof).` }],
  recuerda: `Una tabla de <b>nombre → función</b> reemplaza una cadena de ifs.` },
'p-flock': { partes: [
  { s: 'open("estado.dat", O_RDWR)', d: `Abre el archivo para leer y escribir. Retorna un descriptor.` },
  { s: 'flock(fd, LOCK_EX)', d: `Candado <b>ex</b>clusivo: solo este proceso puede usar el archivo. Los demás esperan.` },
  { s: 'LOCK_SH', d: `Candado <b>sh</b>ared (compartido): varios pueden leer a la vez, pero nadie puede escribir.` },
  { s: 'read(fd, &e, sizeof e)', d: `Lee los bytes del archivo directamente sobre el struct e.` },
  { s: 'lseek(fd, 0, SEEK_SET)', d: `Vuelve al inicio del archivo, porque read dejó la posición al final.`, ojo: `Sin lseek, el write agrega al final en vez de sobrescribir.` },
  { s: 'flock(fd, LOCK_UN)', d: `Suelta el candado (<b>un</b>lock).` }],
  recuerda: `<b>EX</b>clusivo para escribir, <b>SH</b>ared para leer. Leer, modificar y escribir dentro del mismo candado.` },
'p-lamport': { partes: [
  { s: 'reloj++  (interno)', d: `Cualquier evento local suma 1.` },
  { s: 'reloj++; msg.ts = reloj;', d: `Enviar: primero suma 1 y después pone el reloj en el mensaje.`, ojo: `Si inviertes el orden, el mensaje lleva el valor anterior.` },
  { s: 'if (msg.ts > reloj) reloj = msg.ts;', d: `Recibir, primera parte: <code>max(reloj, ts)</code> escrito con un if (C no trae una función max).` },
  { s: 'reloj++  (después del max)', d: `Recibir, segunda parte: recibir también es un evento, así que suma 1.` },
  { s: 'n->clock  vs  reloj', d: `Si el reloj está dentro de un struct apuntado, se usa <code>n-&gt;clock</code> en vez de <code>reloj</code>. Las reglas son las mismas.` }],
  recuerda: `Interno +1, envío +1 y adjunta, recepción max y +1.` },
'p-tiempo': { partes: [
  { s: 'time_t ahora = time(NULL)', d: `Segundos desde 1970. Sirve para medir diferencias de tiempo.` },
  { s: 'localtime(&ahora)', d: `Convierte esos segundos a fecha y hora local (struct tm). Recibe la dirección, de ahí el <code>&amp;</code>.` },
  { s: 'strftime(hora, tam, "%H:%M:%S", ...)', d: `Da formato a la hora: <code>%H</code> horas, <code>%M</code> minutos, <code>%S</code> segundos.` },
  { s: 'time(NULL) - ultimo', d: `Segundos transcurridos desde <code>ultimo</code>. Sirve para detectar silencio en heartbeats.` },
  { s: 'sleep(1) / usleep(300000)', d: `Pausa: sleep en segundos; usleep en <b>micro</b>segundos (300000 µs = 0,3 s).` }],
  recuerda: `<b>u</b>sleep = <b>µ</b>segundos.` }
};
referencia.forEach(r => { if (PIEZAS[r.id]) Object.assign(r, PIEZAS[r.id]); });
