/* r1_cliente.c — el stub oculta la red */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>

#define PORT 8001

/* STUB: para quien la llama parece una función local */
char *get_estado(int sock, char *id_nave) {
//@TODO 1 | Serializar, enviar, recibir y deserializar
//? El stub es una función normal de C que por dentro habla por la red. ¿Por qué el buffer de retorno debe ser static?
//- static char estado[64] (sobrevive al return; un arreglo local desaparecería).
//- snprintf "CALL get_estado %s\n" y send.
//- recv; termina el string; sscanf "RESULT %63s".
//- return estado (o NULL si falló).
    static char estado[64];                 /* static: sobrevive al return */ //§
    char msg[128];
    snprintf(msg, sizeof msg, "CALL get_estado %s\n", id_nave); //§
    send(sock, msg, strlen(msg), 0); //§
    int n = recv(sock, msg, sizeof(msg) - 1, 0); //§
    if (n <= 0) return NULL; //§
    msg[n] = '\0'; //§
    if (sscanf(msg, "RESULT %63s", estado) != 1) return NULL; //§
    return estado; //§
//@END
}

int main(void) {
    int sock = socket(AF_INET, SOCK_STREAM, 0);
    struct sockaddr_in srv;
    memset(&srv, 0, sizeof srv);
    srv.sin_family = AF_INET;
    srv.sin_port = htons(PORT);
    inet_pton(AF_INET, "127.0.0.1", &srv.sin_addr);
    if (connect(sock, (struct sockaddr *)&srv, sizeof srv) < 0) { perror("connect"); return 1; }

    char *naves[] = { "Rocinante", "Canterbury", "Donnager", "Behemoth", "Nauvoo", "Anubis" };
    for (int i = 0; i < 6; i++) {
        char *e = get_estado(sock, naves[i]);   /* ¡parece una llamada local! */
        printf("%-10s -> %s\n", naves[i], e ? e : "(error)");
    }
    close(sock);
    return 0;
}
