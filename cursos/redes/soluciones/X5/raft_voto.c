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
    if (args->term < n->current_term) return false; //§
    if (args->term > n->current_term) { //§
        n->current_term = args->term; //§
        n->voted_for = -1; //§
        n->state = FOLLOWER; //§
    }
    if (n->voted_for != -1 && n->voted_for != args->candidate_id) return false; //§
    /* el log del candidato debe estar al menos tan actualizado */
    if (args->last_log_term < n->last_log_term) return false; //§
    if (args->last_log_term == n->last_log_term && args->last_log_index < n->last_log_index) return false; //§
    n->voted_for = args->candidate_id; //§
    return true; //§
//@END
}

