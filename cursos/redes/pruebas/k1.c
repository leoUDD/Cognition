/* Prueba del ejercicio K1: función de aptitud.
   No exige una fórmula exacta: revisa las PROPIEDADES que debe cumplir cualquier función de aptitud correcta
   (sumar o restar la distancia, min-max o d/dmax, cualquier peso razonable). */
#include <stdio.h>
#define main main_estudiante
#include "../aptitud.c"
#undef main
#define CHECK(c, msg) printf((c) ? "OK: %s\n" : "FALLA: %s\n", msg)

float absf(float x) { if (x < 0) { return -x; } return x; }
Dron D(float b, float d, float v) { Dron x = { "X", b, d, v, OPERATIVO, 0 }; return x; }

int main(void) {
    /* rango real de distancias del enjambre operativo */
    float dmin = 0.5, dmax = 2.1;
    float base = calcular_aptitud(D(60, 1.3, 60), dmin, dmax);

    CHECK(calcular_aptitud(D(90, 1.3, 60), dmin, dmax) > base, "Más batería → más aptitud");
    CHECK(calcular_aptitud(D(60, 1.3, 90), dmin, dmax) > base, "Más visibilidad → más aptitud");
    CHECK(calcular_aptitud(D(60, 0.5, 60), dmin, dmax) > calcular_aptitud(D(60, 2.1, 60), dmin, dmax),
          "Distancia con relación INVERSA: el dron más cercano tiene más aptitud");

    /* Cada criterio debe influir de verdad: pasar del peor al mejor valor del enjambre tiene que mover F
       al menos un 20% de lo que la mueve el criterio más influyente (si no, ese criterio casi no cuenta). */
    float eb = absf(calcular_aptitud(D(91, 1.3, 60), dmin, dmax) - calcular_aptitud(D(45, 1.3, 60), dmin, dmax));
    float ev = absf(calcular_aptitud(D(60, 1.3, 92), dmin, dmax) - calcular_aptitud(D(60, 1.3, 45), dmin, dmax));
    float ed = absf(calcular_aptitud(D(60, 0.5, 60), dmin, dmax) - calcular_aptitud(D(60, 2.1, 60), dmin, dmax));
    float emax = eb; if (ev > emax) { emax = ev; } if (ed > emax) { emax = ed; }
    printf("   (efecto de cada criterio entre el peor y el mejor dron: batería %.1f, visibilidad %.1f, distancia %.1f)\n", eb, ev, ed);
    CHECK(emax > 0 && ed >= 0.2 * emax,
          "La distancia influye de verdad (si no está normalizada a la misma escala, casi no cuenta)");
    CHECK(emax > 0 && eb >= 0.2 * emax && ev >= 0.2 * emax,
          "Batería y visibilidad influyen de verdad (todos los criterios en la misma escala)");

    float igual = calcular_aptitud(D(60, 1.0, 60), 1.0, 1.0);
    CHECK(igual == igual && igual < 1e6 && igual > -1e6, "Si todos están a la misma distancia (dmax == dmin) no se divide por cero");

    Dron e[N_DRONES] = {
        { "C1", 78, 1.2, 85, OPERATIVO, 0 }, { "C2", 45, 0.8, 92, OPERATIVO, 0 },
        { "C3",  0, 0.0,  0, INOPERATIVO, 0 }, { "C4", 91, 2.1, 70, OPERATIVO, 0 },
        { "C5", 62, 0.5, 88, OPERATIVO, 0 }, { "C6", 83, 1.5, 45, OPERATIVO, 0 } };
    calcular_todas(e, N_DRONES);
    CHECK(e[2].aptitud == -1, "El dron inoperativo (C3) queda con aptitud -1");
    int rango_ok = 1;
    for (int i = 0; i < N_DRONES; i++) {
        if (e[i].estado == OPERATIVO) {
            if (absf(e[i].aptitud - calcular_aptitud(e[i], 0.5, 2.1)) > 0.01) { rango_ok = 0; }
        }
    }
    CHECK(rango_ok, "dmin y dmax se buscan SOLO entre los operativos (0.5 y 2.1 km; C3 no cuenta)");

    ordenar(e, N_DRONES);
    int orden_ok = 1;
    for (int i = 0; i < N_DRONES - 1; i++) {
        if (e[i].aptitud < e[i + 1].aptitud) { orden_ok = 0; }
    }
    CHECK(orden_ok, "Quedan ordenados de MAYOR a menor aptitud");
    CHECK(strcmp(e[N_DRONES - 1].nombre, "C3") == 0, "El inoperativo queda al final");
    printf("   (tu ranking: %s %.1f > %s %.1f > %s %.1f > %s %.1f > %s %.1f)\n",
           e[0].nombre, e[0].aptitud, e[1].nombre, e[1].aptitud, e[2].nombre, e[2].aptitud,
           e[3].nombre, e[3].aptitud, e[4].nombre, e[4].aptitud);

    Dron t[2] = { { "C2", 50, 1, 50, OPERATIVO, 70 }, { "C1", 50, 1, 50, OPERATIVO, 70 } };
    ordenar(t, 2);
    CHECK(strcmp(t[0].nombre, "C1") == 0, "Empate de aptitud: gana el nombre menor (C1 antes que C2)");
    return 0;
}
