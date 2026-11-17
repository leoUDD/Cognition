/* Prueba del ejercicio K3: Bully con aptitud */
#include <stdio.h>
#define main main_estudiante
#include "../bully.c"
#undef main
#define CHECK(c, msg) printf((c) ? "OK: %s\n" : "FALLA: %s\n", msg)

int todos_reconocen(int id) {
    for (int i = 0; i < N; i++) {
        if (nodos[i].estado == OPERATIVO && nodos[i].lider != id) { return 0; }
    }
    return 1;
}

int main(void) {
    printf("--- datos y aptitud (pregunta 1) ---\n");
    cargar_enjambre();
    CHECK(nodos[0].id == 1 && nodos[3].id == 4 && nodos[3].bateria > 90 && nodos[3].distancia > 2 && nodos[4].visibilidad > 87,
          "El struct guarda los datos del enunciado: id, batería, distancia y visibilidad (C4: 91 %, 2.1 km)");
    int apt_ok = 1;
    for (int i = 0; i < N; i++) {
        if (nodos[i].estado == OPERATIVO && nodos[i].aptitud <= 0) { apt_ok = 0; }
    }
    CHECK(apt_ok, "cargar_enjambre() calcula la aptitud de cada dron operativo con la función de la pregunta 1 (ninguna queda en 0)");
    int c5_max = 1;
    for (int i = 0; i < N; i++) {
        if (i != 4 && nodos[i].aptitud >= nodos[4].aptitud) { c5_max = 0; }
    }
    CHECK(c5_max && nodos[2].aptitud < nodos[5].aptitud, "C5 es el más apto y C3 (caído) queda bajo todos");

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
