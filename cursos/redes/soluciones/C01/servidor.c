/* servidor.c — Base SELENE (Control 01) */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <signal.h>
#include <sys/socket.h>
#include <sys/wait.h>
#include <netinet/in.h>
#include <arpa/inet.h>

#define PORT 7070
#define BUF_SIZE 256

char *checksum(const char *valor, char out[3]) {
    unsigned int s = 0;
    for (int i = 0; valor[i]; i++) s += (unsigned char)valor[i];
    snprintf(out, 3, "%02X", s % 256);
    return out;
}

typedef struct {
    char id[8];
    float alerta;
    float critico;
    int mayor;  /* 1: alerta si valor > umbral | 0: si valor < umbral */
} Umbral;

Umbral umbrales[] = {
    {"ARES-1", -40, -30, 1},
    {"ARES-2", 3.5, 6.0, 1},
    {"ARES-3", 750, 900, 1},
    {"ARES-4", 30, 15, 0},
};

//@TODO A.2 | (parte 1) evaluar(): 0 = normal, 1 = ALERTA, 2 = CRITICO
/* C estándar no permite funciones anidadas: evaluar() va fuera de handle_sonda() */
int evaluar(const Umbral *u, float v) {
    if (u->mayor) {
        if (v > u->critico) return 2; //§
        if (v > u->alerta) return 1; //§
    } else {
        if (v < u->critico) return 2; //§
        if (v < u->alerta) return 1; //§
    }
    return 0;
}
//@END

void handle_sonda(int fd) {
    char buf[BUF_SIZE];
//@TODO A.1 | Recibir CONNECT, validar el ID y responder HELLO o REJECT
    char id[16], resp[BUF_SIZE];
    Umbral *u = NULL;
    int n = recv(fd, buf, sizeof(buf) - 1, 0); //§
    if (n <= 0) return; //§
    buf[n] = '\0'; //§
    if (sscanf(buf, "CONNECT %15s", id) != 1) return; //§
    for (int i = 0; i < 4; i++)
        if (strcmp(umbrales[i].id, id) == 0) u = &umbrales[i]; //§
    if (u == NULL) {
        snprintf(resp, sizeof resp, "REJECT %s\n", id); //§
        send(fd, resp, strlen(resp), 0); //§
        return;
    }
    snprintf(resp, sizeof resp, "HELLO %s\n", id); //§
    send(fd, resp, strlen(resp), 0); //§
    printf("[BASE] %s conectada\n", id);
//@END
//@TODO A.2 | Loop TELEM: validar checksum, ACK/NACK, evaluar y ALERT
    const char *nivel_txt[] = { "NORMAL", "ALERTA", "CRITICO" };
    while ((n = recv(fd, buf, sizeof(buf) - 1, 0)) > 0) { //§
        buf[n] = '\0'; //§
        char tid[16], valor[32], cs[8], calc[3];
        int seq;
        if (sscanf(buf, "TELEM %15s %d %31s %7s", tid, &seq, valor, cs) != 4) continue; //§
        if (strcmp(checksum(valor, calc), cs) != 0) { //§
            snprintf(resp, sizeof resp, "NACK %s %d\n", tid, seq); //§
            send(fd, resp, strlen(resp), 0);
            continue;
        }
        int nivel = evaluar(u, atof(valor)); //§
        int len = snprintf(resp, sizeof resp, "ACK %s %d\n", tid, seq); //§
        if (nivel > 0) /* ACK + ALERT en un solo send: TCP no separa mensajes */
            snprintf(resp + len, sizeof resp - len, "ALERT %s %s valor=%s\n", tid, nivel_txt[nivel], valor); //§
        send(fd, resp, strlen(resp), 0); //§
        printf("[BASE] %s seq=%d valor=%s -> %s\n", tid, seq, valor, nivel_txt[nivel]);
    }
//@END
}

int main(void) {
//@TODO A.3 | socket, bind, listen y fork() por cada sonda
    int srv = socket(AF_INET, SOCK_STREAM, 0); //§
    int opt = 1;
    setsockopt(srv, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof opt);
    struct sockaddr_in addr;
    memset(&addr, 0, sizeof addr);
    addr.sin_family = AF_INET; //§
    addr.sin_addr.s_addr = INADDR_ANY; //§
    addr.sin_port = htons(PORT); //§
    if (bind(srv, (struct sockaddr *)&addr, sizeof addr) < 0) { perror("bind"); exit(1); } //§
    listen(srv, 8); //§
    signal(SIGCHLD, SIG_IGN);                   /* evita zombis */ //§
    printf("[BASE] escuchando en %d\n", PORT);
    while (1) {
        int cli = accept(srv, NULL, NULL); //§
        if (cli < 0) continue;
        fflush(stdout);
        if (fork() == 0) { //§
            close(srv);                         /* el hijo no acepta conexiones */ //§
            handle_sonda(cli); //§
            close(cli);
            exit(0); //§
        }
        close(cli);                             /* el padre no habla con la sonda */ //§
    }
//@END
    return 0;
}
