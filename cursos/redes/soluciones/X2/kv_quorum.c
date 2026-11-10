/* Escritura y lectura con quórum */
#include <stdbool.h>
#include <string.h>

#define NREP 3
#define W 2
#define R 2

typedef struct {
    char key[64];
    char value[256];
    int version;
} KVPair;

/* Ya implementadas (no las modifiques): */
bool send_write(int replica, const char *key, const char *value);        /* true = ack */
bool read_from_replica(int replica, const char *key, KVPair *out);       /* true = respondió */

bool put_quorum(const char *key, const char *value) {
//@TODO 1 | Implementar put_quorum
//? Escribir con quórum: ¿cuántos acks necesitas y cuándo puedes dejar de enviar?
//- acks = 0; for cada réplica: si send_write devuelve true, acks++.
//- Apenas acks ≥ W → return true.
//- Si terminó el for → return false.
    int acks = 0;
    for (int i = 0; i < NREP; i++) {
        if (send_write(i, key, value)) acks++; //§
        if (acks >= W) return true; //§
    }
    return false;
//@END
}

bool get_quorum(const char *key, KVPair *result) {
//@TODO 2 | Implementar get_quorum
//? Leer de R réplicas y quedarte con la versión más nueva. ¿Qué haces con una réplica caída?
//- for réplicas mientras count < R: si read_from_replica falla → continue.
//- Si es la primera lectura o tiene mayor version → latest = tmp.
//- count++.
//- Si count < R → false; si no, *result = latest y true.
    int count = 0;
    KVPair latest;
    memset(&latest, 0, sizeof(latest));
    for (int i = 0; i < NREP && count < R; i++) {
        KVPair tmp;
        if (!read_from_replica(i, key, &tmp)) continue; //§
        if (count == 0 || tmp.version > latest.version) latest = tmp; //§
        count++; //§
    }
    if (count < R) return false; //§
    *result = latest;
    return true;
//@END
}

