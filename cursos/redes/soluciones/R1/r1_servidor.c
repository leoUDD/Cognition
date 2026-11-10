/* r1_servidor.c — RPC get_estado(id_nave) */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <signal.h>
#include <sys/socket.h>
#include <netinet/in.h>

#define PORT 8001

typedef struct { const char *nave; const char *estado; } Registro;
Registro tabla[] = {
    {"Rocinante", "EN_VUELO"}, {"Canterbury", "DESTRUIDA"}, {"Donnager", "EN_PUERTO"},
    {"Behemoth", "EN_VUELO"},  {"Nauvoo", "CONSTRUCCION"},
};

/* La función "real" que se ejecuta en el servidor */
const char *get_estado(const char *id) {
//@TODO 1 | Buscar en la tabla
//? Es una búsqueda lineal en un arreglo de structs.
//- for i: si strcmp(tabla[i].nave, id) == 0 → return su estado.
//- Si no está: return "DESCONOCIDA".
    for (int i = 0; i < 5; i++)
        if (strcmp(tabla[i].nave, id) == 0) return tabla[i].estado; //§
    return "DESCONOCIDA"; //§
//@END
}

void atender(int fd) {
//@TODO 2 | Skeleton del servidor: parsear CALL, ejecutar y responder RESULT
//? El skeleton hace lo inverso al stub: deserializa, llama y serializa.
//- while (recv > 0): termina el string.
//- sscanf "CALL %31s %63s" y verifica que fn sea "get_estado".
//- snprintf "RESULT %s\n" con get_estado(arg) y send.
    char buf[256], fn[32], arg[64], resp[128];
    int n;
    while ((n = recv(fd, buf, sizeof(buf) - 1, 0)) > 0) { //§
        buf[n] = '\0'; //§
        if (sscanf(buf, "CALL %31s %63s", fn, arg) == 2 && strcmp(fn, "get_estado") == 0) //§
            snprintf(resp, sizeof resp, "RESULT %s\n", get_estado(arg)); //§
        else
            snprintf(resp, sizeof resp, "ERROR\n");
        send(fd, resp, strlen(resp), 0); //§
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
    while (1) {
        int cli = accept(srv, NULL, NULL);
        if (cli < 0) continue;
        if (fork() == 0) { close(srv); atender(cli); close(cli); exit(0); }
        close(cli);
    }
}
