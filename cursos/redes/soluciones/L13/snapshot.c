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

/* Tipos de mensaje */
#define TRANSFER 0
#define MARKER   1

typedef struct {
    int tipo;       /* TRANSFER o MARKER */
    int ts;         /* timestamp Lamport */
    int from;       /* pid del emisor */
    int amount;     /* solo para TRANSFER */
} Msg;

typedef struct {
    int clock;
    int pid;
    int counter;            /* estado local del proceso */
    int snap_counter;       /* estado capturado al snapshot */
    int snap_taken;         /* ¿ya tomé mi snapshot? (0 = no, 1 = sí) */
    int snap_clock;         /* reloj al tomar el snapshot */
    int marker_from[NPROC]; /* ¿recibí MARKER de Pi? */
    int transito[NPROC];    /* suma de TRANSFER en tránsito por canal j -> yo */
    int n_transito;         /* cantidad de mensajes en tránsito registrados */
} Process;

typedef struct {
    int pid;
    int snap_counter;
    int transito;
    int n_transito;
    int snap_clock;
} Resultado;

int fds[NPROC][NPROC][2];   /* fds[i][j]: pipe de i hacia j */
int res_pipe[2];            /* hijos -> padre: resultados */
Process P;

void enviar(int dest, int tipo, int amount) {
    Msg m;
    m.tipo = tipo;
    m.ts = P.clock;
    m.from = P.pid;
    m.amount = amount;
    write(fds[P.pid][dest][1], &m, sizeof(m));
}

/* El snapshot está completo si lo tomé y me llegó el MARKER de todos los demás */
int snapshot_completo(void) {
    if (P.snap_taken == 0) {
        return 0;
    }
    for (int j = 0; j < NPROC; j++) {
        if (j != P.pid) {
            if (P.marker_from[j] == 0) {
                return 0;
            }
        }
    }
    return 1;
}

void tomar_snapshot(void) {
//@TODO 1 | Registrar mi estado y enviar MARKER por todas mis pipes
//? Tomar el snapshot es: congelar tu estado y avisar a todos por cada canal.
//- P.snap_counter = P.counter; P.snap_taken = 1; guarda el reloj.
//- P.clock = P.clock + 1 (enviar es un evento).
//- Para cada j ≠ pid: enviar(j, MARKER, 0).
    P.snap_counter = P.counter; //§
    P.snap_taken = 1; //§
    P.snap_clock = P.clock;
    P.clock = P.clock + 1;          /* enviar es un evento */ //§
    for (int j = 0; j < NPROC; j++) {
        if (j != P.pid) {
            enviar(j, MARKER, 0); //§
        }
    }
//@END
}

void recibir(Msg m) {
//@TODO 2 | Lamport + TRANSFER / MARKER
//? Primero la regla de Lamport. Luego: ¿un TRANSFER que llega es parte del snapshot o no? ¿Y qué hace el primer MARKER?
//- Regla de recepción: si m.ts > P.clock, P.clock = m.ts; después P.clock = P.clock + 1.
//- TRANSFER: P.counter = P.counter + m.amount. Si ya tomaste el snapshot y AÚN no llega el MARKER de ese canal → súmalo a transito[m.from].
//- MARKER: si no has tomado el snapshot, tómalo ahora. Marca marker_from[m.from] = 1.
    if (m.ts > P.clock) { //§
        P.clock = m.ts; //§
    }
    P.clock = P.clock + 1; //§

    if (m.tipo == TRANSFER) {
        P.counter = P.counter + m.amount; //§
        if (P.snap_taken == 1) { //§
            if (P.marker_from[m.from] == 0) {   /* llegó tras mi snapshot y antes del MARKER de ese canal */ //§
                P.transito[m.from] = P.transito[m.from] + m.amount; //§
                P.n_transito = P.n_transito + 1;
            }
        }
    }
    if (m.tipo == MARKER) {
        if (P.snap_taken == 0) { //§
            tomar_snapshot(); //§
        }
        P.marker_from[m.from] = 1; //§
    }
//@END
}

