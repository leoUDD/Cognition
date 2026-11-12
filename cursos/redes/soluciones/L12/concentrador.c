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
    char buf[512]; //: buffer donde acumulo lo que llega por TCP
    int total = 0; //: cuántos bytes tengo acumulados
    while (1) { //: recibo hasta que la sonda cierre
        int n = recv(fd, buf + total, sizeof(buf) - total - 1, 0); //§ //: recibo a continuación de lo que ya tenía (dejo 1 espacio para el \0)
        if (n <= 0) { //§ //: 0 = la sonda cerró; -1 = error
            break;              /* la sonda cerró o hubo error */
        }
        total = total + n; //: sumo lo recibido
        buf[total] = '\0'; //: cierro el string para usar strchr y sscanf

        char *nl = strchr(buf, '\n'); //§ //: busco el primer salto de línea (NULL si no hay)
        while (nl != NULL) {    /* hay al menos una línea completa */
            *nl = '\0';         /* corto la línea ahí */
            PendingEvent ev; //: el evento que mandaré al padre
            char id[16], dst[16]; //: aquí quedan el id de la sonda y el destino
            int seq; //: número de secuencia (no lo uso, pero sscanf lo lee)
            float val; //: valor medido
            memset(&ev, 0, sizeof(ev)); //: dejo el evento en ceros

            int valido = 0; //: ¿la línea tiene un formato conocido?
            if (sscanf(buf, "TELEM %15s %d %f %d", id, &seq, &val, &ev.ts) == 4) { //§ //: ¿es TELEM? sscanf retorna cuántos campos leyó
                valido = 1; //: sí, es válida
            }
            if (sscanf(buf, "RELAY %15s %15s %f %d", id, dst, &val, &ev.ts) == 4) { //§ //: ¿es RELAY?
                valido = 1; //: sí, es válida
            }
            if (valido == 1) { //: solo mando líneas válidas
                sscanf(id, "ARES-%d", &ev.pid); //§ //: saco el número de "ARES-3" → pid 3
                strncpy(ev.line, buf, MAX_BUF - 1);   /* copia la línea (máx. 127 letras) */
                write(pfd, &ev, sizeof(ev));   /* < PIPE_BUF: escritura atómica */ //§
            }

            int usado = (nl - buf) + 1;        /* largo de la línea + el \n */
            memmove(buf, nl + 1, total - usado + 1); //§ //: corro lo que sobra al inicio del buffer
            total = total - usado; //§ //: descuento la línea ya procesada
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
    if (npend == 0) { //: ¿no hay nada pendiente?
        return; //: entonces no hay nada que escribir
    }
    qsort(pend, npend, sizeof(PendingEvent), cmp_ev); //§ //: ordeno por (ts, pid): orden causal
    FILE *f = fopen("registro.log", "a"); //§ //: abro el log para agregar al final ("a" = append)
    for (int i = 0; i < npend; i++) { //: recorro los eventos ya ordenados
        fprintf(f, "ts=%d P%d | %s\n", pend[i].ts, pend[i].pid, pend[i].line); //§ //: escribo uno por línea
    }
    fclose(f); //: cierro el archivo
    printf("[concentrador L=%d] %d eventos escritos en el log\n", reloj, npend); //: aviso en pantalla cuántos escribí
    npend = 0; //§ //: vacío la lista de pendientes
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
    int srv = socket(AF_INET, SOCK_STREAM, 0); //§ //: socket TCP (IPv4)
    int opt = 1; //: valor para activar la opción
    setsockopt(srv, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt)); //: permite reusar el puerto al reiniciar
    struct sockaddr_in addr = {0}; //: dirección del servidor, en ceros
    addr.sin_family = AF_INET; //: IPv4
    addr.sin_addr.s_addr = INADDR_ANY; //: escucho en todas las interfaces
    addr.sin_port = htons(PORT); //§ //: puerto en orden de red
    if (bind(srv, (struct sockaddr *)&addr, sizeof(addr)) < 0) { //§ //: asocio el socket al puerto; -1 si falla
        perror("bind"); //: muestro el motivo del error
        return 1; //: termino con error
    }
    listen(srv, 8); //§ //: empiezo a aceptar conexiones (cola de 8)
    pipe(p); //§ //: pipe hijos → padre, ANTES de cualquier fork
    signal(SIGCHLD, SIG_IGN); //: los hijos que terminan no quedan zombis
    printf("[concentrador] escuchando en %d\n", PORT); //: aviso que estoy listo

    time_t ultimo = time(NULL); //: momento del último flush
    while (1) { //: el padre atiende para siempre
        fd_set rd; //: conjunto de descriptores a vigilar
        FD_ZERO(&rd); //: lo vacío en cada vuelta
        FD_SET(srv, &rd); //§ //: vigilo el socket: ¿llega una sonda nueva?
        FD_SET(p[0], &rd); //§ //: vigilo la pipe: ¿un hijo mandó un evento?
        int maxfd = srv; //: select necesita el descriptor más grande
        if (p[0] > maxfd) { //: ¿la pipe tiene un número mayor?
            maxfd = p[0]; //: entonces ese es el mayor
        }
        struct timeval tv;                      /* despertar cada 1 s */
        tv.tv_sec = 1; //: 1 segundo…
        tv.tv_usec = 0; //: …y 0 microsegundos
        select(maxfd + 1, &rd, NULL, NULL, &tv); //§ //: espero algo o máximo 1 s (para poder hacer el flush)

        if (FD_ISSET(srv, &rd)) { //: ¿llegó una sonda nueva?
            int cli = accept(srv, NULL, NULL); //§ //: la acepto: descriptor nuevo solo para ella
            fflush(stdout);                     /* evita duplicar el buffer en el hijo */
            if (fork() == 0) { //§ //: ¿soy el hijo?
                close(srv); //§ //: el hijo no acepta clientes
                close(p[0]); //§ //: el hijo no lee la pipe, solo escribe
                atender_sonda(cli, p[1]); //: atiendo a la sonda y mando sus eventos al padre
                close(cli); //: el hijo terminó con la sonda
                exit(0); //: el hijo termina aquí
            }
            close(cli); //§ //: el padre no habla con la sonda: cierra su copia
        }
        if (FD_ISSET(p[0], &rd)) { //: ¿un hijo mandó un evento?
            PendingEvent ev; //: aquí recibo el evento que mandó un hijo
            int n = read(p[0], &ev, sizeof(ev)); //§ //: leo un evento completo
            if (n == sizeof(ev)) { //: ¿llegó entero?
                if (npend < MAX_PEND) { //: ¿queda espacio en la lista?
                    if (ev.ts > reloj) {        /* regla de recepción: max + 1 */ //§
                        reloj = ev.ts; //§ //: salto a su ts (el max)
                    }
                    reloj = reloj + 1; //§ //: recibir es un evento: +1
                    pend[npend] = ev; //§ //: lo guardo al final de la lista
                    npend = npend + 1; //§ //: ahora hay uno más
                }
            }
        }
        if (time(NULL) - ultimo >= 2) { //§ //: ¿pasaron 2 segundos desde el último flush?
            flush_log(); //§ //: escribo los pendientes ordenados
            ultimo = time(NULL); //: recuerdo cuándo lo hice
        }
    }
//@END
    return 0;
}
