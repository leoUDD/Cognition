/* mutex_lamport.c — exclusión mutua de Lamport con pipes */
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/wait.h>
#include <sys/select.h>

#define NPROC  3
#define CICLOS 2

/* Tipos de mensaje */
#define REQUEST 0
#define REPLY   1
#define RELEASE 2

typedef struct {
    int tipo;   /* REQUEST, REPLY o RELEASE */
    int ts;     /* timestamp Lamport del emisor */
    int pid;    /* PID lógico del emisor */
} Msg;

/* fds[i][j] = pipe para que el proceso i ESCRIBA al proceso j.
   fds[i][j][0] = extremo de lectura (lo usa j), fds[i][j][1] = escritura (lo usa i). */
int fds[NPROC][NPROC][2];

int me;                 /* mi PID lógico */
int reloj = 0;          /* reloj de Lamport */
int cola_ts[NPROC];     /* ts de la solicitud pendiente de cada proceso (-1 = ninguna) */
int replies = 0;        /* REPLY recibidos para mi solicitud actual */
int releases = 0;       /* RELEASE recibidos en total */

void enviar(int dest, int tipo, int ts) {
    Msg m;
    m.tipo = tipo;
    m.ts = ts;
    m.pid = me;
    write(fds[me][dest][1], &m, sizeof(m));
}

/* ¿la solicitud (ta, pa) va antes que (tb, pb)? Orden total (ts, pid). */
int va_antes(int ta, int pa, int tb, int pb) {
    if (ta < tb) {
        return 1;           /* número menor: va antes */
    }
    if (ta == tb) {
        if (pa < pb) {
            return 1;       /* empate en número: gana el pid menor */
        }
    }
    return 0;
}

void procesar(Msg m) {
//@TODO 1 | Recepción: actualizar reloj y reaccionar según el tipo
//? Llega un mensaje. Primero va SIEMPRE la regla de recepción de Lamport. Después, ¿qué haces según si es REQUEST, REPLY o RELEASE?
//- Regla de recepción: si m.ts > reloj, reloj = m.ts; después reloj = reloj + 1.
//- REQUEST: guarda su solicitud (cola_ts[m.pid] = m.ts), suma 1 al reloj (responder es un envío) y respóndele REPLY.
//- REPLY: replies = replies + 1.
//- RELEASE: borra su solicitud (cola_ts[m.pid] = -1) y releases = releases + 1.
    if (m.ts > reloj) { //§ //: ¿el reloj del mensaje es mayor que el mío?
        reloj = m.ts; //§ //: entonces salto a ese valor (el max)
    }
    reloj = reloj + 1; //§ //: recibir es un evento: +1

    if (m.tipo == REQUEST) { //: alguien pide la sección crítica
        cola_ts[m.pid] = m.ts; //§ //: anoto su pedido en mi lista de espera
        reloj = reloj + 1; //§ //: responder REPLY es un envío: +1
        enviar(m.pid, REPLY, reloj); //§ //: le respondo "ok, te escuché"
    }
    if (m.tipo == REPLY) { //: alguien respondió a MI pedido
        replies = replies + 1; //§ //: cuento un "ok" más
    }
    if (m.tipo == RELEASE) { //: alguien salió de la sección crítica
        cola_ts[m.pid] = -1; //§ //: lo borro de mi lista (-1 = no pide)
        releases = releases + 1; //§ //: cuento un "ya salí" más (para saber cuándo terminar)
    }
//@END
}

