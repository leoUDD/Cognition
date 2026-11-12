/* Coordinador de Two-Phase Commit */
#include <stdbool.h>

#define N_REPLICAS 3

typedef enum { NO = 0, YES = 1 } Voto;

/* Ya implementadas: */
Voto send_prepare(int replica, const char *key, const char *value);
void send_commit(int replica, const char *key, const char *value);
void send_abort(int replica);

bool two_phase_commit(const char *key, const char *value) {
//@TODO 1 | Implementar two_phase_commit
//? Fase 1 pregunta y fase 2 ejecuta. ¿Basta con mayoría o se necesita unanimidad?
//- Fase 1: para cada réplica, si send_prepare == YES → votes_yes = votes_yes + 1.
//- Si votes_yes == N_REPLICAS → send_commit a todas y return true.
//- Si no → send_abort a todas y return false.
    int votes_yes = 0; //: votos a favor

    /* FASE 1: PREPARE */
    for (int i = 0; i < N_REPLICAS; i++) { //: pregunto a cada réplica
        if (send_prepare(i, key, value) == YES) { //§ //: ¿la réplica i puede hacerlo?
            votes_yes = votes_yes + 1; //§ //: un voto a favor más
        }
    }

    /* FASE 2: COMMIT o ABORT */
    if (votes_yes == N_REPLICAS) { //§ //: ¿votaron TODAS que sí? (unanimidad, no mayoría)
        for (int i = 0; i < N_REPLICAS; i++) { //§ //: a cada réplica…
            send_commit(i, key, value); //§ //: …le digo que confirme
        }
        return true; //§ //: transacción confirmada
    }
    for (int i = 0; i < N_REPLICAS; i++) { //§ //: si alguna dijo que no, a cada réplica…
        send_abort(i); //§ //: …le digo que deshaga
    }
    return false; //§ //: transacción abortada
//@END
}

