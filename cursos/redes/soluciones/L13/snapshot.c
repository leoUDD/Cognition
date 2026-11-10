/* snapshot.c — snapshot consistente (Chandy-Lamport simplificado) */
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <signal.h>
#include <sys/wait.h>
#include <sys/select.h>

#define NPROC 3
#define ITER  30            /* 30 iteraciones de 100 ms = 3 s */

typedef enum { TRANSFER, MARKER } MsgType;

typedef struct {
    MsgType type;
    int ts;         /* timestamp Lamport */
    int from;       /* pid del emisor */
    int amount;     /* solo para TRANSFER */
} Msg;

typedef struct {
    int clock;
    int pid;
    int counter;            /* estado local del proceso */
    int snap_counter;       /* estado capturado al snapshot */
    int snap_taken;         /* ¿ya tomé mi snapshot? */
    int snap_clock;         /* reloj al tomar el snapshot */
    int marker_from[NPROC]; /* ¿recibí MARKER de Pi? */
    int transito[NPROC];    /* suma de TRANSFER en tránsito por canal j -> yo */
    int n_transito;         /* cantidad de mensajes en tránsito registrados */
} Process;

typedef struct { int pid, snap_counter, transito, n_transito, snap_clock; } Resultado;

int fds[NPROC][NPROC][2];   /* fds[i][j]: pipe de i hacia j */
int res_pipe[2];            /* hijos -> padre: resultados */
Process P;

void enviar(int dest, MsgType t, int amount) {
    Msg m = { t, P.clock, P.pid, amount };
    write(fds[P.pid][dest][1], &m, sizeof m);
}

int snapshot_completo(void) {
    for (int j = 0; j < NPROC; j++)
        if (j != P.pid && !P.marker_from[j]) return 0;
    return P.snap_taken;
}

void tomar_snapshot(void) {
//@TODO 1 | Registrar mi estado y enviar MARKER por todas mis pipes
//? Tomar el snapshot es: congelar tu estado y avisar a todos por cada canal.
//- P.snap_counter = P.counter; P.snap_taken = 1; guarda el reloj.
//- P.clock++ (enviar es un evento).
//- Para cada j ≠ pid: enviar(j, MARKER, 0).
    P.snap_counter = P.counter; //§
    P.snap_taken = 1; //§
    P.snap_clock = P.clock;
    P.clock++;                      /* enviar es un evento */ //§
    for (int j = 0; j < NPROC; j++)
        if (j != P.pid) enviar(j, MARKER, 0); //§
//@END
}

void recibir(const Msg *m) {
//@TODO 2 | Lamport + TRANSFER / MARKER
//? Primero la regla de Lamport. Luego: ¿un TRANSFER que llega es parte del snapshot o no? ¿Y qué hace el primer MARKER?
//- P.clock = max(m->ts, P.clock) + 1.
//- TRANSFER: P.counter += amount. Si ya tomaste el snapshot y AÚN no llega el MARKER de ese canal → súmalo a transito[from].
//- MARKER: si no has tomado el snapshot, tómalo ahora. Marca marker_from[from] = 1.
    P.clock = (m->ts > P.clock ? m->ts : P.clock) + 1; //§
    if (m->type == TRANSFER) {
        P.counter += m->amount; //§
        if (P.snap_taken && !P.marker_from[m->from]) { /* llegó tras mi snapshot y antes del MARKER de ese canal */ //§
            P.transito[m->from] += m->amount; //§
            P.n_transito++;
        }
    } else { /* MARKER */
        if (!P.snap_taken) tomar_snapshot(); //§
        P.marker_from[m->from] = 1; //§
    }
//@END
}

