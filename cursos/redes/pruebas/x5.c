/* Prueba del Extra 5: casos de RequestVote */
#include <stdio.h>
#include "../raft_voto.c"
#define CHECK(c, msg) printf((c) ? "OK: %s\n" : "FALLA: %s\n", msg)
RaftNode nodo(int term, int voted, int li, int lt) { RaftNode n = { FOLLOWER, term, voted, li, lt }; return n; }
RequestVoteArgs pide(int term, int cand, int li, int lt) { RequestVoteArgs a = { term, cand, li, lt }; return a; }
int main(void) {
    RaftNode n; RequestVoteArgs a;
    n = nodo(5, -1, 4, 3); a = pide(4, 2, 9, 3);
    CHECK(!on_request_vote(&n, &a), "Rechaza a un candidato con term menor");
    n = nodo(5, -1, 4, 3); a = pide(5, 2, 4, 3);
    CHECK(on_request_vote(&n, &a) && n.voted_for == 2, "Concede si no ha votado y el log está igual de actualizado; registra voted_for");
    a = pide(5, 3, 4, 3);
    CHECK(!on_request_vote(&n, &a), "Un voto por term: rechaza a otro candidato en el mismo term");
    a = pide(5, 2, 4, 3);
    CHECK(on_request_vote(&n, &a), "Acepta el reintento del mismo candidato");
    n = nodo(5, 1, 4, 3); a = pide(6, 2, 4, 3);
    CHECK(on_request_vote(&n, &a) && n.current_term == 6 && n.voted_for == 2, "Term mayor: actualiza su term, olvida el voto anterior y vota");
    n = nodo(5, -1, 4, 3); n.state = LEADER; a = pide(6, 2, 1, 2);
    CHECK(!on_request_vote(&n, &a) && n.current_term == 6 && n.state == FOLLOWER, "Term mayor pero log viejo: se vuelve FOLLOWER y actualiza term, pero NO vota");
    n = nodo(5, -1, 7, 3); a = pide(5, 2, 6, 3);
    CHECK(!on_request_vote(&n, &a), "Mismo último term pero log más corto: rechaza");
    n = nodo(5, -1, 7, 3); a = pide(5, 2, 2, 4);
    CHECK(on_request_vote(&n, &a), "Último term mayor gana aunque el log sea más corto");
    return 0;
}
