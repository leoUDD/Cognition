/* Prueba del ejercicio K1: función de aptitud */
#include <stdio.h>
#define main main_estudiante
#include "../aptitud.c"
#undef main
#define CHECK(c, msg) printf((c) ? "OK: %s\n" : "FALLA: %s\n", msg)
#define CERCA(a, b) (((a) - (b)) < 0.15 && ((b) - (a)) < 0.15)

int main(void) {
    Dron a = { "A", 50, 1.0, 50, OPERATIVO, 0 }, b = { "B", 50, 2.0, 50, OPERATIVO, 0 };
    float fa = calcular_aptitud(a, 1.0, 2.0), fb = calcular_aptitud(b, 1.0, 2.0);
    CHECK(fa > fb, "Distancia con relación inversa: el dron más CERCANO tiene más aptitud");
    CHECK(CERCA(fa - fb, 25.0), "El más cercano saca 1 y el más lejano 0 en distancia (diferencia = peso 25)");
    Dron c = { "C", 100, 1.0, 100, OPERATIVO, 0 };
    CHECK(CERCA(calcular_aptitud(c, 1.0, 1.0), 100.0), "Si dmax == dmin no divide por cero (todos ganan el puntaje de distancia)");

    Dron e[N_DRONES] = {
        { "C1", 78, 1.2, 85, OPERATIVO, 0 }, { "C2", 45, 0.8, 92, OPERATIVO, 0 },
        { "C3",  0, 0.0,  0, INOPERATIVO, 0 }, { "C4", 91, 2.1, 70, OPERATIVO, 0 },
        { "C5", 62, 0.5, 88, OPERATIVO, 0 }, { "C6", 83, 1.5, 45, OPERATIVO, 0 } };
    calcular_todas(e, N_DRONES);
    CHECK(e[2].aptitud == -1, "El dron inoperativo (C3) queda con aptitud -1");
    CHECK(CERCA(e[4].aptitud, 80.6) && CERCA(e[0].aptitud, 75.0) && CERCA(e[3].aptitud, 60.9),
          "Aptitudes correctas: C5 = 80.6, C1 = 75.0, C4 = 60.9 (dmin y dmax SOLO entre operativos: C3 no cuenta)");
    ordenar(e, N_DRONES);
    CHECK(strcmp(e[0].nombre, "C5") == 0 && strcmp(e[1].nombre, "C1") == 0 && strcmp(e[2].nombre, "C2") == 0,
          "Orden de MAYOR a menor: C5, C1, C2…");
    CHECK(strcmp(e[5].nombre, "C3") == 0, "El inoperativo queda al final");
    Dron t[2] = { { "C2", 50, 1, 50, OPERATIVO, 70 }, { "C1", 50, 1, 50, OPERATIVO, 70 } };
    ordenar(t, 2);
    CHECK(strcmp(t[0].nombre, "C1") == 0, "Empate de aptitud: gana el nombre menor (C1 antes que C2)");
    return 0;
}
