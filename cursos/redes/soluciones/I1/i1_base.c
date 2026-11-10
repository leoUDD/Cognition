/* i1_base.c — base Ceres: registra alertas con timestamp */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <unistd.h>
#include <signal.h>
#include <sys/socket.h>
#include <netinet/in.h>

#define PORT 6001

void atender(int fd) {
//@TODO 1 | Recibir alertas, registrarlas con hora y responder ACK_ALERTA
    char buf[256];
    int n;
    while ((n = recv(fd, buf, sizeof(buf) - 1, 0)) > 0) { //§
        buf[n] = '\0'; //§
        buf[strcspn(buf, "\n")] = '\0';
        time_t t = time(NULL); //§
        char hora[16];
        strftime(hora, sizeof hora, "%H:%M:%S", localtime(&t)); //§
        printf("[BASE CERES %s] %s\n", hora, buf); //§
        fflush(stdout);
        send(fd, "ACK_ALERTA\n", 11, 0); //§
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
    listen(srv, 5);
    signal(SIGCHLD, SIG_IGN);
    printf("[BASE CERES] escuchando en %d\n", PORT);
    fflush(stdout);
    while (1) {
        int cli = accept(srv, NULL, NULL);
        if (cli < 0) continue;
        if (fork() == 0) { close(srv); atender(cli); close(cli); exit(0); }
        close(cli);
    }
}
