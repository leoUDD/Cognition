/* sonda.c — cliente ARES (Control 01) */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>

#define PORT 7070
#define BUF_SIZE 256

char *checksum(const char *valor, char out[3]) {
    unsigned int s = 0;
    for (int i = 0; valor[i]; i++) s += (unsigned char)valor[i];
    snprintf(out, 3, "%02X", s % 256);
    return out;
}

int main(int argc, char *argv[]) {
    if (argc < 4) {
        fprintf(stderr, "Uso: ./sonda <ARES-N> <IP> <valor_inicial>\n");
        return 1;
    }
    const char *id = argv[1];
    const char *ip = argv[2];
    float valor = atof(argv[3]);
    char buf[BUF_SIZE];
//@TODO B.1 | Crear el socket TCP y conectar al servidor
    int fd = socket(AF_INET, SOCK_STREAM, 0); //§
    if (fd < 0) { perror("socket"); return 1; }
    struct sockaddr_in srv;
    memset(&srv, 0, sizeof srv);
    srv.sin_family = AF_INET; //§
    srv.sin_port = htons(PORT); //§
    if (inet_pton(AF_INET, ip, &srv.sin_addr) != 1) { fprintf(stderr, "IP inválida\n"); return 1; } //§
    if (connect(fd, (struct sockaddr *)&srv, sizeof srv) < 0) { perror("connect"); return 1; } //§
//@END
//@TODO B.2 | Enviar CONNECT y manejar HELLO / REJECT
    snprintf(buf, sizeof buf, "CONNECT %s\n", id); //§
    send(fd, buf, strlen(buf), 0); //§
    int n = recv(fd, buf, sizeof(buf) - 1, 0); //§
    if (n <= 0) { close(fd); return 1; }
    buf[n] = '\0'; //§
    if (strncmp(buf, "HELLO", 5) != 0) { //§
        printf("Rechazado: %s", buf);
        close(fd); //§
        return 1;
    }
    printf("Conectado: %s", buf);
//@END
//@TODO B.3 | 8 lecturas TELEM con seq 1..8, imprimir respuesta, sleep(1)
    for (int seq = 1; seq <= 8; seq++) { //§
        char valstr[32], cs[3];
        valor += 0.6f;                              /* el valor varía en cada iteración */ //§
        snprintf(valstr, sizeof valstr, "%.2f", valor); //§
        checksum(valstr, cs); //§
        snprintf(buf, sizeof buf, "TELEM %s %d %s %s\n", id, seq, valstr, cs); //§
        send(fd, buf, strlen(buf), 0); //§
        n = recv(fd, buf, sizeof(buf) - 1, 0); //§
        if (n <= 0) break; //§
        buf[n] = '\0'; //§
        printf("%s", buf);
        sleep(1); //§
    }
    close(fd); //§
//@END
    return 0;
}
