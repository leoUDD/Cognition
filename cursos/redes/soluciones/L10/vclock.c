/* vclock.c — relojes vectoriales */
#include <stdio.h>

#define NPROC 3

typedef struct {
    int v[NPROC];   /* v[i] = conocimiento sobre Pi */
    int pid;
} VNode;

void vc_local(VNode *n) {
//@TODO 1 | Incrementa solo la propia entrada
//? En un vector clock, cada proceso solo avanza SU propia posición en un evento local. ¿Cuál es la suya?
//- Su posición es v[pid]: n->v[n->pid]++.
    n->v[n->pid]++; //§
//@END
}

void vc_send(VNode *n, int out[NPROC]) {
//@TODO 2 | Incrementa y copia el vector a out
//? Enviar = evento local + mandar una copia del vector completo.
//- n->v[n->pid]++.
//- for i en 0..NPROC-1: out[i] = n->v[i].
    n->v[n->pid]++; //§
    for (int i = 0; i < NPROC; i++) { //§
        out[i] = n->v[i]; //§
    }
//@END
}

void vc_recv(VNode *n, const int rcv[NPROC]) {
//@TODO 3 | Máximo componente a componente, luego incrementa
//? Al recibir, ¿cómo mezclas lo que tú sabes con lo que sabe el emisor sin perder información?
//- Para cada componente i: si rcv[i] > n->v[i], n->v[i] = rcv[i] (máximo componente a componente).
//- Después, incrementa tu propia posición: n->v[n->pid]++.
    for (int i = 0; i < NPROC; i++) { //§
        if (rcv[i] > n->v[i]) { //§
            n->v[i] = rcv[i]; //§
        }
    }
    n->v[n->pid]++; //§
//@END
}

/* a → b sii ∀i: a[i] ≤ b[i] y ∃j: a[j] < b[j] */
int vc_happens_before(const int a[NPROC], const int b[NPROC]) {
//@TODO 4 | Comparación de vectores
//? a → b significa: a no supera a b en ninguna componente y es menor en al menos una. ¿Cómo lo revisas con un for?
//- alguno_menor = 0.
//- Para cada i: si a[i] > b[i] → return 0 (ya no puede ser a → b).
//- Si a[i] < b[i] → alguno_menor = 1.
//- Al final: return alguno_menor (si todos eran iguales, no es a → b).
    int alguno_menor = 0; //§
    for (int i = 0; i < NPROC; i++) {
        if (a[i] > b[i]) { //§
            return 0; //§
        }
        if (a[i] < b[i]) { //§
            alguno_menor = 1; //§
        }
    }
    return alguno_menor; //§
//@END
}

int vc_concurrent(const int a[NPROC], const int b[NPROC]) {
//@TODO 5 | Usa vc_happens_before
//? Dos eventos son concurrentes si ninguno ocurrió antes que el otro.
//- Si vc_happens_before(a, b) → return 0 (a pasó antes: no son concurrentes).
//- Si vc_happens_before(b, a) → return 0 (b pasó antes).
//- Si ninguno pasó antes → return 1.
    if (vc_happens_before(a, b)) { //§
        return 0; //§
    }
    if (vc_happens_before(b, a)) { //§
        return 0; //§
    }
    return 1; //§
//@END
}

void print_vc(const char *label, const int v[NPROC]) {
    printf("%s: [%d,%d,%d]\n", label, v[0], v[1], v[2]);
}

int main(void) {
    VNode p0 = {{0,0,0}, 0};
    VNode p1 = {{0,0,0}, 1};
    VNode p2 = {{0,0,0}, 2};
    int ts[NPROC], snap_a[NPROC], snap_b[NPROC];

    vc_local(&p0);                      /* evento a */
    for (int i = 0; i < NPROC; i++) {   /* foto del vector en el evento a */
        snap_a[i] = p0.v[i];
    }
    print_vc("P0 tras a", p0.v);

    vc_local(&p2);                      /* evento b — independiente */
    for (int i = 0; i < NPROC; i++) {   /* foto del vector en el evento b */
        snap_b[i] = p2.v[i];
    }
    print_vc("P2 tras b", p2.v);

    vc_send(&p0, ts);                   /* P0 envía m1 */
    vc_recv(&p1, ts);                   /* P1 recibe m1 */
    print_vc("P1 tras recv m1", p1.v);

    if (vc_happens_before(snap_a, p1.v)) {
        printf("a → P1_actual: SÍ\n");
    } else {
        printf("a → P1_actual: NO\n");
    }
    if (vc_concurrent(snap_a, snap_b)) {
        printf("a ∥ b: SÍ\n");
    } else {
        printf("a ∥ b: NO\n");
    }
    return 0;
}
