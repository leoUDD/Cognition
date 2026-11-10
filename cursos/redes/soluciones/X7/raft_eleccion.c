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
    n->current_term++; //§
    n->state = CANDIDATE; //§
    n->voted_for = n->id; //§
    n->votes_received = 1; //§
    reset_election_timeout();
    for (int dest = 0; dest < CLUSTER_SIZE; dest++) {
        if (dest != n->id) send_request_vote(dest, n->current_term, n->id); //§
    }
//@END
}

void on_request_vote_reply(RaftNode *n, const RequestVoteReply *r) {
//@TODO 2 | Implementar on_request_vote_reply
    if (n->state != CANDIDATE) return; //§
    if (r->vote_granted) n->votes_received++; //§
    if (n->votes_received > CLUSTER_SIZE / 2) { //§
        n->state = LEADER; //§
        send_heartbeats_to_all(); //§
    }
//@END
}

