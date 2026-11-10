/* Prueba del Extra 4: heartbeats con relojes manipulados */
#include <stdio.h>
#include "../heartbeats.c"
#define CHECK(c, msg) printf((c) ? "OK: %s\n" : "FALLA: %s\n", msg)
int fallas_avisadas[MAX_NODES], recuperaciones[MAX_NODES];
void handle_node_failure(int id) { fallas_avisadas[id]++; }
void handle_node_recovery(int id) { recuperaciones[id]++; }
int main(void) {
    time_t ahora = time(NULL);
    for (int i = 0; i < 3; i++) { nodes[i].node_id = i; nodes[i].is_alive = true; nodes[i].last_heartbeat = ahora; }
    nodes[1].last_heartbeat = ahora - 10;           /* nodo 1 lleva 10 s sin heartbeat */
    nodes[2].last_heartbeat = ahora - 2;            /* nodo 2 solo 2 s */
    check_nodes(3);
    CHECK(!nodes[1].is_alive && fallas_avisadas[1] == 1, "Detecta como caído al nodo con 10 s de silencio");
    CHECK(nodes[0].is_alive && nodes[2].is_alive, "No marca a nodos dentro del timeout");
    check_nodes(3);
    CHECK(fallas_avisadas[1] == 1, "No vuelve a avisar la misma caída");
    on_heartbeat(1);
    CHECK(nodes[1].is_alive && recuperaciones[1] == 1, "Un heartbeat revive al nodo y avisa la recuperación");
    CHECK(nodes[1].last_heartbeat >= ahora, "on_heartbeat actualiza last_heartbeat");
    on_heartbeat(0);
    CHECK(recuperaciones[0] == 0, "Un heartbeat de un nodo vivo no cuenta como recuperación");
    return 0;
}