/* Espera un mensaje de cualquiera de los otros procesos (select) y lo procesa. */
void recibir_uno(void) {
//@TODO 2 | select() sobre las pipes de entrada
//? Tienes 2 pipes de entrada y no sabes por cuál llegará el próximo mensaje. ¿Qué función te avisa cuál está lista?
//- FD_ZERO(&listos); para cada j ≠ me: FD_SET de la pipe que llega desde j (fds[j][me][0]) y guarda el mayor fd.
//- select(maxfd + 1, &listos, NULL, NULL, NULL).
//- Para cada j ≠ me con FD_ISSET: read de un Msg.
//- Si read devuelve 0, ese proceso murió: avisa y termina. Si no, procesar(m).
    fd_set listos; //: conjunto de pipes que voy a vigilar
    int maxfd = 0; //: aquí guardo el descriptor más grande (select lo necesita)
    FD_ZERO(&listos); //§ //: vacío el conjunto
    for (int j = 0; j < NPROC; j++) { //: recorro los procesos
        if (j != me) { //: salto mi propio número
            int fd = fds[j][me][0];     /* pipe que llega desde j */
            FD_SET(fd, &listos); //§ //: agrego esa pipe al conjunto
            if (fd > maxfd) { //: ¿es el descriptor más grande hasta ahora?
                maxfd = fd; //: lo guardo
            }
        }
    }

    select(maxfd + 1, &listos, NULL, NULL, NULL); //§ //: espero hasta que alguna pipe tenga un mensaje (sin timeout)

    for (int j = 0; j < NPROC; j++) { //: recorro los procesos otra vez para ver cuál tiene datos
        if (j != me) { //: salto mi propio número
            int fd = fds[j][me][0]; //: la pipe que llega desde j
            if (FD_ISSET(fd, &listos)) { //§ //: ¿esta pipe tiene un mensaje?
                Msg m; //: aquí guardo el mensaje
                int n = read(fd, &m, sizeof(m)); //§ //: leo un mensaje completo (un struct Msg)
                if (n == 0) {           /* el otro extremo se cerró: P_j murió */
                    fprintf(stderr, "[P%d] P%d se cayó (read() = 0)\n", me, j); //§ //: aviso que Pj murió
                    exit(1); //: termino: sin Pj nadie puede seguir
                }
                procesar(m); //§ //: aplico Lamport y reacciono según el tipo
            }
        }
    }
//@END
}

void request_cs(void) {
//@TODO 3 | Enviar REQUEST(ts, pid) a todos (mismo ts para todos)
//? Pedir la sección crítica: un solo timestamp para todos los destinatarios.
//- reloj = reloj + 1 y guarda tu solicitud: cola_ts[me] = reloj.
//- replies = 0.
//- Para cada j ≠ me: enviar(j, REQUEST, cola_ts[me]).
    reloj = reloj + 1; //§ //: pedir es un evento: +1
    cola_ts[me] = reloj; //§ //: me anoto en mi propia lista con ese número
    replies = 0; //§ //: todavía nadie me ha respondido
    for (int j = 0; j < NPROC; j++) { //: a cada proceso…
        if (j != me) { //: salto mi propio número
            enviar(j, REQUEST, cola_ts[me]); //§ //: pido a j, con el MISMO número para todos
        }
    }
//@END
}

int puedo_entrar(void) {
//@TODO 4 | REPLY de todos y mi solicitud es la menor (ts, pid)
//? ¿Cuándo puedes entrar? Necesitas dos condiciones.
//- Si replies < NPROC - 1 → return 0 (falta que alguien responda).
//- Para cada otro j que esté pidiendo (cola_ts[j] != -1): si va_antes(cola_ts[j], j, cola_ts[me], me) → return 0.
//- Si pasaste ambos filtros → return 1.
    if (replies < NPROC - 1) { //§ //: ¿me faltan respuestas? (necesito NPROC-1 = 2)
        return 0; //§ //: todavía no puedo entrar
    }
    for (int j = 0; j < NPROC; j++) { //: ¿hay alguien antes que yo?
        if (j != me) { //: salto mi propio número
            if (cola_ts[j] != -1) { //§ //: ¿j está pidiendo?
                if (va_antes(cola_ts[j], j, cola_ts[me], me)) { //§ //: ¿su pedido (ts, pid) va antes que el mío?
                    return 0; //§ //: j va antes que yo: no es mi turno
                }
            }
        }
    }
    return 1; //§ //: me respondieron todos y nadie va antes: entro
//@END
}

void enter_cs(void) {
    while (puedo_entrar() == 0) {   /* mientras espero, sigo atendiendo mensajes */
        recibir_uno();
    }
}

