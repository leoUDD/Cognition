/* i1_procesador.c — sensor (pipe) -> procesador -> base Ceres (socket) */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/wait.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>

#define PORT 6001
#ifndef PERIODO
#define PERIODO 2               /* segundos entre lecturas */
#endif
#define LECTURAS 8

void sensor(int wfd) {
//@TODO 1 | Proceso A: lecturas "VITAL O2=<v> CO2=<v> TEMP=<v>\n" cada 2 s
//? El sensor es un proceso hijo que solo escribe en el pipe. ¿Qué genera y cada cuánto?
//- srand(getpid()) para que no repita la secuencia del padre.
//- Loop: genera O2 (80–100), CO2 (0–5), TEMP (15–25) con rand().
//- snprintf la línea "VITAL O2=… CO2=… TEMP=…\n" y write(wfd, …).
//- sleep(PERIODO). Al terminar, close(wfd) para que el lector reciba EOF.
    srand(getpid());
    for (int i = 0; i < LECTURAS; i++) {
        float o2 = 80 + rand() % 2001 / 100.0f;     /* 80-100 % */ //§
        float co2 = rand() % 501 / 100.0f;          /* 0-5 %   */ //§
        float temp = 15 + rand() % 1001 / 100.0f;   /* 15-25 °C */ //§
        char msg[80];
        int len = snprintf(msg, sizeof msg, "VITAL O2=%.2f CO2=%.2f TEMP=%.2f\n", o2, co2, temp); //§
        write(wfd, msg, len); //§
        sleep(PERIODO);
    }
    close(wfd);
//@END
    exit(0);
}

/* Envía una alerta y espera el ACK de la base */
void alertar(int sock, const char *tipo, float v) {
    char msg[64], buf[64];
    snprintf(msg, sizeof msg, "%s %.2f\n", tipo, v);
    send(sock, msg, strlen(msg), 0);
    int n = recv(sock, buf, sizeof(buf) - 1, 0);
    if (n > 0) { buf[n] = '\0'; printf("[PROCESADOR] %s %.2f -> %s", tipo, v, buf); }
}

int main(int argc, char *argv[]) {
    const char *ip = argc > 1 ? argv[1] : "127.0.0.1";
    int p[2];
//@TODO 2 | pipe + fork del sensor; el padre cierra el extremo de escritura
//? El procesador es el padre: necesita el pipe ANTES del fork. ¿Qué extremo cierra cada uno?
//- pipe(p).
//- if (fork() == 0): el hijo cierra p[0] y llama a sensor(p[1]).
//- El padre cierra p[1] (si no, nunca verá EOF).
    pipe(p); //§
    if (fork() == 0) { close(p[0]); sensor(p[1]); } //§
    close(p[1]); //§
//@END
//@TODO 3 | Conectar a la base y reenviar solo las alertas
//? Ahora el padre es puente: lee del pipe y habla por el socket. ¿Cuándo envía algo a la base?
//- Conéctate a la base (socket, sockaddr_in, connect).
//- FILE *in = fdopen(p[0], "r") para leer línea a línea con fgets.
//- Por cada línea: sscanf de O2, CO2 y TEMP.
//- Tres if separados (no else-if): cada umbral cruzado → alertar(sock, tipo, valor).
//- Al terminar: close(sock), fclose(in), wait(NULL).
    int sock = socket(AF_INET, SOCK_STREAM, 0); //§
    struct sockaddr_in srv;
    memset(&srv, 0, sizeof srv);
    srv.sin_family = AF_INET;
    srv.sin_port = htons(PORT);
    inet_pton(AF_INET, ip, &srv.sin_addr);
    if (connect(sock, (struct sockaddr *)&srv, sizeof srv) < 0) { perror("connect"); return 1; } //§

    FILE *in = fdopen(p[0], "r"); //§
    char linea[128];
    float o2, co2, temp;
    while (fgets(linea, sizeof linea, in)) { //§
        if (sscanf(linea, "VITAL O2=%f CO2=%f TEMP=%f", &o2, &co2, &temp) != 3) continue; //§
        printf("[PROCESADOR] %s", linea);
        if (o2 < 85)   alertar(sock, "ALERTA_O2", o2); //§
        if (co2 > 3)   alertar(sock, "ALERTA_CO2", co2); //§
        if (temp > 22) alertar(sock, "ALERTA_TEMP", temp); //§
    }
    close(sock);                /* al cerrar la conexión con la base... */ //§
    fclose(in);                 /* ...también cierra el extremo de lectura del pipe */ //§
    wait(NULL); //§
//@END
    return 0;
}
