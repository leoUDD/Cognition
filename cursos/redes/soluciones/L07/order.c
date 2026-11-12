/* order.c */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    char proc[4];
    int ts;
    char name[8];
} Event;

int total_order_cmp(const void *a, const void *b) {
//@TODO 1 | <0 si a va primero, >0 si b va primero
//? qsort te entrega dos punteros genéricos (void*). ¿Qué haces primero para poder leer sus campos? ¿Y qué comparas después?
//- Convierte cada puntero: const Event *x = (const Event *)a; lo mismo con b.
//- Si el ts de x es menor, x va primero: return -1. Si es mayor: return 1.
//- Si empatan, desempata por nombre de proceso: return strcmp(x->proc, y->proc).
    const Event *x = (const Event *)a; //§ //: qsort me da un puntero genérico: lo convierto a Event*
    const Event *y = (const Event *)b; //§ //: lo mismo con el segundo evento
    if (x->ts < y->ts) { //§ //: ¿x tiene un timestamp menor?
        return -1; //§ //: negativo = x va primero
    }
    if (x->ts > y->ts) { //§ //: ¿x tiene un timestamp mayor?
        return 1; //§ //: positivo = y va primero
    }
    return strcmp(x->proc, y->proc); //§ //: empate en ts: desempato por nombre de proceso (P1 < P2 < P3)
//@END
}

Event events[] = {
    {"P2",4,"α"}, {"P1",4,"β"}, {"P3",1,"γ"}, {"P1",7,"δ"},
    {"P3",4,"ε"}, {"P2",9,"ζ"}, {"P1",2,"η"}, {"P3",6,"θ"},
};
#define N (sizeof(events)/sizeof(events[0]))

int main(void) {
    qsort(events, N, sizeof(Event), total_order_cmp);
    for (int i = 0; i < (int)N; i++) {
        printf("%d. [%s ts=%d] %s\n", i+1, events[i].proc, events[i].ts, events[i].name);
    }
    return 0;
}
