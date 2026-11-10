/* s2_ceres.c — servidor concurrente de atraque */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <signal.h>
#include <sys/socket.h>
#include <netinet/in.h>

#define PORT 7002

const char *bahia_para(const char *carga) {
//@TODO 1 | Tabla carga -> bahía
//? Es un mapeo de texto a texto. ¿Qué retornas si la carga no existe?
//- Una comparación strcmp por cada tipo de carga, retornando su bahía.
//- Si ninguna coincide: return NULL.
    if (strcmp(carga, "AGUA") == 0)        return "Bahia-A"; //§
    if (strcmp(carga, "SILICATOS") == 0)   return "Bahia-B"; //§
    if (strcmp(carga, "OXIGENO") == 0)     return "Bahia-C"; //§
    if (strcmp(carga, "COMBUSTIBLE") == 0) return "Bahia-D"; //§
    return NULL; //§
//@END
}

void atender_nave(int fd) {
//@TODO 2 | Protocolo DOCK / CAST_OFF
//? Una nave puede atracar varias veces y luego despedirse. ¿Qué revisas primero?
//- while (recv > 0): termina el string.
//- Si empieza con CAST_OFF → envía BYE y break.
//- Si sscanf "DOCK %s %s" funciona → bahia_para(carga).
//- Responde ASIGNADO <bahía> o ERROR. Al salir: close(fd).
    char buf[256], nave[32], carga[32], resp[64];
    int n;
    while ((n = recv(fd, buf, sizeof(buf) - 1, 0)) > 0) { //§
        buf[n] = '\0'; //§
        if (strncmp(buf, "CAST_OFF", 8) == 0) { //§
            send(fd, "BYE\n", 4, 0); //§
            break; //§
        }
        const char *b = NULL;
        if (sscanf(buf, "DOCK %31s %31s", nave, carga) == 2) //§
            b = bahia_para(carga); //§
        if (b) {
            snprintf(resp, sizeof resp, "ASIGNADO %s\n", b); //§
            printf("[CERES %d] %s con %s -> %s\n", getpid(), nave, carga, b);
        } else {
            snprintf(resp, sizeof resp, "ERROR\n");
        }
        send(fd, resp, strlen(resp), 0); //§
    }
    close(fd); //§
//@END
}

int main(void) {
//@TODO 3 | Servidor concurrente: fork() por cliente y sin zombis
//? El patrón del servidor concurrente. Escríbelo sin mirar.
//- socket, setsockopt, bind, listen.
//- signal(SIGCHLD, SIG_IGN).
//- Loop: accept → fork. Hijo: close(srv) inmediatamente, atender_nave, exit. Padre: close(cli).
    int srv = socket(AF_INET, SOCK_STREAM, 0); //§
    setsockopt(srv, SOL_SOCKET, SO_REUSEADDR, &(int){1}, sizeof(int));
    struct sockaddr_in addr;
    memset(&addr, 0, sizeof addr);
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = INADDR_ANY;
    addr.sin_port = htons(PORT); //§
    if (bind(srv, (struct sockaddr *)&addr, sizeof addr) < 0) { perror("bind"); return 1; } //§
    listen(srv, 10); //§
    signal(SIGCHLD, SIG_IGN);                   /* sin zombis */ //§
    printf("[CERES] escuchando en %d\n", PORT);
    while (1) {
        int cli = accept(srv, NULL, NULL); //§
        if (cli < 0) continue;
        fflush(stdout);
        if (fork() == 0) { //§
            close(srv);                         /* inmediatamente después del fork */ //§
            atender_nave(cli); //§
            exit(0); //§
        }
        close(cli); //§
    }
//@END
}
