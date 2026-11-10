/* i3_laconia.c — comando central: recibe alertas del hub */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>

#define PORT 9002

int main(void) {
    int srv = socket(AF_INET, SOCK_STREAM, 0);
    setsockopt(srv, SOL_SOCKET, SO_REUSEADDR, &(int){1}, sizeof(int));
    struct sockaddr_in addr;
    memset(&addr, 0, sizeof addr);
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = INADDR_ANY;
    addr.sin_port = htons(PORT);
    if (bind(srv, (struct sockaddr *)&addr, sizeof addr) < 0) { perror("bind"); return 1; }
    listen(srv, 5);
    printf("[LACONIA] escuchando en %d\n", PORT);
    fflush(stdout);
    while (1) {
        int cli = accept(srv, NULL, NULL);
        if (cli < 0) continue;
//@TODO 1 | Atender ALERT NIVEL_3 y responder RESULT PROTOCOLO_OSIRIS_ACTIVADO
        char buf[256];
        int n, activas;
        while ((n = recv(cli, buf, sizeof(buf) - 1, 0)) > 0) { //§
            buf[n] = '\0'; //§
            if (sscanf(buf, "ALERT NIVEL_3 %d", &activas) == 1) { //§
                time_t t = time(NULL);
                printf("[LACONIA %.8s] ¡ALERTA NIVEL 3! %d gates activas\n", ctime(&t) + 11, activas); //§
                fflush(stdout);
                send(cli, "RESULT PROTOCOLO_OSIRIS_ACTIVADO\n", 33, 0); //§
            } else {
                send(cli, "RESULT ERROR\n", 13, 0);
            }
        }
        close(cli);
//@END
    }
}
