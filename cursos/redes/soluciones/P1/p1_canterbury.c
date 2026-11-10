/* p1_canterbury.c — sensor de radiación por pipe */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/wait.h>

#define LECTURAS 10

int main(void) {
    int fd[2];
//@TODO 1 | Crear el pipe y el proceso hijo
//? Para que padre e hijo compartan el pipe, ¿qué va primero: pipe() o fork()?
//- pipe(fd); si falla, perror.
//- pid = fork().
    if (pipe(fd) < 0) { perror("pipe"); return 1; } //§
    pid_t pid = fork(); //§
    if (pid < 0) { perror("fork"); return 1; }
//@END
    if (pid == 0) {
//@TODO 2 | HIJO (sensor): 10 lecturas "RAD <valor>\n", una por segundo
//? El hijo es el sensor: solo escribe. ¿Qué extremo cierra y cómo termina?
//- close(fd[0]).
//- srand(getpid()); 10 veces: valor al azar entre 0 y 10, snprintf "RAD %.2f\n", write(fd[1]); sleep(1).
//- close(fd[1]) (así el padre recibe EOF) y exit(0).
        close(fd[0]);                       /* el sensor solo escribe */ //§
        srand(getpid());
        for (int i = 0; i < LECTURAS; i++) {
            float rad = (rand() % 1001) / 100.0f;     /* 0.00 a 10.00 */ //§
            char msg[32];
            int len = snprintf(msg, sizeof msg, "RAD %.2f\n", rad); //§
            printf("[SENSOR] Enviando RAD %.2f\n", rad);
            fflush(stdout);
            write(fd[1], msg, len); //§
            sleep(1);
        }
        close(fd[1]);                       /* EOF para el padre */ //§
        exit(0);
//@END
    }
//@TODO 3 | PADRE (puente): leer líneas, clasificar, wait() y resumen
//? El padre lee hasta que el hijo cierre. ¿Cómo lees línea a línea un descriptor?
//- close(fd[1]) (si no lo cierras, nunca llega EOF).
//- FILE *in = fdopen(fd[0], "r"); while (fgets(linea, …, in)).
//- sscanf "RAD %f"; clasifica en NORMAL (< 3), ELEVADO (≤ 6) o CRITICO y cuenta.
//- fclose(in); wait(NULL); imprime el resumen.
    close(fd[1]);                           /* el puente solo lee */ //§
    FILE *in = fdopen(fd[0], "r");          /* permite leer línea a línea con fgets */ //§
    char linea[64];
    int normal = 0, elevado = 0, critico = 0;
    while (fgets(linea, sizeof linea, in) != NULL) { //§
        float v;
        if (sscanf(linea, "RAD %f", &v) != 1) continue; //§
        const char *nivel;
        if (v < 3.0f)       { nivel = "NORMAL";  normal++; } //§
        else if (v <= 6.0f) { nivel = "ELEVADO"; elevado++; } //§
        else                { nivel = "CRITICO"; critico++; } //§
        printf("[PUENTE] RAD %.2f → %s\n", v, nivel);
    }
    fclose(in);
    wait(NULL); //§
    printf("[PUENTE] Resumen: NORMAL=%d ELEVADO=%d CRITICO=%d\n", normal, elevado, critico);
//@END
    return 0;
}