/* Lee todo lo disponible sin bloquear (select con timeout 0) */
void leer_pipes(void) {
    while (1) {
        fd_set rd;
        int maxfd = -1;
        FD_ZERO(&rd);
        for (int j = 0; j < NPROC; j++) {
            if (j == P.pid || fds[j][P.pid][0] < 0) continue;
            FD_SET(fds[j][P.pid][0], &rd);
            if (fds[j][P.pid][0] > maxfd) maxfd = fds[j][P.pid][0];
        }
        struct timeval tv = {0, 0};
        if (maxfd < 0 || select(maxfd + 1, &rd, NULL, NULL, &tv) <= 0) return;
        for (int j = 0; j < NPROC; j++) {
            if (j == P.pid || fds[j][P.pid][0] < 0 || !FD_ISSET(fds[j][P.pid][0], &rd)) continue;
            Msg m;
            if (read(fds[j][P.pid][0], &m, sizeof m) <= 0) { close(fds[j][P.pid][0]); fds[j][P.pid][0] = -1; continue; }
            recibir(&m);
        }
    }
}

void proceso(int id) {
    memset(&P, 0, sizeof P);
    P.pid = id;
    P.counter = 100;
    srand(getpid());
    for (int a = 0; a < NPROC; a++)
        for (int b = 0; b < NPROC; b++) {
            if (a == b) continue;
            if (a != id) close(fds[a][b][1]);
            if (b != id) close(fds[a][b][0]);
        }
    close(res_pipe[0]);

//@TODO 3 | Loop principal: evento local, TRANSFER aleatorio, leer pipes, P0 inicia
//? Cada vuelta del loop simula el paso del tiempo. ¿Qué ocurre en cada iteración?
//- usleep(100000); P.clock++ (evento local).
//- Con probabilidad 1/2 y si counter ≥ 10: elige otro destino, resta la cantidad, P.clock++ y envía TRANSFER.
//- leer_pipes() para procesar lo que haya llegado.
//- Si eres P0 y vas en la iteración 10 → tomar_snapshot().
//- Sigue hasta pasar ITER y tener el snapshot completo.
    for (int it = 0; it < ITER || !snapshot_completo(); it++) {
        usleep(100000);
        P.clock++;                              /* evento local */ //§
        if (it < ITER && rand() % 2 == 0 && P.counter >= 10) {
            int dest = (id + 1 + rand() % (NPROC - 1)) % NPROC; //§
            int cant = 1 + rand() % 10;
            P.counter -= cant;                  /* el emisor resta */ //§
            P.clock++; //§
            enviar(dest, TRANSFER, cant); //§
        }
        leer_pipes(); //§
        if (id == 0 && it == 10 && !P.snap_taken) //§
            tomar_snapshot(); //§
    }
//@END
    int total_tr = 0;
    for (int j = 0; j < NPROC; j++) total_tr += P.transito[j];
    Resultado r = { id, P.snap_counter, total_tr, P.n_transito, P.snap_clock };
    write(res_pipe[1], &r, sizeof r);
    exit(0);
}

int main(void) {
    signal(SIGPIPE, SIG_IGN);       /* un proceso puede terminar antes que otro */
    for (int i = 0; i < NPROC; i++)
        for (int j = 0; j < NPROC; j++)
            if (i != j) pipe(fds[i][j]);
    pipe(res_pipe);
    for (int i = 0; i < NPROC; i++)
        if (fork() == 0) proceso(i);
    for (int i = 0; i < NPROC; i++)
        for (int j = 0; j < NPROC; j++)
            if (i != j) { close(fds[i][j][0]); close(fds[i][j][1]); }
    close(res_pipe[1]);

    int suma = 0;
    Resultado r;
    while (read(res_pipe[0], &r, sizeof r) == sizeof r) {
        printf("P%d: snap_counter=%d  en tránsito=%d (%d msgs)  reloj al snapshot=%d\n",
               r.pid, r.snap_counter, r.transito, r.n_transito, r.snap_clock);
        suma += r.snap_counter + r.transito;
    }
    while (wait(NULL) > 0) ;
    printf("TOTAL del snapshot = %d (debe ser %d)\n", suma, 100 * NPROC);
    return 0;
}
