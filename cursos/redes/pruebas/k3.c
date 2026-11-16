/* Prueba del ejercicio K3: Bully con aptitud */
#include <stdio.h>
#define main main_estudiante
#include "../bully.c"
#undef main
#define CHECK(c, msg) printf((c) ? "OK: %s\n" : "FALLA: %s\n", msg)

void reiniciar(void) { cargar_enjambre(); ini = 0; fin = 0; enviados[0] = enviados[1] = enviados[2] = 0; }
int todos_reconocen(int id) {
    for (int i = 0; i < N; i++) if (nodos[i].vivo && nodos[i].lider != id) return 0;
    return 1;
}

int main(void) {
    reiniciar();
    CHECK(mas_prioridad(4, 0) == 1 && mas_prioridad(0, 4) == 0, "Prioridad por aptitud: C5 (80.6) le gana a C1 (75.0)");
    nodos[1].aptitud = 75.0;
    CHECK(mas_prioridad(0, 1) == 1 && mas_prioridad(1, 0) == 0, "Empate de aptitud: gana el id menor");

    printf("--- escenario: C1 detecta la caída ---\n");
    reiniciar(); iniciar_eleccion(0); ejecutar();
    CHECK(todos_reconocen(5), "Todos los drones vivos reconocen a C5 como líder");
    CHECK(enviados[ELECTION] == 1, "C1 envía ELECTION solo a los de MÁS prioridad (únicamente C5)");
    CHECK(enviados[OK] == 1, "C5 responde OK a C1");
    CHECK(enviados[COORDINATOR] == 5, "Se anuncia un solo ganador: 5 COORDINATOR (uno a cada otro dron)");

    printf("--- escenario: C6 (el menos apto) detecta la caída ---\n");
    reiniciar(); iniciar_eleccion(5); ejecutar();
    CHECK(todos_reconocen(5), "Aunque detecte el menos apto, gana el más apto vivo (C5)");
    CHECK(enviados[COORDINATOR] == 5, "Solo C5 se proclama líder (nadie más envía COORDINATOR)");
    CHECK(enviados[OK] >= 4, "Cada dron que recibe ELECTION de uno menos apto responde OK");
    return 0;
}
