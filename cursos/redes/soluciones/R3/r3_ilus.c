/* r3_ilus.c — RPC concurrente con estado en archivo protegido por flock() */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <signal.h>
#include <fcntl.h>
#include <sys/file.h>
#include <sys/socket.h>
#include <netinet/in.h>

#define PORT 8003
#define ARCHIVO "experimento.dat"
#define MAX_MUESTRAS 50

typedef struct { int id; float valor; } Muestra;
typedef struct {
    int fase_actual;
    int num_muestras;
    Muestra muestras[MAX_MUESTRAS];
} Estado;

/* Lee o escribe el estado completo, con el lock adecuado */
//@TODO 1 | Acceso al archivo con flock(): LOCK_SH para leer, LOCK_EX para modificar
void leer_estado_archivo(Estado *e) {
    int fd = open(ARCHIVO, O_RDONLY); //§
    flock(fd, LOCK_SH);                 /* varios lectores a la vez */ //§
    read(fd, e, sizeof *e); //§
    flock(fd, LOCK_UN); //§
    close(fd);
}

/* Modificación atómica: leer + cambiar + escribir bajo el MISMO LOCK_EX */
int fd_bloquear_ex(Estado *e) {
    int fd = open(ARCHIVO, O_RDWR); //§
    flock(fd, LOCK_EX);                 /* exclusivo: nadie más lee ni escribe */ //§
    lseek(fd, 0, SEEK_SET);
    read(fd, e, sizeof *e); //§
    return fd;
}

void fd_guardar_y_soltar(int fd, const Estado *e) {
    lseek(fd, 0, SEEK_SET); //§
    write(fd, e, sizeof *e); //§
    flock(fd, LOCK_UN); //§
    close(fd);
}
//@END

void atender(int sock) {
//@TODO 2 | Las 4 funciones RPC
    char buf[256], fn[32], resp[128];
    int n;
    while ((n = recv(sock, buf, sizeof(buf) - 1, 0)) > 0) {
        buf[n] = '\0';
        int id;
        float valor;
        Estado e;
        fn[0] = '\0';
        sscanf(buf, "CALL %31s", fn);                   /* primero: ¿qué función piden? */ //§
        if (strcmp(fn, "registrar_muestra") == 0 && sscanf(buf, "CALL %*s %d %f", &id, &valor) == 2) { //§
            int fd = fd_bloquear_ex(&e); //§
            if (e.num_muestras < MAX_MUESTRAS) {
                e.muestras[e.num_muestras].id = id; //§
                e.muestras[e.num_muestras].valor = valor; //§
                e.num_muestras++; //§
            }
            fd_guardar_y_soltar(fd, &e); //§
            snprintf(resp, sizeof resp, "RESULT OK %d\n", e.num_muestras);
        } else if (strcmp(fn, "incrementar_fase") == 0) {
            int fd = fd_bloquear_ex(&e); //§
            e.fase_actual++; //§
            fd_guardar_y_soltar(fd, &e); //§
            snprintf(resp, sizeof resp, "RESULT %d\n", e.fase_actual);
        } else if (strcmp(fn, "leer_estado") == 0) {
            leer_estado_archivo(&e); //§
            snprintf(resp, sizeof resp, "RESULT fase=%d muestras=%d\n", e.fase_actual, e.num_muestras); //§
        } else if (strcmp(fn, "obtener_fase") == 0) {
            leer_estado_archivo(&e); //§
            snprintf(resp, sizeof resp, "RESULT %d\n", e.fase_actual); //§
        } else {
            snprintf(resp, sizeof resp, "RESULT ERROR\n");
        }
        send(sock, resp, strlen(resp), 0);
    }
//@END
}

int main(void) {
    /* Crear el archivo vacío si no existe */
    int fd = open(ARCHIVO, O_RDWR | O_CREAT, 0644);
    flock(fd, LOCK_EX);
    if (lseek(fd, 0, SEEK_END) < (off_t)sizeof(Estado)) {
        Estado vacio;
        memset(&vacio, 0, sizeof vacio);
        lseek(fd, 0, SEEK_SET);
        write(fd, &vacio, sizeof vacio);
    }
    flock(fd, LOCK_UN);
    close(fd);

    int srv = socket(AF_INET, SOCK_STREAM, 0);
    setsockopt(srv, SOL_SOCKET, SO_REUSEADDR, &(int){1}, sizeof(int));
    struct sockaddr_in addr;
    memset(&addr, 0, sizeof addr);
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = INADDR_ANY;
    addr.sin_port = htons(PORT);
    if (bind(srv, (struct sockaddr *)&addr, sizeof addr) < 0) { perror("bind"); return 1; }
    listen(srv, 10);
    signal(SIGCHLD, SIG_IGN);
    printf("[ILUS] escuchando en %d\n", PORT);
    fflush(stdout);
    while (1) {
        int cli = accept(srv, NULL, NULL);
        if (cli < 0) continue;
        if (fork() == 0) { close(srv); atender(cli); close(cli); exit(0); }
        close(cli);
    }
}
