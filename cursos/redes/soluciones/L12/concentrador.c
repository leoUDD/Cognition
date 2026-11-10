/* concentrador.c — telemetría con orden causal (Lamport) */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <signal.h>
#include <time.h>
#include <sys/socket.h>
#include <sys/select.h>
#include <netinet/in.h>

#define PORT     9090
#define MAX_BUF  128
#define MAX_PEND 64

typedef struct {
    int ts;
    int pid;                /* id numérico de la sonda */
    char line[MAX_BUF];     /* línea completa para el log */
} PendingEvent;

PendingEvent pend[MAX_PEND];
int npend = 0;
int reloj = 0;              /* reloj Lamport del concentrador */

/* HIJO: atiende una sonda y manda cada evento al padre por la pipe */
void atender_sonda(int fd, int pfd) {
//@TODO 1 | Recibir líneas (buffer acumulador), parsear ts y enviar al padre
//? El hijo recibe texto por TCP (puede llegar partido o pegado) y debe pasarle cada evento al padre. ¿Cómo separas las líneas?
//- Acumula: n = recv(fd, buf + total, …); total += n; buf[total] = '\0'.
//- Mientras haya un \n (strchr): córtalo ahí y procesa esa línea.
//- sscanf de TELEM o RELAY para sacar el ts; el pid sale de "ARES-%d".
//- write(pfd, &ev, sizeof ev) al padre.
//- memmove para correr el resto al inicio y total -= bytes usados.
    char buf[512];
    int total = 0, n;
    while ((n = recv(fd, buf + total, sizeof(buf) - total - 1, 0)) > 0) { //§
        total += n;
        buf[total] = '\0';
        char *nl;
        while ((nl = strchr(buf, '\n')) != NULL) { //§
            *nl = '\0';
            PendingEvent ev;
            char id[16], dst[16];
            int seq;
            float val;
            memset(&ev, 0, sizeof ev);
            if (sscanf(buf, "TELEM %15s %d %f %d", id, &seq, &val, &ev.ts) == 4 || //§
                sscanf(buf, "RELAY %15s %15s %f %d", id, dst, &val, &ev.ts) == 4) { //§
                sscanf(id, "ARES-%d", &ev.pid); //§
                snprintf(ev.line, sizeof ev.line, "%.120s", buf);
                write(pfd, &ev, sizeof ev);   /* < PIPE_BUF: escritura atómica */ //§
            }
            int usado = (nl - buf) + 1;
            memmove(buf, nl + 1, total - usado + 1); //§
            total -= usado; //§
        }
    }
//@END
}

int cmp_ev(const void *a, const void *b) {
    const PendingEvent *x = a, *y = b;
    if (x->ts != y->ts) return x->ts - y->ts;
    return x->pid - y->pid;
}

/* PADRE: escribe los pendientes ordenados por (ts, pid) */
void flush_log(void) {
//@TODO 2 | Ordenar y escribir en registro.log
//? Cada 2 segundos, ¿cómo escribes los pendientes en orden causal?
//- Si no hay pendientes, return.
//- qsort(pend, npend, sizeof(PendingEvent), cmp_ev): por ts y luego por pid.
//- fopen("registro.log", "a") y fprintf de cada uno.
//- fclose y npend = 0.
    if (npend == 0) return;
    qsort(pend, npend, sizeof(PendingEvent), cmp_ev); //§
    FILE *f = fopen("registro.log", "a"); //§
    for (int i = 0; i < npend; i++)
        fprintf(f, "ts=%d P%d | %s\n", pend[i].ts, pend[i].pid, pend[i].line); //§
    fclose(f);
    printf("[concentrador L=%d] %d eventos escritos en el log\n", reloj, npend);
    npend = 0; //§
//@END
}

int main(void) {
    int p[2];
//@TODO 3 | Socket servidor, pipe hijos→padre y loop con select()
//? El padre debe aceptar sondas nuevas, leer eventos de la pipe y hacer el flush cada 2 s, todo sin bloquearse en una sola cosa.
//- Socket servidor (socket, bind, listen) y pipe(p), ANTES de cualquier fork.
//- Loop: FD_SET(srv) y FD_SET(p[0]); select con timeout de 1 s.
//- srv listo: accept y fork (el hijo cierra srv y p[0] y atiende; el padre cierra cli).
//- p[0] listo: read de un PendingEvent; reloj = max(reloj, ev.ts) + 1; guárdalo.
//- Si pasaron 2 s desde el último flush: flush_log().
    int srv = socket(AF_INET, SOCK_STREAM, 0); //§
    int opt = 1;
    setsockopt(srv, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof opt);
    struct sockaddr_in addr = {0};
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = INADDR_ANY;
    addr.sin_port = htons(PORT); //§
    if (bind(srv, (struct sockaddr *)&addr, sizeof addr) < 0) { perror("bind"); return 1; } //§
    listen(srv, 8); //§
    pipe(p); //§
    signal(SIGCHLD, SIG_IGN);
    printf("[concentrador] escuchando en %d\n", PORT);

    time_t ultimo = time(NULL);
    while (1) {
        fd_set rd;
        FD_ZERO(&rd);
        FD_SET(srv, &rd); //§
        FD_SET(p[0], &rd); //§
        int maxfd = srv > p[0] ? srv : p[0];
        struct timeval tv = {1, 0};             /* despertar cada 1 s */
        select(maxfd + 1, &rd, NULL, NULL, &tv); //§

        if (FD_ISSET(srv, &rd)) {
            int cli = accept(srv, NULL, NULL); //§
            fflush(stdout);                     /* evita duplicar el buffer en el hijo */
            if (fork() == 0) { //§
                close(srv); //§
                close(p[0]); //§
                atender_sonda(cli, p[1]);
                close(cli);
                exit(0);
            }
            close(cli); //§
        }
        if (FD_ISSET(p[0], &rd)) {
            PendingEvent ev;
            if (read(p[0], &ev, sizeof ev) == sizeof ev && npend < MAX_PEND) { //§
                reloj = (ev.ts > reloj ? ev.ts : reloj) + 1;   /* regla de recepción */ //§
                pend[npend++] = ev; //§
            }
        }
        if (time(NULL) - ultimo >= 2) { //§
            flush_log(); //§
            ultimo = time(NULL);
        }
    }
//@END
    return 0;
}
