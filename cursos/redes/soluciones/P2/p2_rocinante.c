/* p2_rocinante.c — pipeline sensor -> filtro -> puente */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/wait.h>

int pipe1[2], pipe2[2];

void sensor(void) {                 /* proceso A */
//@TODO 2 | A: cerrar lo que no usa y escribir 15 "TEMP <v>\n" en pipe1
    close(pipe1[0]); close(pipe2[0]); close(pipe2[1]); //§
    srand(getpid());
    for (int i = 0; i < 15; i++) {
        float t = -50 + rand() % 351;          /* -50 a 300 °C */ //§
        char msg[32];
        int len = snprintf(msg, sizeof msg, "TEMP %.1f\n", t); //§
        write(pipe1[1], msg, len); //§
    }
    close(pipe1[1]); //§
//@END
    exit(0);
}

void filtro(void) {                 /* proceso B */
//@TODO 3 | B: leer pipe1, pasar a pipe2 solo 20..200 como "TEMP_OK <v>\n"
    close(pipe1[1]); close(pipe2[0]); //§
    FILE *in = fdopen(pipe1[0], "r"); //§
    char linea[64];
    float t;
    while (fgets(linea, sizeof linea, in)) { //§
        if (sscanf(linea, "TEMP %f", &t) != 1) continue;
        if (t >= 20 && t <= 200) { //§
            char msg[32];
            int len = snprintf(msg, sizeof msg, "TEMP_OK %.1f\n", t); //§
            write(pipe2[1], msg, len); //§
        } else {
            printf("[FILTRO] Descartado: %.1f\n", t);
        }
    }
    fclose(in);
    close(pipe2[1]);                        /* EOF para el puente */ //§
//@END
    exit(0);
}

void puente(void) {                 /* proceso C */
//@TODO 4 | C: leer pipe2 e imprimir
    close(pipe2[1]); close(pipe1[0]); close(pipe1[1]); //§
    FILE *in = fdopen(pipe2[0], "r"); //§
    char linea[64];
    float t;
    while (fgets(linea, sizeof linea, in)) //§
        if (sscanf(linea, "TEMP_OK %f", &t) == 1) //§
            printf("[PUENTE] Temperatura operacional: %.1f°C\n", t);
    fclose(in);
//@END
    exit(0);
}

int main(void) {
//@TODO 1 | Crear los 2 pipes, los 3 procesos, y que el padre cierre todo y espere
    pipe(pipe1); //§
    pipe(pipe2); //§
    setvbuf(stdout, NULL, _IOLBF, 0);
    if (fork() == 0) sensor(); //§
    if (fork() == 0) filtro(); //§
    if (fork() == 0) puente(); //§
    close(pipe1[0]); close(pipe1[1]); close(pipe2[0]); close(pipe2[1]); //§
    for (int i = 0; i < 3; i++) wait(NULL); //§
//@END
    return 0;
}
