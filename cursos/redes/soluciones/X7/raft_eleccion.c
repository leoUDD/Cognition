/* Raft: iniciar y ganar una elección */
#include <stdbool.h>

#define CLUSTER_SIZE 5

typedef enum { FOLLOWER, CANDIDATE, LEADER } RaftState;

typedef struct {
    RaftState state;
    int id;
    int current_term;
    int voted_for;
    int votes_received;
} RaftNode;

typedef struct { int term; bool vote_granted; } RequestVoteReply;

/* Ya implementadas: */
void send_request_vote(int dest, int term, int candidate_id);
void send_heartbeats_to_all(void);
void reset_election_timeout(void);

void on_election_timeout(RaftNode *n) {
//@TODO 1 | Implementar on_election_timeout
//? Se acabó el timeout sin noticias del líder. ¿Qué 5 cosas hace un follower para postularse?
//- current_term = current_term + 1.
//- state = CANDIDATE.
//- Vota por sí mismo: voted_for = id; votes_received = 1.
//- reset_election_timeout().
//- send_request_vote a todos los demás (no a sí mismo).
    n->current_term = n->current_term + 1; //§ //: empiezo un term nuevo
    n->state = CANDIDATE; //§ //: me postulo
    n->voted_for = n->id; //§ //: voto por mí mismo…
    n->votes_received = 1; //§ //: …así que ya tengo 1 voto
    reset_election_timeout(); //: reinicio mi cronómetro
    for (int dest = 0; dest < CLUSTER_SIZE; dest++) { //: a cada nodo…
        if (dest != n->id) { //§ //: …menos a mí…
            send_request_vote(dest, n->current_term, n->id); //§ //: …le pido su voto
        }
    }
//@END
}

void on_request_vote_reply(RaftNode *n, const RequestVoteReply *r) {
//@TODO 2 | Implementar on_request_vote_reply
//? Llega una respuesta de voto. ¿Cuándo te vuelves líder?
//- Si ya no eres CANDIDATE → return (ignora respuestas tardías).
//- Si vote_granted → votes_received = votes_received + 1.
//- Si votes_received > CLUSTER_SIZE / 2 → LEADER y send_heartbeats_to_all().
    if (n->state != CANDIDATE) { //§ //: ¿ya no soy candidato? (gané o apareció otro líder)
        return; //§ //: ignoro la respuesta
    }
    if (r->vote_granted) { //§ //: ¿me dio su voto?
        n->votes_received = n->votes_received + 1; //§ //: un voto más
    }
    if (n->votes_received > CLUSTER_SIZE / 2) { //§ //: ¿tengo mayoría estricta? (con 5, 3 votos)
        n->state = LEADER; //§ //: gané: soy líder
        send_heartbeats_to_all(); //§ //: aviso a todos de inmediato
    }
//@END
}

