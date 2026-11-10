/* s3_mcrn.c — protocolo REPORT/QUERY/ALERT/STATUS con buffer acumulador */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>

#define PORT 7003
#define MAX_AGENTES 10

/* Atención: si usáramos fork() por cliente, cada hijo tendría su PROPIA copia de esta tabla.
   Por eso el servidor es iterativo: un proceso, la tabla es compartida entre clientes sucesivos. */
typedef struct { char nombre[32]; char dato[128]; } Agente;
Agente agentes[MAX_AGENTES];
int n_agentes = 0;

/* Retorna 1 si hay que desconectar al cliente */
int procesar_mensaje(char *msg, int fd) {
//@TODO 1 | Despachar los 4 tipos de mensaje
    char a[32], resto[128], resp[200];
    int nivel;
    if (sscanf(msg, "REPORT %31s %127[^\n]", a, resto) == 2) { //§
        int i;
        for (i = 0; i < n_agentes; i++) if (strcmp(agentes[i].nombre, a) == 0) break; //§
        if (i == n_agentes && n_agentes < MAX_AGENTES) { //§
            strcpy(agentes[i].nombre, a);
            n_agentes++; //§
        }
        if (i < MAX_AGENTES) snprintf(agentes[i].dato, sizeof agentes[i].dato, "%s", resto); //§
        snprintf(resp, sizeof resp, "STORED\n");
    } else if (sscanf(msg, "QUERY %31s", a) == 1) { //§
        snprintf(resp, sizeof resp, "UNKNOWN\n");
        for (int i = 0; i < n_agentes; i++)
            if (strcmp(agentes[i].nombre, a) == 0) snprintf(resp, sizeof resp, "%s\n", agentes[i].dato); //§
    } else if (sscanf(msg, "ALERT %d %127[^\n]", &nivel, resto) == 2) { //§
        time_t t = time(NULL);
        char hora[16];
        strftime(hora, sizeof hora, "%H:%M:%S", localtime(&t));
        printf("[%s] ALERTA nivel %d: %s\n", hora, nivel, resto); //§
        send(fd, "ACK_ALERT\n", 10, 0); //§
        return nivel == 3;              /* nivel 3: desconectar tras responder */ //§
    } else if (strcmp(msg, "STATUS") == 0) { //§
        snprintf(resp, sizeof resp, "AGENTS %d\n", n_agentes); //§
    } else {
        snprintf(resp, sizeof resp, "ERROR\n");
    }
    send(fd, resp, strlen(resp), 0); //§
    return 0;
//@END
}

void atender(int fd) {
//@TODO 2 | Buffer acumulador: procesar solo líneas completas
    char buf[4096];
    int total = 0, n;
    while ((n = recv(fd, buf + total, sizeof(buf) - total - 1, 0)) > 0) { //§
        total += n; //§
        buf[total] = '\0'; //§
        char *nl;
        while ((nl = strchr(buf, '\n')) != NULL) { //§
            *nl = '\0'; //§
            if (nl > buf && nl[-1] == '\r') nl[-1] = '\0';
            int salir = procesar_mensaje(buf, fd); //§
            int usado = (nl - buf) + 1;
            memmove(buf, nl + 1, total - usado + 1);    /* +1 copia el '\0' */ //§
            total -= usado; //§
            if (salir) return;
        }
        if (total >= (int)sizeof(buf) - 1) total = 0;   /* línea demasiado larga: descartar */
    }
//@END
}

int main(void) {
    int srv = socket(AF_INET, SOCK_STREAM, 0);
    setsockopt(srv, SOL_SOCKET, SO_REUSEADDR, &(int){1}, sizeof(int));
    struct sockaddr_in addr;
    memset(&addr, 0, sizeof addr);
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = INADDR_ANY;
    addr.sin_port = htons(PORT);
    if (bind(srv, (struct sockaddr *)&addr, sizeof addr) < 0) { perror("bind"); return 1; }
    listen(srv, 10);
    printf("[MCRN] escuchando en %d\n", PORT);
    fflush(stdout);
    while (1) {
        int cli = accept(srv, NULL, NULL);
        if (cli < 0) continue;
        atender(cli);
        close(cli);
    }
}
