/* i2_nave.c — sensor (hijo) -> validador (padre) -> RPC al cuartel */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/wait.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>

#define PORT 8010
#define LECTURAS 10

int sock;

/* Stub RPC genérico */
int rpc_call(const char *fn, const char *nave, float v, char *out, int n) {
//@TODO 1 | Stub: CALL <fn> <nave> <valor>\n -> extraer lo que va después de RESULT
    char msg[128];
    snprintf(msg, sizeof msg, "CALL %s %s %.1f\n", fn, nave, v); //§
    send(sock, msg, strlen(msg), 0); //§
    int r = recv(sock, msg, sizeof(msg) - 1, 0); //§
    if (r <= 0) return -1;
    msg[r] = '\0';
    if (strncmp(msg, "RESULT ", 7) != 0) return -1; //§
    snprintf(out, n, "%s", msg + 7); //§
    out[strcspn(out, "\n")] = '\0';
    return 0;
//@END
}

void sensor(int wfd) {
    srand(getpid());
    float comb = 50 + rand() % 30, dist = 250 + rand() % 200;
    for (int i = 0; i < LECTURAS; i++) {
        float vel = rand() % 1001;
        comb -= 3 + rand() % 6;  if (comb < 0) comb = 0;
        dist -= 25 + rand() % 40; if (dist < 0) dist = 0;
        char msg[96];
        int len = snprintf(msg, sizeof msg, "SENSOR vel=%.0f dist=%.0f comb=%.0f\n", vel, dist, comb);
        write(wfd, msg, len);
        usleep(400000);
    }
    close(wfd);
    exit(0);
}

int main(int argc, char *argv[]) {
    if (argc < 2) { fprintf(stderr, "Uso: %s <nombre_nave> [ip]\n", argv[0]); return 1; }
    const char *nave = argv[1];
    int p[2];
//@TODO 2 | pipe + fork del sensor, conexión al cuartel
    pipe(p); //§
    if (fork() == 0) { close(p[0]); sensor(p[1]); } //§
    close(p[1]); //§
    sock = socket(AF_INET, SOCK_STREAM, 0); //§
    struct sockaddr_in srv;
    memset(&srv, 0, sizeof srv);
    srv.sin_family = AF_INET;
    srv.sin_port = htons(PORT);
    inet_pton(AF_INET, argc > 2 ? argv[2] : "127.0.0.1", &srv.sin_addr);
    if (connect(sock, (struct sockaddr *)&srv, sizeof srv) < 0) { perror("connect"); return 1; } //§
//@END
//@TODO 3 | Validador: leer el pipe y llamar por RPC según las reglas
    FILE *in = fdopen(p[0], "r"); //§
    char linea[128], res[64];
    float vel, dist, comb;
    while (fgets(linea, sizeof linea, in)) { //§
        if (sscanf(linea, "SENSOR vel=%f dist=%f comb=%f", &vel, &dist, &comb) != 3) continue; //§
        if (comb < 20 && rpc_call("solicitar_reabastecimiento", nave, comb, res, sizeof res) == 0) //§
            printf("[%s] combustible %.0f%% -> %s\n", nave, comb, res);
        if (dist < 50 && rpc_call("solicitar_ordenes", nave, dist, res, sizeof res) == 0) //§
            printf("[%s] objetivo a %.0f km -> %s\n", nave, dist, res);
    }
    fclose(in);
    close(sock);
    wait(NULL);
//@END
    return 0;
}
