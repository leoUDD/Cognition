/* Monitor de heartbeats */
#include <stdio.h>
#include <stdbool.h>
#include <time.h>

#define MAX_NODES 8
#define TIMEOUT 3

typedef struct {
    int node_id;
    time_t last_heartbeat;
    bool is_alive;
} NodeStatus;

NodeStatus nodes[MAX_NODES];

void handle_node_failure(int id);     /* ya implementadas */
void handle_node_recovery(int id);

void on_heartbeat(int node_id) {
//@TODO 1 | Implementar on_heartbeat
//? Llega un heartbeat: actualiza la hora y revisa si el nodo estaba dado por muerto.
//- nodes[id].last_heartbeat = time(NULL).
//- Si no estaba vivo → is_alive = true y handle_node_recovery(id).
    nodes[node_id].last_heartbeat = time(NULL); //§
    if (!nodes[node_id].is_alive) { //§
        nodes[node_id].is_alive = true; //§
        handle_node_recovery(node_id); //§
    }
//@END
}

void check_nodes(int num_nodes) {
//@TODO 2 | Implementar check_nodes
//? ¿Cómo sabes cuánto silencio lleva un nodo y cómo evitas avisar dos veces?
//- now = time(NULL); para cada nodo: silencio = now − last_heartbeat.
//- Si silencio > TIMEOUT y el nodo figuraba vivo → is_alive = false, imprime y handle_node_failure(i).
    time_t now = time(NULL);
    for (int i = 0; i < num_nodes; i++) {
        int silence = (int)(now - nodes[i].last_heartbeat); //§
        if (silence > TIMEOUT && nodes[i].is_alive) { //§
            nodes[i].is_alive = false; //§
            printf("Node %d detected as DOWN (timeout: %ds)\n", i, silence); //§
            handle_node_failure(i); //§
        }
    }
//@END
}

