/* Raft: otorgar o negar un voto */
#include <stdbool.h>

typedef enum { FOLLOWER, CANDIDATE, LEADER } RaftState;

typedef struct {
    RaftState state;
    int current_term;
    int voted_for;        /* -1 = aún no vota en este term */
    int last_log_index;
    int last_log_term;
} RaftNode;

typedef struct {
    int term;
    int candidate_id;
    int last_log_index;
    int last_log_term;
} RequestVoteArgs;

bool on_request_vote(RaftNode *n, const RequestVoteArgs *args) {
//@TODO 1 | Implementar on_request_vote
//? Piensa las reglas como filtros: cada if descarta un caso con return false.
//- term del candidato < current_term → false.
//- term mayor → actualiza current_term, voted_for = −1 y estado FOLLOWER (y sigue evaluando).
//- Ya votó por otro en este term → false.
//- Log del candidato menos actualizado (menor último term, o igual term y menor índice) → false.
//- Si pasó todo: voted_for = candidato y true.
    if (args->term < n->current_term) { //§ //: ¿el candidato viene de un term viejo?
        return false; //§ //: entonces no le doy el voto
    }
    if (args->term > n->current_term) { //§ //: ¿viene de un term más nuevo que el mío?
        n->current_term = args->term; //§ //: adopto su term
        n->voted_for = -1; //§ //: en este term nuevo aún no he votado
        n->state = FOLLOWER; //§ //: y vuelvo a ser follower
    }
    if (n->voted_for != -1) { //§ //: ¿ya voté en este term?
        if (n->voted_for != args->candidate_id) { //§ //: ¿y fue por otro?
            return false; //§ //: solo un voto por term
        }
    }
    /* el log del candidato debe estar al menos tan actualizado */
    if (args->last_log_term < n->last_log_term) { //§ //: ¿su último term es más viejo que el mío?
        return false; //§ //: su log está atrasado
    }
    if (args->last_log_term == n->last_log_term) { //§ //: mismo último term…
        if (args->last_log_index < n->last_log_index) { //§ //: …pero su log es más corto
            return false; //§ //: también está atrasado
        }
    }
    n->voted_for = args->candidate_id; //§ //: pasó todos los filtros: voto por él
    return true; //§ //: le concedo el voto
//@END
}

