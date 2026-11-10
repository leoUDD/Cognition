/* Prueba del Extra 3: participantes simulados */
#include <stdio.h>
#include "../two_phase_commit.c"
#define CHECK(c, msg) printf((c) ? "OK: %s\n" : "FALLA: %s\n", msg)
Voto voto[N_REPLICAS];
int prepares, commits, aborts;
Voto send_prepare(int r, const char *k, const char *v) { (void)k; (void)v; prepares++; return voto[r]; }
void send_commit(int r, const char *k, const char *v) { (void)r; (void)k; (void)v; commits++; }
void send_abort(int r) { (void)r; aborts++; }
void reset(Voto a, Voto b, Voto c) { voto[0] = a; voto[1] = b; voto[2] = c; prepares = commits = aborts = 0; }
int main(void) {
    reset(YES, YES, YES);
    bool r = two_phase_commit("x", "10");
    CHECK(r && prepares == 3, "Fase 1: pregunta a las 3 réplicas");
    CHECK(commits == 3 && aborts == 0, "Todos votan YES: COMMIT a las 3 y ningún ABORT");
    reset(YES, NO, YES);
    r = two_phase_commit("x", "10");
    CHECK(!r && commits == 0 && aborts == 3, "Un solo NO: ABORT a todas (unanimidad, no mayoría)");
    reset(NO, NO, NO);
    r = two_phase_commit("x", "10");
    CHECK(!r && aborts == 3, "Todos NO: ABORT y retorna false");
    return 0;
}
