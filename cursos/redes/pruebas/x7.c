/* Prueba del Extra 7: elección con red simulada */
#include <stdio.h>
#include "../raft_eleccion.c"
#define CHECK(c, msg) printf((c) ? "OK: %s\n" : "FALLA: %s\n", msg)
int pedidos[CLUSTER_SIZE], heartbeats, resets;
void send_request_vote(int dest, int term, int id) { (void)term; (void)id; pedidos[dest]++; }
void send_heartbeats_to_all(void) { heartbeats++; }
void reset_election_timeout(void) { resets++; }
int main(void) {
    RaftNode n = { FOLLOWER, 2, 4, -1, 0 };
    on_election_timeout(&n);
    CHECK(n.current_term == 5 && n.state == CANDIDATE, "Incrementa el term y pasa a CANDIDATE");
    CHECK(n.voted_for == 2 && n.votes_received == 1, "Vota por sí mismo (votes_received = 1)");
    int otros = 0; for (int i = 0; i < CLUSTER_SIZE; i++) if (i != 2) otros += pedidos[i];
    CHECK(otros == CLUSTER_SIZE - 1 && pedidos[2] == 0, "Pide voto a los 4 demás y no a sí mismo");
    CHECK(resets == 1, "Reinicia su timeout de elección");
    RequestVoteReply si = { 5, true }, no = { 5, false };
    on_request_vote_reply(&n, &si);
    CHECK(n.state == CANDIDATE, "Con 2 votos de 5 todavía no es líder");
    on_request_vote_reply(&n, &no);
    CHECK(n.votes_received == 2, "Un voto negado no suma");
    on_request_vote_reply(&n, &si);
    CHECK(n.state == LEADER && heartbeats == 1, "Con 3 de 5 (mayoría estricta) pasa a LEADER y envía heartbeats");
    on_request_vote_reply(&n, &si);
    CHECK(heartbeats == 1, "Si ya no es candidato, ignora respuestas tardías");
    return 0;
}
