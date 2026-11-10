/* p3_tycho.c — N hijos, un pipe cada uno, select() en el padre */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <unistd.h>
#include <sys/wait.h>
#include <sys/select.h>

#define N 5
#define MSG_LEN 64      /* mensajes de largo fijo: cada read() trae uno completo */

const char *modulos[N] = { "REACTOR", "OXIGENO", "AGUA", "GRAVITON", "HANGAR" };
const char *niveles[3] = { "OK", "WARN", "CRIT" };

void modulo(int i, int wfd) {
    srand(getpid());
    for (int k = 0; k < 5; k++) {
        char msg[MSG_LEN] = {0};
        snprintf(msg, MSG_LEN, "MODULO %s STATUS %s\n", modulos[i], niveles[rand() % 3]);
        write(wfd, msg, MSG_LEN);           /* MSG_LEN < PIPE_BUF: escritura atómica */
        usleep((rand() % 500) * 1000);
    }
    close(wfd);
    exit(0);
}

int main(void) {
    int pipes[N][2];
    int abiertos = N;
    int conteo[N][3] = {{0}};
//@TODO 1 | Crear N pipes y N hijos; cada hijo cierra lo que no usa
//? 5 hijos, 5 pipes. Cada hijo escribe solo en el suyo. ¿Qué cierra cada hijo y qué cierra el padre?
//- for i: pipe(pipes[i]).
//- for i: fork; el hijo cierra todos los extremos de lectura y los de escritura ajenos (j ≠ i), y llama a modulo(i, pipes[i][1]).
//- Padre: cierra todos los extremos de escritura.
    for (int i = 0; i < N; i++) pipe(pipes[i]); //§
    for (int i = 0; i < N; i++) {
        if (fork() == 0) {
            for (int j = 0; j < N; j++) {
                close(pipes[j][0]);                     /* ningún hijo lee */ //§
                if (j != i) close(pipes[j][1]);         /* solo escribe en el suyo */ //§
            }
            modulo(i, pipes[i][1]);
        }
    }
    for (int i = 0; i < N; i++) close(pipes[i][1]);     /* el padre solo lee */ //§
//@END
//@TODO 2 | Loop con select() hasta que todos los hijos cierren su pipe
//? El padre espera mensajes de 5 pipes a la vez. ¿Qué pasa con el fd_set después de cada select?
//- while (abiertos > 0): FD_ZERO y FD_SET de cada pipe abierta (select modifica el set: hay que rehacerlo cada vez).
//- select(maxfd + 1, …).
//- Para cada pipe con FD_ISSET: read de MSG_LEN bytes.
//- Si read da 0: close, marca −1 y abiertos--. Si no: sscanf, cuenta por nivel e imprime con la hora.
    while (abiertos > 0) { //§
        fd_set rd;
        int maxfd = -1;
        FD_ZERO(&rd); //§
        for (int i = 0; i < N; i++)
            if (pipes[i][0] >= 0) { //§
                FD_SET(pipes[i][0], &rd); //§
                if (pipes[i][0] > maxfd) maxfd = pipes[i][0];
            }
        if (select(maxfd + 1, &rd, NULL, NULL, NULL) < 0) { perror("select"); break; } //§
        for (int i = 0; i < N; i++) {
            if (pipes[i][0] < 0 || !FD_ISSET(pipes[i][0], &rd)) continue; //§
            char msg[MSG_LEN];
            int n = read(pipes[i][0], msg, MSG_LEN); //§
            if (n <= 0) {                       /* EOF: el hijo terminó */ //§
                close(pipes[i][0]);
                pipes[i][0] = -1; //§
                abiertos--; //§
                continue;
            }
            char nombre[16], nivel[8];
            if (sscanf(msg, "MODULO %15s STATUS %7s", nombre, nivel) != 2) continue; //§
            for (int k = 0; k < 3; k++) if (strcmp(nivel, niveles[k]) == 0) conteo[i][k]++; //§
            time_t t = time(NULL);
            char hora[16];
            strftime(hora, sizeof hora, "%H:%M:%S", localtime(&t));
            printf("[%s] %s", hora, msg);
        }
    }
//@END
    while (wait(NULL) > 0) ;
    printf("\nResumen por módulo:\n");
    for (int i = 0; i < N; i++)
        printf("  %-9s OK=%d WARN=%d CRIT=%d\n", modulos[i], conteo[i][0], conteo[i][1], conteo[i][2]);
    return 0;
}
