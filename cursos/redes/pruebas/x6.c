/* Prueba del Extra 6: AppendEntries */
#include <stdio.h>
#include <string.h>
#include "../raft_append.c"
#define CHECK(c, msg) printf((c) ? "OK: %s\n" : "FALLA: %s\n", msg)
void cargar(RaftNode *n, const int *terms, int k, int term_actual) {
    memset(n, 0, sizeof *n); n->current_term = term_actual;
    for (int i = 1; i <= k; i++) { n->log[i].term = terms[i - 1]; n->log[i].cmd = 100 + i; }
    n->last_log_index = k;
}
int main(void) {
    RaftNode n; AppendEntriesArgs a;
    int f[] = {1, 1, 2};                     /* follower: índices 1..3 con terms 1,1,2 */
    cargar(&n, f, 3, 2);
    CHECK(log_matches(&n, 0, 0), "prev_log_index 0 (centinela) siempre coincide");
    CHECK(log_matches(&n, 2, 1), "Coincide si log[2].term == 1");
    CHECK(!log_matches(&n, 3, 3), "No coincide si el term difiere");
    CHECK(!log_matches(&n, 5, 1), "No coincide si el follower no tiene esa entrada (índice fuera)");
    memset(&a, 0, sizeof a); a.term = 1;
    CHECK(!on_append_entries(&n, &a), "Rechaza un AppendEntries de un líder con term viejo");
    memset(&a, 0, sizeof a); a.term = 3; a.prev_log_index = 2; a.prev_log_term = 1;
    a.n_entries = 2; a.entries[0].term = 3; a.entries[0].cmd = 7; a.entries[1].term = 3; a.entries[1].cmd = 8; a.leader_commit = 10;
    CHECK(on_append_entries(&n, &a), "Acepta cuando prev coincide");
    CHECK(n.log[3].term == 3 && n.log[3].cmd == 7 && n.log[4].cmd == 8, "Escribe desde prev_log_index + 1, sobrescribiendo el conflicto");
    CHECK(n.last_log_index == 4, "Actualiza last_log_index");
    CHECK(n.commit_index == 4, "commit_index = min(leader_commit, último índice)");
    CHECK(n.current_term == 3, "Adopta el term del líder");
    memset(&a, 0, sizeof a); a.term = 3; a.prev_log_index = 4; a.prev_log_term = 2;
    CHECK(!on_append_entries(&n, &a), "Rechaza si el term en prev_log_index no coincide (el líder retrocederá)");
    return 0;
}
