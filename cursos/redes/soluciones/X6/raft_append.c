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
//- Si log[prev_log_index].term == prev_log_term → true; si no → false.
    if (prev_log_index > n->last_log_index) { //§ //: ¿mi log es más corto que eso?
        return false; //§ //: no tengo esa entrada
    }
    if (n->log[prev_log_index].term == prev_log_term) { //§ //: ¿mi entrada tiene el mismo term que dice el líder?
        return true; //§ //: los logs coinciden hasta ahí
    }
    return false; //§ //: distinto term: los logs no coinciden
//@END
}

bool on_append_entries(RaftNode *n, const AppendEntriesArgs *args) {
//@TODO 2 | Implementar on_append_entries
//? Primero los rechazos; después copiar las entradas y avanzar el commit.
//- term del líder < current_term → false; si no, adopta su term.
//- Si log_matches da false → false.
//- Para cada entrada k: idx = prev_log_index + 1 + k; log[idx] = entries[k]; last_log_index = idx.
//- Si leader_commit > commit_index → commit_index = el menor entre leader_commit y last_log_index.
    if (args->term < n->current_term) { //§ //: ¿el "líder" viene de un term viejo?
        return false; //§ //: lo rechazo
    }
    n->current_term = args->term; //: adopto el term del líder

    if (log_matches(n, args->prev_log_index, args->prev_log_term) == false) { //§ //: ¿mi log no coincide antes de las nuevas entradas?
        return false; //§ //: rechazo: el líder me mandará entradas más atrás
    }

    for (int k = 0; k < args->n_entries; k++) { //: recorro las entradas nuevas
        int idx = args->prev_log_index + 1 + k; //§ //: posición donde va la entrada k
        n->log[idx] = args->entries[k]; //§ //: la copio (pisa lo que hubiera)
        n->last_log_index = idx; //§ //: mi log ahora termina ahí
    }

    if (args->leader_commit > n->commit_index) { //§ //: ¿el líder confirmó más entradas que yo?
        n->commit_index = args->leader_commit; //§ //: avanzo hasta donde dice el líder…
        if (n->last_log_index < n->commit_index) { //§ //: …pero no más allá de lo que tengo
            n->commit_index = n->last_log_index; //§ //: (es el min de los dos)
        }
    }
    return true; //: entradas aceptadas
//@END
}

