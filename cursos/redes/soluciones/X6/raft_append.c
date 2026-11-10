/* Raft: consistency check de AppendEntries */
#include <stdbool.h>

#define MAX_LOG 128

typedef struct { int term; int cmd; } LogEntry;

typedef struct {
    int current_term;
    LogEntry log[MAX_LOG];   /* log[0] = centinela (term 0) */
    int last_log_index;
    int commit_index;
} RaftNode;

typedef struct {
    int term;
    int prev_log_index;
    int prev_log_term;
    int n_entries;
    LogEntry entries[8];
    int leader_commit;
} AppendEntriesArgs;

bool log_matches(const RaftNode *n, int prev_log_index, int prev_log_term) {
//@TODO 1 | Implementar log_matches
//? ¿Tiene el follower la entrada prev_log_index con el term que dice el líder?
//- Si prev_log_index > last_log_index → false (no la tiene).
//- return log[prev_log_index].term == prev_log_term.
    if (prev_log_index > n->last_log_index) return false; //§
    return n->log[prev_log_index].term == prev_log_term; //§
//@END
}

bool on_append_entries(RaftNode *n, const AppendEntriesArgs *args) {
//@TODO 2 | Implementar on_append_entries
//? Primero los rechazos; después copiar las entradas y avanzar el commit.
//- term del líder < current_term → false; si no, adopta su term.
//- Si !log_matches → false.
//- Para cada entrada k: idx = prev_log_index + 1 + k; log[idx] = entries[k]; last_log_index = idx.
//- Si leader_commit > commit_index → commit_index = min(leader_commit, last_log_index).
    if (args->term < n->current_term) return false; //§
    n->current_term = args->term;
    
    if (!log_matches(n, args->prev_log_index, args->prev_log_term)) return false; //§
    
    for (int k = 0; k < args->n_entries; k++) {
        int idx = args->prev_log_index + 1 + k; //§
        n->log[idx] = args->entries[k]; //§
        n->last_log_index = idx; //§
    }
    
    if (args->leader_commit > n->commit_index) { //§
        n->commit_index = args->leader_commit < n->last_log_index ? args->leader_commit : n->last_log_index; //§
    }
    return true;
//@END
}

