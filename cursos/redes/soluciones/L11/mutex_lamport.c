/* mutex_lamport.c — exclusión mutua de Lamport con pipes */
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <fcntl.h>
#include <sys/wait.h>
#include <sys/select.h>

#define NPROC  3
#define CICLOS 2

typedef enum { REQUEST, REPLY, RELEASE } MsgType;

typedef struct {
    MsgType type;
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

void enviar(int dest, MsgType t, int ts) {
    Msg m = { t, ts, me };
    write(fds[me][dest][1], &m, sizeof m);
}

/* ¿la solicitud (ta, pa) va antes que (tb, pb)? Orden total (ts, pid). */
int va_antes(int ta, int pa, int tb, int pb) {
    return ta < tb || (ta == tb && pa < pb);
}

void procesar(const Msg *m) {
//@TODO 1 | Recepción: actualizar reloj y reaccionar según el tipo
//? Llega un mensaje. Primero va SIEMPRE la regla de recepción de Lamport. Después, ¿qué haces según si es REQUEST, REPLY o RELEASE?
//- reloj = max(m->ts, reloj) + 1.
//- REQUEST: guarda su solicitud (cola_ts[m->pid] = m->ts) y respóndele REPLY con tu reloj incrementado.
//- REPLY: replies++.
//- RELEASE: borra su solicitud (cola_ts[m->pid] = -1) y releases++.
    reloj = (m->ts > reloj ? m->ts : reloj) + 1; //§
    if (m->type == REQUEST) {
        cola_ts[m->pid] = m->ts; //§
        reloj++; //§
        enviar(m->pid, REPLY, reloj); //§
    } else if (m->type == REPLY) {
        replies++; //§
    } else { /* RELEASE */
        cola_ts[m->pid] = -1; //§
        releases++; //§
    }
//@END
}

/* Espera un mensaje de cualquiera de los otros procesos (select) y lo procesa. */
void recibir_uno(void) {
//@TODO 2 | select() sobre las pipes de entrada
//? Tienes 2 pipes de entrada y no sabes por cuál llegará el próximo mensaje. ¿Qué función te avisa cuál está lista?
//- FD_ZERO(&rd); FD_SET del extremo de lectura de cada pipe que viene hacia ti (fds[j][me][0]); guarda el mayor fd.
//- select(maxfd + 1, &rd, NULL, NULL, NULL).
//- Para cada j con FD_ISSET: read de un Msg.
//- Si read devuelve 0, ese proceso murió: avisa y termina. Si no, procesar(&m).
    fd_set rd;
    int maxfd = -1;
    FD_ZERO(&rd); //§
    for (int j = 0; j < NPROC; j++) {
        if (j == me) continue;
        FD_SET(fds[j][me][0], &rd); //§
        if (fds[j][me][0] > maxfd) maxfd = fds[j][me][0];
    }
    select(maxfd + 1, &rd, NULL, NULL, NULL); //§
    for (int j = 0; j < NPROC; j++) {
        if (j == me || !FD_ISSET(fds[j][me][0], &rd)) continue; //§
        Msg m;
        int n = read(fds[j][me][0], &m, sizeof m); //§
        if (n == 0) {   /* el otro extremo se cerró: P_j murió */
            fprintf(stderr, "[P%d] P%d se cayó (read() = 0)\n", me, j); //§
            exit(1);
        }
        procesar(&m); //§
    }
//@END
}

void request_cs(void) {
//@TODO 3 | Enviar REQUEST(ts, pid) a todos (mismo ts para todos)
//? Pedir la sección crítica: un solo timestamp para todos los destinatarios.
//- reloj++ y guarda tu solicitud: cola_ts[me] = reloj.
//- replies = 0.
//- Para cada j ≠ me: enviar(j, REQUEST, cola_ts[me]).
    reloj++; //§
    cola_ts[me] = reloj; //§
    replies = 0; //§
    for (int j = 0; j < NPROC; j++)
        if (j != me) enviar(j, REQUEST, cola_ts[me]); //§
//@END
}

int puedo_entrar(void) {
//@TODO 4 | REPLY de todos y mi solicitud es la menor (ts, pid)
//? ¿Cuándo puedes entrar? Necesitas dos condiciones.
//- Si replies < NPROC - 1 → return 0 (falta que alguien responda).
//- Para cada otro j con solicitud pendiente: si (cola_ts[j], j) va antes que (cola_ts[me], me) → return 0.
//- Si pasaste ambos filtros → return 1.
    if (replies < NPROC - 1) return 0; //§
    for (int j = 0; j < NPROC; j++)
        if (j != me && cola_ts[j] != -1 && va_antes(cola_ts[j], j, cola_ts[me], me)) //§
            return 0;
    return 1; //§
//@END
}

void enter_cs(void) {
    while (!puedo_entrar())
        recibir_uno();
}

void release_cs(void) {
//@TODO 5 | Salir: quitar mi solicitud y avisar RELEASE a todos
//? Al salir, los demás tienen que enterarse para que el siguiente pueda entrar.
//- cola_ts[me] = -1.
//- reloj++.
//- Para cada j ≠ me: enviar(j, RELEASE, reloj).
    cola_ts[me] = -1; //§
    reloj++; //§
    for (int j = 0; j < NPROC; j++)
        if (j != me) enviar(j, RELEASE, reloj); //§
//@END
}

/* Sección crítica: escribe lento, a propósito, para que se note si dos procesos se mezclan */
void escribir_log(void) {
    char linea[64];
    int len = snprintf(linea, sizeof linea, "P%d ts=%d escribe\n", me, cola_ts[me]);
    int f = open("log.txt", O_WRONLY | O_CREAT | O_APPEND, 0644);
    for (int i = 0; i < len; i++) { write(f, &linea[i], 1); usleep(3000); }
    close(f);
}

void proceso(int id) {
    me = id;
    for (int j = 0; j < NPROC; j++) cola_ts[j] = -1;
//@TODO 6 | Cerrar los extremos que este proceso no usa
//? Después del fork, cada proceso tiene copia de los 12 extremos. ¿Cuáles usa el proceso me?
//- Usa los de ESCRITURA que salen de él: fds[me][b][1].
//- Usa los de LECTURA que llegan a él: fds[a][me][0].
//- Recorre todos los pares (a, b) con a ≠ b y cierra el resto: si a ≠ me cierra fds[a][b][1]; si b ≠ me cierra fds[a][b][0].
    for (int a = 0; a < NPROC; a++)
        for (int b = 0; b < NPROC; b++) {
            if (a == b) continue;
            if (a != me) close(fds[a][b][1]); //§
            if (b != me) close(fds[a][b][0]); //§
        }
//@END
    for (int c = 0; c < CICLOS; c++) {
        request_cs();
        enter_cs();
        escribir_log();
        release_cs();
    }
    /* Seguir respondiendo hasta que los demás terminen sus ciclos */
    while (releases < CICLOS * (NPROC - 1))
        recibir_uno();
    exit(0);
}

int main(void) {
    unlink("log.txt");
//@TODO 7 | Crear las 6 pipes ANTES de fork() y lanzar los 3 procesos
//? Los procesos solo comparten pipes si se crean antes del fork. ¿Cuántas necesitas para 3 procesos que se hablan de a pares?
//- Dos for (i, j) con i ≠ j: pipe(fds[i][j]) → 6 pipes.
//- for i: if (fork() == 0) proceso(i).
//- El padre cierra todos los extremos y hace wait(NULL) 3 veces.
    for (int i = 0; i < NPROC; i++)
        for (int j = 0; j < NPROC; j++)
            if (i != j) pipe(fds[i][j]); //§
    for (int i = 0; i < NPROC; i++)
        if (fork() == 0) proceso(i); //§
    for (int i = 0; i < NPROC; i++)
        for (int j = 0; j < NPROC; j++)
            if (i != j) { close(fds[i][j][0]); close(fds[i][j][1]); } //§
    for (int i = 0; i < NPROC; i++) wait(NULL); //§
//@END
    printf("Listo. Revisa log.txt\n");
    return 0;
}
