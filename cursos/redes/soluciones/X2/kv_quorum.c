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

