/* Prueba extra del Ej. 6: casos que el main del enunciado no cubre */
#include <stdio.h>
#define main main_estudiante        /* tu main queda con otro nombre */
#include "../reloj.c"
#undef main
#define CHECK(c, msg) printf((c) ? "OK: %s\n" : "FALLA: %s\n", msg)
int main(void) {
    Node n = { 10, "P" };
    lamport_recv(&n, 3);
    CHECK(n.clock == 11, "Recibir ts=3 con reloj 10 deja el reloj en 11: max(10,3)+1 (el reloj no retrocede)");
    n.clock = 2; lamport_recv(&n, 7);
    CHECK(n.clock == 8, "Recibir ts=7 con reloj 2 deja el reloj en 8: max(2,7)+1");
    int ts = -1; n.clock = 4; lamport_send(&n, &ts);
    CHECK(n.clock == 5 && ts == 5, "Enviar con reloj 4: el reloj y el ts del mensaje quedan en 5");
    n.clock = 0; lamport_local(&n); lamport_local(&n);
    CHECK(n.clock == 2, "Dos eventos internos desde 0 dejan el reloj en 2");
    return 0;
}
