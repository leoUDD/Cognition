/* r3_cliente.c — ./r3_cliente registrar | lector | fase */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>

#define PORT 8003

int sock;

/* Stub genérico: envía una línea CALL y deja el resultado en out */
int rpc(const char *llamada, char *out, int n) {
    char msg[128];
    snprintf(msg, sizeof msg, "CALL %s\n", llamada);
    send(sock, msg, strlen(msg), 0);
    int r = recv(sock, out, n - 1, 0);
    if (r <= 0) return -1;
    out[r] = '\0';
    out[strcspn(out, "\n")] = '\0';
    return 0;
}

int main(int argc, char *argv[]) {
    if (argc < 2) { fprintf(stderr, "Uso: %s registrar|lector|fase\n", argv[0]); return 1; }
    sock = socket(AF_INET, SOCK_STREAM, 0);
    struct sockaddr_in srv;
    memset(&srv, 0, sizeof srv);
    srv.sin_family = AF_INET;
    srv.sin_port = htons(PORT);
    inet_pton(AF_INET, "127.0.0.1", &srv.sin_addr);
    if (connect(sock, (struct sockaddr *)&srv, sizeof srv) < 0) { perror("connect"); return 1; }

    char res[128], call[64];
    if (strcmp(argv[1], "registrar") == 0) {
        for (int i = 1; i <= 12; i++) {
            snprintf(call, sizeof call, "registrar_muestra %d %.2f", i, i * 1.5);
            rpc(call, res, sizeof res);
            printf("[registrar] muestra %d -> %s\n", i, res);
            usleep(300000);
        }
    } else if (strcmp(argv[1], "lector") == 0) {
        for (int i = 0; i < 5; i++) { rpc("leer_estado", res, sizeof res); printf("[lector] %s\n", res); sleep(1); }
    } else {
        int m = 0;
        while (m < 10) { rpc("leer_estado", res, sizeof res); sscanf(res, "RESULT fase=%*d muestras=%d", &m); usleep(200000); }
        rpc("incrementar_fase", res, sizeof res);
        printf("[fase] 10 muestras alcanzadas, nueva fase -> %s\n", res);
    }
    close(sock);
    return 0;
}
