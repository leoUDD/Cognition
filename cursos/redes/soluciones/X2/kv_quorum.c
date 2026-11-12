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
//- acks = 0; para cada réplica: si send_write devuelve true, acks = acks + 1.
//- Apenas acks >= W → return true.
//- Si terminó el for → return false.
    int acks = 0; //: confirmaciones recibidas
    for (int i = 0; i < NREP; i++) { //: intento escribir en cada réplica
        if (send_write(i, key, value)) { //§ //: ¿la réplica i confirmó (ack)?
            acks = acks + 1; //§ //: una confirmación más
        }
        if (acks >= W) { //§ //: ¿ya tengo W confirmaciones?
            return true; //§ //: escritura exitosa: no necesito más
        }
    }
    return false; //: recorrí todas y no llegué a W: falla
//@END
}

bool get_quorum(const char *key, KVPair *result) {
//@TODO 2 | Implementar get_quorum
//? Leer de R réplicas y quedarte con la versión más nueva. ¿Qué haces con una réplica caída?
//- Recorre las réplicas; si ya tienes R lecturas, detente (break).
//- Si read_from_replica falla, pasa a la siguiente (la réplica no respondió).
//- Si es la primera lectura o tiene mayor version → latest = tmp; count = count + 1.
//- Si count < R → false; si no, *result = latest y true.
    int count = 0; //: lecturas que sí respondieron
    KVPair latest; //: la versión más nueva que he visto
    memset(&latest, 0, sizeof(latest)); //: la dejo en ceros
    for (int i = 0; i < NREP; i++) { //: pregunto a cada réplica
        if (count >= R) { //: ¿ya tengo R lecturas?
            break; //: listo, no pregunto más
        }
        KVPair tmp; //: aquí queda lo que responde la réplica i
        if (read_from_replica(i, key, &tmp)) { //§ //: ¿respondió? (si no, la salto)
            if (count == 0) { //§ //: es la primera lectura…
                latest = tmp; //§ //: …así que por ahora es la más nueva
            }
            if (tmp.version > latest.version) { //§ //: ¿esta versión es más nueva?
                latest = tmp; //§ //: me quedo con ella
            }
            count = count + 1; //§ //: una lectura más
        }
    }
    if (count < R) { //§ //: ¿no alcancé R lecturas?
        return false; //§ //: no hay quórum de lectura
    }
    *result = latest; //: entrego la versión más nueva por el puntero
    return true; //: lectura exitosa
//@END
}

