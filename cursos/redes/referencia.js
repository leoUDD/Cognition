/* Referencia rápida de C para el ramo: sintaxis básica y patrones del curso.
   referencia.push({ id, grupo, titulo, cuando, texto (HTML), codigo }) */
referencia.push(
/* ================= Sintaxis básica ================= */
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
  texto: 'Un puntero guarda una <b>dirección</b>. <code>&amp;x</code> da la dirección de x, <code>*p</code> accede al valor apuntado y <code>p->campo</code> accede a un campo de un struct apuntado. Se usan para que una función modifique variables de quien la llama.',
  codigo: `void incrementar(int *p) {
    (*p)++;          /* ¡paréntesis! *p++ movería el puntero, no el valor */
}
int reloj = 0;
incrementar(&reloj);         /* reloj vale 1 */

typedef struct { int clock; } Node;
void tick(Node *n) {
    n->clock++;              /* igual a (*n).clock++ */
}
Node p1 = { 0 };
tick(&p1);` },
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
  X1: ['funciones'], X2: ['structs', 'strings'], X3: ['funciones'], X4: ['p-tiempo', 'structs'], X5: ['structs', 'punteros'], X6: ['structs', 'arreglos'], X7: ['structs', 'punteros']
});
