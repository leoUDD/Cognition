/* reloj.c — nodo con reloj de Lamport */
#include <stdio.h>

typedef struct {
    int clock;
    char id[8];
} Node;

void lamport_local(Node *n) {
//@TODO 1 | Evento interno: C <- C + 1
//? Regla 1 de Lamport: ¿qué le pasa al reloj en un evento interno?
//- Súmale 1 al reloj del nodo: n->clock++ (n es un puntero, por eso ->).
    n->clock++; //§ //: evento: sumo 1 a mi reloj (n es puntero, por eso ->)
//@END
}

void lamport_send(Node *n, int *ts) {
//@TODO 2 | Envío: incrementar y guardar en *ts el timestamp a enviar
//? Enviar también es un evento, y además el mensaje debe llevar un timestamp. ¿Primero incrementas o primero copias?
//- Primero incrementa el reloj (es un evento).
//- Luego copia ese valor al lugar que apunta ts: *ts = n->clock.
    n->clock++; //§ //: evento: sumo 1 a mi reloj (n es puntero, por eso ->)
    *ts = n->clock; //§ //: escribo el reloj en la variable ts de quien me llamó
//@END
}

void lamport_recv(Node *n, int ts_recv) {
//@TODO 3 | Recepción: C <- max(C, T) + 1
//? Al recibir, el reloj debe quedar por delante tanto de su propio pasado como del emisor. ¿Cómo combinas los dos valores?
//- Si el ts recibido es mayor que tu reloj, tu reloj salta a ese valor (es el max; en C se hace con un if).
//- Después, en cualquier caso, súmale 1.
    if (ts_recv > n->clock) { //§ //: ¿el reloj que llegó es mayor que el mío?
        n->clock = ts_recv; //§ //: entonces salto a ese valor (esto es el max)
    }
    n->clock++; //§ //: evento: sumo 1 a mi reloj (n es puntero, por eso ->)
//@END
}

int main(void) {
    Node p1 = { 0, "P1" };
    Node p2 = { 0, "P2" };
    int ts;

    lamport_local(&p1);           /* a: evento interno P1 */
    lamport_send(&p1, &ts);       /* b: P1 envía m1 */
    printf("%s envía m1 ts=%d\n", p1.id, ts);

    lamport_local(&p2);           /* c: evento interno P2 */
    lamport_recv(&p2, ts);        /* d: P2 recibe m1 */
    printf("%s recibe m1 clock=%d\n", p2.id, p2.clock);

    lamport_send(&p2, &ts);       /* e: P2 envía m2 */
    lamport_recv(&p1, ts);        /* f: P1 recibe m2 */
    printf("%s recibe m2 clock=%d\n", p1.id, p1.clock);
    return 0;
}
