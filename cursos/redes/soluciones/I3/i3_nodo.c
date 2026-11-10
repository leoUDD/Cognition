/* i3_nodo.c — una puerta del anillo: ./i3_nodo <nombre_gate> [ip_hub] */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>

#define PORT_HUB 9001
#ifndef PERIODO
#define PERIODO 3
#endif
#define EVENTOS 6

/* Aleatorio con peso: ACTIVA es más probable */
const char *estado_aleatorio(void) {
    int r = rand() % 100;
    if (r < 20) return "INACTIVA";
    if (r < 40) return "EXPLORANDO";
    if (r < 85) return "ACTIVA";
    return "INESTABLE";
}

int main(int argc, char *argv[]) {
    if (argc < 2) { fprintf(stderr, "Uso: %s <nombre_gate> [ip_hub]\n", argv[0]); return 1; }
    srand(time(NULL) ^ getpid());
    int fd = socket(AF_INET, SOCK_STREAM, 0);
    struct sockaddr_in hub;
    memset(&hub, 0, sizeof hub);
    hub.sin_family = AF_INET;
    hub.sin_port = htons(PORT_HUB);
    inet_pton(AF_INET, argc > 2 ? argv[2] : "127.0.0.1", &hub.sin_addr);
    if (connect(fd, (struct sockaddr *)&hub, sizeof hub) < 0) { perror("connect"); return 1; }
//@TODO 1 | Enviar "GATE_STATUS <gate> <estado> <timestamp>\n" cada 3 s
    for (int i = 0; i < EVENTOS; i++) {
        char msg[96];
        snprintf(msg, sizeof msg, "GATE_STATUS %s %s %ld\n", argv[1], estado_aleatorio(), (long)time(NULL)); //§
        send(fd, msg, strlen(msg), 0); //§
        sleep(PERIODO); //§
    }
    close(fd);                  /* el hub marcará esta gate como INACTIVA */ //§
//@END
    return 0;
}
