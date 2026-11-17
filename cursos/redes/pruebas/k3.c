/* Prueba del ejercicio K3: Bully con aptitud */
#include <stdio.h>
#define main main_estudiante
#include "../bully.c"
#undef main
#define CHECK(c, msg) printf((c) ? "OK: %s\n" : "FALLA: %s\n", msg)

int todos_reconocen(int id) {
    for (int i = 0; i < N; i++) {
        if (nodos[i].vivo == 1 && nodos[i].lider != id) { return 0; }
    }
    return 1;
}

int main(void) {
    printf("--- escenario: C1 detecta la caída ---\n");
    cargar_enjambre(); iniciar_eleccion(0);
    CHECK(todos_reconocen(4), "Todos los drones vivos reconocen a C5 (el más apto) como líder");
    CHECK(enviados[ELECTION] == 1, "C1 envía ELECTION solo a los MÁS aptos que él (únicamente C5)");
    CHECK(enviados[OK] == 1, "C5 responde OK a C1");
    CHECK(enviados[COORDINATOR] == 5, "Se anuncia un solo ganador: 5 COORDINATOR (uno a cada otro dron)");

    printf("--- escenario: C6 (el menos apto) detecta la caída ---\n");
    cargar_enjambre(); iniciar_eleccion(5);
    CHECK(todos_reconocen(4), "Aunque detecte el menos apto, gana el más apto vivo (C5)");
    CHECK(enviados[COORDINATOR] == 5, "Solo C5 se proclama líder (nadie más envía COORDINATOR)");
    CHECK(enviados[OK] >= 4, "Cada dron que recibe ELECTION de uno menos apto responde OK");
    return 0;
}
