/* s1_relay.c — servidor TCP de 1 cliente, eco con ACK */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>

#define PORT 7001

int main(void) {
//@TODO 1 | socket, SO_REUSEADDR, bind, listen, accept (1 cliente)
    int srv = socket(AF_INET, SOCK_STREAM, 0); //§
    setsockopt(srv, SOL_SOCKET, SO_REUSEADDR, &(int){1}, sizeof(int));
    struct sockaddr_in addr;
    memset(&addr, 0, sizeof addr);
    addr.sin_family = AF_INET; //§
    addr.sin_addr.s_addr = INADDR_ANY; //§
    addr.sin_port = htons(PORT); //§
    if (bind(srv, (struct sockaddr *)&addr, sizeof addr) < 0) { perror("bind"); return 1; } //§
    listen(srv, 1); //§
    printf("[RELAY] escuchando en %d\n", PORT);
    int cli = accept(srv, NULL, NULL); //§
//@END
//@TODO 2 | Loop: recv, imprimir, responder "ACK <msg>\n"; terminar si recv <= 0
    char buf[256], resp[300];
    int n;
    while ((n = recv(cli, buf, sizeof(buf) - 1, 0)) > 0) { //§
        buf[n] = '\0'; //§
        buf[strcspn(buf, "\n")] = '\0';             /* quitar el \n */ //§
        printf("[RELAY] Recibido: %s\n", buf);
        snprintf(resp, sizeof resp, "ACK %s\n", buf); //§
        send(cli, resp, strlen(resp), 0); //§
    }
    printf("[RELAY] cliente desconectado\n");
    close(cli); //§
    close(srv); //§
//@END
    return 0;
}
