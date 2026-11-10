/* s1_cliente.c — envía 5 mensajes y espera el ACK de cada uno */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>

#define PORT 7001

int main(int argc, char *argv[]) {
    const char *ip = argc > 1 ? argv[1] : "127.0.0.1";
//@TODO 1 | socket + connect
//? Cliente TCP: socket, dirección y connect.
//- socket(AF_INET, SOCK_STREAM, 0).
//- sockaddr_in con AF_INET, htons(PORT) e inet_pton.
//- connect; si falla, perror.
    int fd = socket(AF_INET, SOCK_STREAM, 0); //§
    struct sockaddr_in srv;
    memset(&srv, 0, sizeof srv);
    srv.sin_family = AF_INET; //§
    srv.sin_port = htons(PORT); //§
    inet_pton(AF_INET, ip, &srv.sin_addr); //§
    if (connect(fd, (struct sockaddr *)&srv, sizeof srv) < 0) { perror("connect"); return 1; } //§
//@END
//@TODO 2 | 5 mensajes "MSG nave_OPA_1 dato_<i>\n", esperando ACK cada vez
//? Enviar y esperar respuesta, 5 veces.
//- for i en 1..5: snprintf "MSG nave_OPA_1 dato_%d\n" y send.
//- recv, termina el string e imprime.
//- close(fd).
    char msg[64], buf[256];
    for (int i = 1; i <= 5; i++) {
        snprintf(msg, sizeof msg, "MSG nave_OPA_1 dato_%d\n", i); //§
        send(fd, msg, strlen(msg), 0); //§
        int n = recv(fd, buf, sizeof(buf) - 1, 0); //§
        if (n <= 0) break; //§
        buf[n] = '\0'; //§
        printf("Servidor: %s", buf);
    }
    close(fd); //§
//@END
    return 0;
}