void release_cs(void) {
//@TODO 5 | Salir: quitar mi solicitud y avisar RELEASE a todos
//? Al salir, los demás tienen que enterarse para que el siguiente pueda entrar.
//- cola_ts[me] = -1.
//- reloj = reloj + 1.
//- Para cada j ≠ me: enviar(j, RELEASE, reloj).
    cola_ts[me] = -1; //§ //: me borro de mi lista
    reloj = reloj + 1; //§ //: avisar RELEASE es un envío: +1
    for (int j = 0; j < NPROC; j++) { //: a cada proceso…
        if (j != me) { //: salto mi propio número
            enviar(j, RELEASE, reloj); //§ //: aviso a j que salí
        }
    }
//@END
}

/* Sección crítica: escribe lento, a propósito, para que se note si dos procesos se mezclan */
void escribir_log(void) {
    char linea[64];
    sprintf(linea, "P%d ts=%d escribe\n", me, cola_ts[me]);
    int f = open("log.txt", O_WRONLY | O_CREAT | O_APPEND, 0644);
    int i = 0;
    while (linea[i] != '\0') {      /* letra por letra */
        write(f, &linea[i], 1);
        usleep(3000);
        i = i + 1;
    }
    close(f);
}

void proceso(int id) {
    me = id;
    for (int j = 0; j < NPROC; j++) {
        cola_ts[j] = -1;
    }
//@TODO 6 | Cerrar los extremos que este proceso no usa
//? Después del fork, cada proceso tiene copia de los 12 extremos. ¿Cuáles usa el proceso me?
//- Usa los de ESCRITURA que salen de él: fds[me][b][1].
//- Usa los de LECTURA que llegan a él: fds[a][me][0].
//- Recorre todos los pares (a, b) con a ≠ b y cierra el resto: si a ≠ me cierra fds[a][b][1]; si b ≠ me cierra fds[a][b][0].
    for (int a = 0; a < NPROC; a++) { //: a = proceso que escribe
        for (int b = 0; b < NPROC; b++) { //: b = proceso que lee
            if (a != b) { //: no existe pipe de un proceso a sí mismo
                if (a != me) { //: esta pipe no sale de mí…
                    close(fds[a][b][1]); //§ //: …así que cierro su extremo de escritura
                }
                if (b != me) { //: esta pipe no llega a mí…
                    close(fds[a][b][0]); //§ //: …así que cierro su extremo de lectura
                }
            }
        }
    }
//@END
    for (int c = 0; c < CICLOS; c++) {
        request_cs();
        enter_cs();
        escribir_log();
        release_cs();
    }
    /* Seguir respondiendo hasta que los demás terminen sus ciclos */
    while (releases < CICLOS * (NPROC - 1)) {
        recibir_uno();
    }
    exit(0);
}

int main(void) {
    unlink("log.txt");
//@TODO 7 | Crear las 6 pipes ANTES de fork() y lanzar los 3 procesos
//? Los procesos solo comparten pipes si se crean antes del fork. ¿Cuántas necesitas para 3 procesos que se hablan de a pares?
//- Dos for (i, j) con i ≠ j: pipe(fds[i][j]) → 6 pipes.
//- Para cada i: if (fork() == 0) proceso(i).
//- El padre cierra todos los extremos y hace wait(NULL) 3 veces.
    for (int i = 0; i < NPROC; i++) { //: i = proceso que escribe
        for (int j = 0; j < NPROC; j++) { //: j = proceso que lee
            if (i != j) { //: no hay pipe de un proceso a sí mismo
                pipe(fds[i][j]); //§ //: creo la pipe de i hacia j (antes del fork)
            }
        }
    }
    for (int i = 0; i < NPROC; i++) { //: lanzo un hijo por proceso
        if (fork() == 0) { //§ //: ¿soy el hijo?
            proceso(i); //§ //: el hijo se convierte en el proceso i (termina con exit)
        }
    }
    for (int i = 0; i < NPROC; i++) { //: el padre recorre todas las pipes
        for (int j = 0; j < NPROC; j++) { //: j = proceso que lee
            if (i != j) { //: no hay pipe de un proceso a sí mismo
                close(fds[i][j][0]); //§ //: el padre no lee…
                close(fds[i][j][1]); //§ //: …ni escribe: cierra ambos extremos
            }
        }
    }
    for (int i = 0; i < NPROC; i++) { //: espero a los 3 hijos
        wait(NULL); //§ //: espero que termine un hijo
    }
//@END
    printf("Listo. Revisa log.txt\n");
    return 0;
}
