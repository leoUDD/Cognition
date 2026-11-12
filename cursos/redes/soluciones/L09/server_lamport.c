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
//? Llegó un mensaje con msg.ts. Aplica la regla de recepción al reloj global.
//- Si msg.ts > global_clock → global_clock = msg.ts.
//- global_clock++.
        if (msg.ts > global_clock) { //§
            global_clock = msg.ts; //§
        }
        global_clock++; //§
//@END
        printf("[srv clock=%d] recibido '%s'\n", global_clock, msg.payload);

        /* 2. Evento interno de procesamiento */
//@TODO 2 | Evento interno
//? Procesar el mensaje es un evento interno. ¿Qué regla aplica?
//- global_clock++.
        global_clock++; //§
//@END

        /* 3. Preparar respuesta con timestamp */
        snprintf(resp.payload, sizeof(resp.payload), "ACK");
//@TODO 3 | Guardar timestamp en resp.ts (enviar también es un evento)
//? La respuesta debe llevar el reloj del servidor. Enviar también cuenta como evento.
//- global_clock++ (evento de envío).
//- resp.ts = global_clock.
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
//? Desde el cliente: regla de envío con un reloj que llega como puntero.
//- *clock = *clock + 1 (clock es un puntero: *clock es el número).
//- msg.ts = *clock.
    *clock = *clock + 1; //§
    msg.ts = *clock; //§
//@END
    snprintf(msg.payload, sizeof(msg.payload), "%s", text);
    send(fd, &msg, sizeof(msg), 0);
}
