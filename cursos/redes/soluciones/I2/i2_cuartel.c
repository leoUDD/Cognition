/* i2_cuartel.c — cuartel MCRN: servidor RPC concurrente */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <signal.h>
#include <sys/socket.h>
#include <netinet/in.h>

#define PORT 8010

void atender(int fd) {
//@TODO 1 | Responder las dos funciones RPC
//? Es el skeleton RPC: recibe CALL, decide qué función es y responde RESULT. ¿Qué partes tiene cada CALL?
//- while (recv > 0): termina el string.
//- sscanf(buf, "CALL %47s %31s %f", fn, nave, &v); si no son 3, RESULT ERROR.
//- strcmp(fn, "solicitar_reabastecimiento") → "RESULT REBASTECER_EN <base al azar>".
//- strcmp(fn, "solicitar_ordenes") → "RESULT ATACAR" o "RESULT RETIRARSE".
//- send() la respuesta.
    char buf[256], fn[48], nave[32], resp[96];
    float v;
    int n;
    const char *bases[] = { "Tycho", "Ceres", "Marte" };
    while ((n = recv(fd, buf, sizeof(buf) - 1, 0)) > 0) { //§
        buf[n] = '\0'; //§
        if (sscanf(buf, "CALL %47s %31s %f", fn, nave, &v) != 3) { send(fd, "RESULT ERROR\n", 13, 0); continue; } //§
        if (strcmp(fn, "solicitar_reabastecimiento") == 0) //§
            snprintf(resp, sizeof resp, "RESULT REBASTECER_EN %s\n", bases[rand() % 3]); //§
        else if (strcmp(fn, "solicitar_ordenes") == 0) //§
            snprintf(resp, sizeof resp, "RESULT %s\n", rand() % 2 ? "ATACAR" : "RETIRARSE"); //§
        else
            snprintf(resp, sizeof resp, "RESULT ERROR\n");
        printf("[CUARTEL] %s(%s, %.1f) -> %s", fn, nave, v, resp + 7);
        fflush(stdout);
        send(fd, resp, strlen(resp), 0); //§
    }
//@END
}

int main(void) {
//@TODO 2 | Servidor concurrente con fork()
//? Es el mismo servidor concurrente de siempre. ¿Lo puedes escribir de memoria?
//- socket, setsockopt, sockaddr_in con htons, bind, listen.
//- signal(SIGCHLD, SIG_IGN).
//- Loop: accept → fork. Hijo: close(srv), srand(getpid()), atender, exit. Padre: close(cli).
    int srv = socket(AF_INET, SOCK_STREAM, 0); //§
    setsockopt(srv, SOL_SOCKET, SO_REUSEADDR, &(int){1}, sizeof(int));
    struct sockaddr_in addr;
    memset(&addr, 0, sizeof addr);
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = INADDR_ANY;
    addr.sin_port = htons(PORT);
    if (bind(srv, (struct sockaddr *)&addr, sizeof addr) < 0) { perror("bind"); return 1; } //§
    listen(srv, 10); //§
    signal(SIGCHLD, SIG_IGN); //§
    while (1) {
        int cli = accept(srv, NULL, NULL); //§
        if (cli < 0) continue;
        if (fork() == 0) { //§
            close(srv); //§
            srand(getpid());
            atender(cli); //§
            close(cli);
            exit(0);
        }
        close(cli); //§
    }
//@END
}
