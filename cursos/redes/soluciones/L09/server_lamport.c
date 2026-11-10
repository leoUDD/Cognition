/* server_lamport.c — fragmento (servidor y cliente) */
#include <stdio.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>

typedef struct {
    int ts;
    char payload[64];
} Msg;

static int global_clock = 0;

void handle_client(int fd) {
    Msg msg, resp;
    while (recv(fd, &msg, sizeof(msg), 0) > 0) {
        /* 1. Actualizar reloj al recibir */
//@TODO 1 | Regla de recepción
        if (msg.ts > global_clock) //§
            global_clock = msg.ts; //§
        global_clock++; //§
//@END
        printf("[srv clock=%d] recibido '%s'\n", global_clock, msg.payload);

        /* 2. Evento interno de procesamiento */
//@TODO 2 | Evento interno
        global_clock++; //§
//@END

        /* 3. Preparar respuesta con timestamp */
        snprintf(resp.payload, sizeof(resp.payload), "ACK");
//@TODO 3 | Guardar timestamp en resp.ts (enviar también es un evento)
        global_clock++; //§
        resp.ts = global_clock; //§
//@END
        send(fd, &resp, sizeof(resp), 0);
    }
}

/* Fragmento del cliente */
void client_send(int fd, int *clock, const char *text) {
    Msg msg;
//@TODO 4 | Incrementar reloj y adjuntar timestamp
    (*clock)++; //§
    msg.ts = *clock; //§
//@END
    snprintf(msg.payload, sizeof(msg.payload), "%s", text);
    send(fd, &msg, sizeof(msg), 0);
}
