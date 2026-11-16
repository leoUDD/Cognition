/* Prueba del ejercicio K2: heartbeat y declaración de inoperativo */
#include <stdio.h>
#define main main_estudiante
#include "../heartbeat.c"
#undef main
#define CHECK(c, msg) printf((c) ? "OK: %s\n" : "FALLA: %s\n", msg)

int main(void) {
    Monitor m = { "C3", 0, OPERATIVO };
    int r1 = registrar_ciclo(&m, 0, "t1"), r2 = registrar_ciclo(&m, 0, "t2");
    CHECK(r1 == 0 && r2 == 0 && m.estado == OPERATIVO, "Con 1 o 2 ciclos sin respuesta todavía NO se declara inoperativo");
    int r3 = registrar_ciclo(&m, 0, "t3");
    CHECK(r3 == 1 && m.estado == INOPERATIVO, "Al 3er ciclo seguido sin respuesta se declara INOPERATIVO y retorna 1");
    int r4 = registrar_ciclo(&m, 0, "t4");
    CHECK(r4 == 0, "Se avisa una sola vez: en el 4º ciclo ya no retorna 1 (no se inician dos elecciones)");

    Monitor n = { "C2", 0, OPERATIVO };
    registrar_ciclo(&n, 0, "a"); registrar_ciclo(&n, 0, "b");
    registrar_ciclo(&n, 1, "c");                  /* respondió: la cuenta vuelve a 0 */
    registrar_ciclo(&n, 0, "d"); int x = registrar_ciclo(&n, 0, "e");
    CHECK(x == 0 && n.estado == OPERATIVO, "Si responde entremedio, la cuenta se reinicia: solo valen fallos CONSECUTIVOS");
    CHECK(n.fallos == 2, "El contador lleva los fallos seguidos desde la última respuesta");
    return 0;
}
