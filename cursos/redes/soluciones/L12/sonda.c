/* sonda.c — sonda modificada: TELEM <id> <seq> <val> <ts> */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>

#define PORT 9090

int main(int argc, char *argv[]) {
    if (argc < 4) {
        fprintf(stderr, "Uso: ./sonda <ARES-N> <IP> <valor_inicial> [ARES-destino]\n");
        return 1;
    }
    const char *id = argv[1];
    float valor = atof(argv[3]);
    int reloj = 0;
    char msg[128];

    int fd = socket(AF_INET, SOCK_STREAM, 0);
    struct sockaddr_in srv = {0};
    srv.sin_family = AF_INET;
    srv.sin_port = htons(PORT);
    inet_pton(AF_INET, argv[2], &srv.sin_addr);
    if (connect(fd, (struct sockaddr *)&srv, sizeof srv) < 0) { perror("connect"); return 1; }

    for (int seq = 1; seq <= 5; seq++) {
        valor += 0.5f;
//@TODO 1 | Regla de envío: incrementar el reloj y adjuntar ts
//? Cada TELEM que envía la sonda es un evento de envío. ¿Qué le pasa al reloj y dónde va el ts en el mensaje?
//- reloj++.
//- snprintf("TELEM %s %d %.2f %d\n", id, seq, valor, reloj).
        reloj++; //§
        snprintf(msg, sizeof msg, "TELEM %s %d %.2f %d\n", id, seq, valor, reloj); //§
//@END
        send(fd, msg, strlen(msg), 0);
        printf("[%s] envía %s", id, msg);
        usleep(300000);
    }
    if (argc >= 5) {            /* opcional: un RELAY hacia otra sonda */
        reloj++;
        snprintf(msg, sizeof msg, "RELAY %s %s %.2f %d\n", id, argv[4], valor, reloj);
        send(fd, msg, strlen(msg), 0);
    }
    close(fd);
    return 0;
}
