/* Prueba del Extra 2: réplicas simuladas */
#include <stdio.h>
#include "../kv_quorum.c"
#define CHECK(c, msg) printf((c) ? "OK: %s\n" : "FALLA: %s\n", msg)
int vivo[NREP] = {1, 1, 1}, escrituras = 0;
KVPair datos[NREP];
bool send_write(int r, const char *key, const char *value) {
    if (!vivo[r]) return false;
    escrituras++;
    strcpy(datos[r].key, key); strcpy(datos[r].value, value); datos[r].version++;
    return true;
}
bool read_from_replica(int r, const char *key, KVPair *out) {
    (void)key;
    if (!vivo[r]) return false;
    *out = datos[r];
    return true;
}
int main(void) {
    KVPair k;
    CHECK(put_quorum("x", "1"), "Con las 3 réplicas vivas la escritura tiene quórum");
    CHECK(escrituras == 2, "Corta apenas logra W=2 acks (no escribe de más)");
    vivo[0] = 0;
    CHECK(put_quorum("x", "2"), "Con 1 réplica caída todavía hay quórum de escritura");
    vivo[1] = 0;
    CHECK(!put_quorum("x", "3"), "Con 2 réplicas caídas NO hay quórum: retorna false");
    vivo[0] = vivo[1] = 1;
    datos[0].version = 5; strcpy(datos[0].value, "nuevo");
    datos[1].version = 2; strcpy(datos[1].value, "viejo");
    CHECK(get_quorum("x", &k) && strcmp(k.value, "nuevo") == 0, "La lectura entrega el valor con mayor version");
    vivo[0] = 0; datos[2].version = 9; strcpy(datos[2].value, "ultimo");
    CHECK(get_quorum("x", &k) && strcmp(k.value, "ultimo") == 0, "Si una réplica no responde, lee de las otras");
    vivo[1] = 0;
    CHECK(!get_quorum("x", &k), "Con una sola réplica viva no hay quórum de lectura (R=2)");
    return 0;
}
