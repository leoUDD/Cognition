/* Prueba del ejercicio K4: falla durante la elección */
#include <stdio.h>
#define main main_estudiante
#include "../bully_fallas.c"
#undef main
#define CHECK(c, msg) printf((c) ? "OK: %s\n" : "FALLA: %s\n", msg)

int todos_reconocen(int id) {
    for (int i = 0; i < N; i++) {
        if (nodos[i].vivo == 1 && nodos[i].lider != id) { return 0; }
    }
    return 1;
}

int main(void) {
    printf("--- A: C5 se cae después de responder OK ---\n");
    cargar_enjambre(); cae_tras_ok = 4; iniciar_eleccion(0); esperar_coordinador(0);
    CHECK(nodos[4].vivo == 0, "C5 quedó caído");
    CHECK(todos_reconocen(0), "La elección CONCLUYE con los que quedan: todos reconocen a C1 (el más apto vivo)");
    CHECK(enviados[ELECTION] == 2, "C1 reinicia la elección tras el timeout de COORDINATOR (envía ELECTION 2 veces a C5)");

    printf("--- B: C2 (menos apto) se cae durante la elección ---\n");
    cargar_enjambre(); cae_tras_ok = -1; nodos[1].vivo = 0; iniciar_eleccion(0); esperar_coordinador(0);
    CHECK(todos_reconocen(4), "Si cae alguien menos apto, el resultado NO cambia: gana C5");
    CHECK(enviados[ELECTION] == 1, "Sin reinicios: no hizo falta repetir la elección");

    printf("--- C: sin fallas, el timeout de COORDINATOR no hace nada ---\n");
    cargar_enjambre(); cae_tras_ok = -1; iniciar_eleccion(0); esperar_coordinador(0);
    CHECK(todos_reconocen(4) && enviados[COORDINATOR] == 5, "Sin fallas gana C5 y hay un solo anuncio");
    return 0;
}