/* Lee todo lo disponible sin bloquear (select con timeout 0) */
void leer_pipes(void) {
    while (1) {
        fd_set listos;
        int maxfd = -1;
        FD_ZERO(&listos);
        for (int j = 0; j < NPROC; j++) {
            if (j != P.pid) {
                int fd = fds[j][P.pid][0];      /* pipe que llega desde j (-1 si ya se cerró) */
                if (fd >= 0) {
                    FD_SET(fd, &listos);
                    if (fd > maxfd) {
                        maxfd = fd;
                    }
                }
            }
        }
        if (maxfd < 0) {
            return;                             /* ya no queda ninguna pipe abierta */
        }

        struct timeval tv;                      /* timeout 0: solo mira, no espera */
        tv.tv_sec = 0;
        tv.tv_usec = 0;
        int hay = select(maxfd + 1, &listos, NULL, NULL, &tv);
        if (hay <= 0) {
            return;                             /* no llegó nada más */
        }

        for (int j = 0; j < NPROC; j++) {
            if (j != P.pid) {
                int fd = fds[j][P.pid][0];
                if (fd >= 0) {
                    if (FD_ISSET(fd, &listos)) {
                        Msg m;
                        int n = read(fd, &m, sizeof(m));
                        if (n <= 0) {           /* Pj terminó: cierro su pipe */
                            close(fd);
                            fds[j][P.pid][0] = -1;
                        } else {
                            recibir(m);
                        }
                    }
                }
            }
        }
    }
}

void proceso(int id) {
    memset(&P, 0, sizeof(P));
    P.pid = id;
    P.counter = 100;
    srand(getpid());
    for (int a = 0; a < NPROC; a++) {
        for (int b = 0; b < NPROC; b++) {
            if (a != b) {
                if (a != id) {
                    close(fds[a][b][1]);
                }
                if (b != id) {
                    close(fds[a][b][0]);
                }
            }
        }
    }
    close(res_pipe[0]);

//@TODO 3 | Loop principal: evento local, TRANSFER aleatorio, leer pipes, P0 inicia
//? Cada vuelta del loop simula el paso del tiempo. ¿Qué ocurre en cada iteración?
//- usleep(100000); P.clock = P.clock + 1 (evento local).
//- Si it < ITER, con probabilidad 1/2 y si counter ≥ 10: elige otro destino al azar, resta la cantidad, P.clock = P.clock + 1 y envía TRANSFER.
//- leer_pipes() para procesar lo que haya llegado.
//- Si eres P0, vas en la iteración 10 y no has tomado el snapshot → tomar_snapshot().
//- Sigue mientras no pases ITER o el snapshot no esté completo.
    int it = 0;
    while (it < ITER || snapshot_completo() == 0) {
        usleep(100000);
        P.clock = P.clock + 1;                  /* evento local */ //§
        if (it < ITER) {
            if (rand() % 2 == 0) {              /* probabilidad 1/2 */
                if (P.counter >= 10) {
                    int dest = rand() % NPROC;  /* un destino al azar distinto de mí */ //§
                    while (dest == id) {
                        dest = rand() % NPROC;
                    }
                    int cant = 1 + rand() % 10;
                    P.counter = P.counter - cant;   /* el emisor resta */ //§
                    P.clock = P.clock + 1; //§
                    enviar(dest, TRANSFER, cant); //§
                }
            }
        }
        leer_pipes(); //§
        if (id == 0) {
            if (it == 10) { //§
                if (P.snap_taken == 0) { //§
                    tomar_snapshot(); //§
                }
            }
        }
        it = it + 1;
    }
//@END
    int total_tr = 0;
    for (int j = 0; j < NPROC; j++) {
        total_tr = total_tr + P.transito[j];
    }
    Resultado r;
    r.pid = id;
    r.snap_counter = P.snap_counter;
    r.transito = total_tr;
    r.n_transito = P.n_transito;
    r.snap_clock = P.snap_clock;
    write(res_pipe[1], &r, sizeof(r));
    exit(0);
}

int main(void) {
    signal(SIGPIPE, SIG_IGN);       /* un proceso puede terminar antes que otro */
    for (int i = 0; i < NPROC; i++) {
        for (int j = 0; j < NPROC; j++) {
            if (i != j) {
                pipe(fds[i][j]);
            }
        }
    }
    pipe(res_pipe);
    for (int i = 0; i < NPROC; i++) {
        if (fork() == 0) {
            proceso(i);
        }
    }
    for (int i = 0; i < NPROC; i++) {
        for (int j = 0; j < NPROC; j++) {
            if (i != j) {
                close(fds[i][j][0]);
                close(fds[i][j][1]);
            }
        }
    }
    close(res_pipe[1]);

    int suma = 0;
    for (int k = 0; k < NPROC; k++) {   /* un resultado por proceso */
        Resultado r;
        int n = read(res_pipe[0], &r, sizeof(r));
        if (n == sizeof(r)) {
            printf("P%d: snap_counter=%d  en tránsito=%d (%d msgs)  reloj al snapshot=%d\n",
                   r.pid, r.snap_counter, r.transito, r.n_transito, r.snap_clock);
            suma = suma + r.snap_counter + r.transito;
        }
    }
    for (int k = 0; k < NPROC; k++) {
        wait(NULL);
    }
    printf("TOTAL del snapshot = %d (debe ser %d)\n", suma, 100 * NPROC);
    return 0;
}
