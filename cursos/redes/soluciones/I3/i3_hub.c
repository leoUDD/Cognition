/* i3_hub.c — hub regional: fork por nodo + pipe hijos→padre para agregar estados */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <signal.h>
#include <sys/socket.h>
#include <sys/select.h>
#include <netinet/in.h>
#include <arpa/inet.h>

#define PORT_HUB 9001
#define PORT_LACONIA 9002
#define MAX_GATES 5

/* Con fork() cada hijo tiene su propia memoria: el estado de TODAS las gates
   lo guarda el padre, y los hijos le informan cada cambio por una pipe. */
typedef struct { char gate[32]; char estado[16]; } Cambio;   /* < PIPE_BUF: write atómico */

Cambio gates[MAX_GATES];
int n_gates = 0;
int alerta_enviada = 0;

/* HIJO: lee GATE_STATUS del nodo y reenvía al padre */
void atender_nodo(int fd, int pfd) {
//@TODO 1 | Leer líneas del socket y avisar al padre; al desconectar, INACTIVA
//? Cada hijo atiende un nodo, pero la tabla la tiene el padre. ¿Cómo le cuenta el hijo cada cambio?
//- fdopen(fd, "r"): también sirve para sockets y permite usar fgets.
//- Por cada línea: sscanf("GATE_STATUS %31s %15s %ld") en un struct Cambio.
//- write(pfd, &c, sizeof c): un struct de tamaño fijo por write es atómico.
//- Cuando fgets devuelve NULL, el nodo se desconectó: manda un Cambio con estado "INACTIVA".
    FILE *in = fdopen(fd, "r");             /* fdopen también sirve para sockets */ //§
    char linea[128];
    Cambio c = { "", "" };
    long ts;
    while (fgets(linea, sizeof linea, in)) { //§
        if (sscanf(linea, "GATE_STATUS %31s %15s %ld", c.gate, c.estado, &ts) == 3) //§
            write(pfd, &c, sizeof c); //§
    }
    if (c.gate[0]) {                        /* el nodo se desconectó */ //§
        strcpy(c.estado, "INACTIVA"); //§
        write(pfd, &c, sizeof c); //§
    }
    fclose(in);
//@END
}

/* PADRE: llamada a Laconia (stub RPC) */
void alertar_laconia(int activas) {
    int s = socket(AF_INET, SOCK_STREAM, 0);
    struct sockaddr_in l;
    memset(&l, 0, sizeof l);
    l.sin_family = AF_INET;
    l.sin_port = htons(PORT_LACONIA);
    inet_pton(AF_INET, "127.0.0.1", &l.sin_addr);
    if (connect(s, (struct sockaddr *)&l, sizeof l) < 0) { perror("laconia"); close(s); return; }
    char msg[64], resp[96];
    snprintf(msg, sizeof msg, "ALERT NIVEL_3 %d gates activas\n", activas);
    send(s, msg, strlen(msg), 0);
    int n = recv(s, resp, sizeof(resp) - 1, 0);
    if (n > 0) { resp[n] = '\0'; printf("[HUB] Laconia responde: %s", resp); }
    close(s);
}

/* PADRE: actualizar tabla y decidir si alertar */
void registrar(const Cambio *c) {
//@TODO 2 | Agregación: último estado por gate; alerta al cruzar a >= 3 ACTIVA
//? El padre guarda el ÚLTIMO estado de cada gate. ¿Cuándo debe avisar a Laconia sin repetir la alerta?
//- Busca la gate en la tabla; si no está, agrégala.
//- Reemplaza su estado por el nuevo.
//- Cuenta cuántas están en "ACTIVA".
//- Si activas ≥ 3 y aún no alertaste → alertar_laconia y alerta_enviada = 1.
//- Si activas < 3 → alerta_enviada = 0 (para poder alertar de nuevo después).
    int i;
    for (i = 0; i < n_gates; i++) if (strcmp(gates[i].gate, c->gate) == 0) break; //§
    if (i == n_gates) { if (n_gates == MAX_GATES) return; n_gates++; } //§
    gates[i] = *c; //§
    int activas = 0;
    for (int k = 0; k < n_gates; k++) if (strcmp(gates[k].estado, "ACTIVA") == 0) activas++; //§
    printf("[HUB] %s -> %s (activas: %d)\n", c->gate, c->estado, activas);
    if (activas >= 3 && !alerta_enviada) {  /* solo al cruzar el umbral, no en cada mensaje */ //§
        alertar_laconia(activas); //§
        alerta_enviada = 1; //§
    } else if (activas < 3) {
        alerta_enviada = 0; //§
    }
    fflush(stdout);
//@END
}

int main(void) {
    int p[2];
    pipe(p);
    signal(SIGCHLD, SIG_IGN);
    int srv = socket(AF_INET, SOCK_STREAM, 0);
    setsockopt(srv, SOL_SOCKET, SO_REUSEADDR, &(int){1}, sizeof(int));
    struct sockaddr_in addr;
    memset(&addr, 0, sizeof addr);
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = INADDR_ANY;
    addr.sin_port = htons(PORT_HUB);
    if (bind(srv, (struct sockaddr *)&addr, sizeof addr) < 0) { perror("bind"); return 1; }
    listen(srv, MAX_GATES);
    printf("[HUB] escuchando en %d\n", PORT_HUB);
    fflush(stdout);
//@TODO 3 | select() sobre el socket de escucha y la pipe de los hijos
//? El padre tiene que vigilar dos cosas a la vez: nuevas conexiones y mensajes de sus hijos. ¿Qué función espera por varias a la vez?
//- Loop: FD_ZERO; FD_SET(srv) y FD_SET(p[0]).
//- select(max + 1, &rd, NULL, NULL, NULL).
//- Si srv está listo: accept y fork (el hijo cierra srv y p[0], atiende y sale; el padre cierra cli).
//- Si p[0] está listo: read de un Cambio y registrar(&c).
    while (1) {
        fd_set rd;
        FD_ZERO(&rd);
        FD_SET(srv, &rd); //§
        FD_SET(p[0], &rd); //§
        select((srv > p[0] ? srv : p[0]) + 1, &rd, NULL, NULL, NULL); //§
        if (FD_ISSET(srv, &rd)) {
            int cli = accept(srv, NULL, NULL); //§
            if (fork() == 0) { //§
                close(srv); close(p[0]); //§
                atender_nodo(cli, p[1]); //§
                exit(0);
            }
            close(cli); //§
        }
        if (FD_ISSET(p[0], &rd)) {
            Cambio c;
            if (read(p[0], &c, sizeof c) == sizeof c) registrar(&c); //§
        }
    }
//@END
}
