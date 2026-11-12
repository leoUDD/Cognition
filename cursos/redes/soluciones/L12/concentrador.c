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
//- Loop: n = recv(fd, buf + total, …); si n <= 0, break. Si no: total = total + n y buf[total] = '\0'.
//- Busca un \n con strchr; mientras exista: córtalo ahí (*nl = '\0') y procesa esa línea.
//- sscanf de TELEM o RELAY para sacar el ts; el pid sale de "ARES-%d".
//- write(pfd, &ev, sizeof(ev)) al padre.
//- memmove para correr el resto al inicio y total = total - bytes usados.
    char buf[512];
    int total = 0;
    while (1) {
        int n = recv(fd, buf + total, sizeof(buf) - total - 1, 0); //§
        if (n <= 0) { //§
            break;              /* la sonda cerró o hubo error */
        }
        total = total + n;
        buf[total] = '\0';

        char *nl = strchr(buf, '\n'); //§
        while (nl != NULL) {    /* hay al menos una línea completa */
            *nl = '\0';         /* corto la línea ahí */
            PendingEvent ev;
            char id[16], dst[16];
            int seq;
            float val;
            memset(&ev, 0, sizeof(ev));

            int valido = 0;
            if (sscanf(buf, "TELEM %15s %d %f %d", id, &seq, &val, &ev.ts) == 4) { //§
                valido = 1;
            }
            if (sscanf(buf, "RELAY %15s %15s %f %d", id, dst, &val, &ev.ts) == 4) { //§
                valido = 1;
            }
            if (valido == 1) {
                sscanf(id, "ARES-%d", &ev.pid); //§
                strncpy(ev.line, buf, MAX_BUF - 1);   /* copia la línea (máx. 127 letras) */
                write(pfd, &ev, sizeof(ev));   /* < PIPE_BUF: escritura atómica */ //§
            }

            int usado = (nl - buf) + 1;        /* largo de la línea + el \n */
            memmove(buf, nl + 1, total - usado + 1); //§
            total = total - usado; //§
            nl = strchr(buf, '\n');            /* ¿queda otra línea completa? */
        }
    }
//@END
}

/* Orden (ts, pid): negativo si a va primero, positivo si b va primero */
int cmp_ev(const void *a, const void *b) {
    const PendingEvent *x = (const PendingEvent *)a;
    const PendingEvent *y = (const PendingEvent *)b;
    if (x->ts < y->ts) {
        return -1;
    }
    if (x->ts > y->ts) {
        return 1;
    }
    if (x->pid < y->pid) {
        return -1;
    }
    if (x->pid > y->pid) {
        return 1;
    }
    return 0;
}

/* PADRE: escribe los pendientes ordenados por (ts, pid) */
void flush_log(void) {
//@TODO 2 | Ordenar y escribir en registro.log
//? Cada 2 segundos, ¿cómo escribes los pendientes en orden causal?
//- Si no hay pendientes, return.
//- qsort(pend, npend, sizeof(PendingEvent), cmp_ev): por ts y luego por pid.
//- fopen("registro.log", "a") y fprintf de cada uno.
//- fclose y npend = 0.
    if (npend == 0) {
        return;
    }
    qsort(pend, npend, sizeof(PendingEvent), cmp_ev); //§
    FILE *f = fopen("registro.log", "a"); //§
    for (int i = 0; i < npend; i++) {
        fprintf(f, "ts=%d P%d | %s\n", pend[i].ts, pend[i].pid, pend[i].line); //§
    }
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
//- p[0] listo: read de un PendingEvent; regla de recepción (si ev.ts > reloj, reloj = ev.ts; reloj = reloj + 1); guárdalo.
//- Si pasaron 2 s desde el último flush: flush_log().
    int srv = socket(AF_INET, SOCK_STREAM, 0); //§
    int opt = 1;
    setsockopt(srv, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
    struct sockaddr_in addr = {0};
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = INADDR_ANY;
    addr.sin_port = htons(PORT); //§
    if (bind(srv, (struct sockaddr *)&addr, sizeof(addr)) < 0) { //§
        perror("bind");
        return 1;
    }
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
        int maxfd = srv;
        if (p[0] > maxfd) {
            maxfd = p[0];
        }
        struct timeval tv;                      /* despertar cada 1 s */
        tv.tv_sec = 1;
        tv.tv_usec = 0;
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
            int n = read(p[0], &ev, sizeof(ev)); //§
            if (n == sizeof(ev)) {
                if (npend < MAX_PEND) {
                    if (ev.ts > reloj) {        /* regla de recepción: max + 1 */ //§
                        reloj = ev.ts; //§
                    }
                    reloj = reloj + 1; //§
                    pend[npend] = ev; //§
                    npend = npend + 1; //§
                }
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
