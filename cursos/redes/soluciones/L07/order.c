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
    const Event *x = (const Event *)a; //§
    const Event *y = (const Event *)b; //§
    if (x->ts != y->ts) //§
        return x->ts - y->ts; //§
    return strcmp(x->proc, y->proc); //§
//@END
}

Event events[] = {
    {"P2",4,"α"}, {"P1",4,"β"}, {"P3",1,"γ"}, {"P1",7,"δ"},
    {"P3",4,"ε"}, {"P2",9,"ζ"}, {"P1",2,"η"}, {"P3",6,"θ"},
};
#define N (sizeof(events)/sizeof(events[0]))

int main(void) {
    qsort(events, N, sizeof(Event), total_order_cmp);
    for (int i = 0; i < (int)N; i++)
        printf("%d. [%s ts=%d] %s\n", i+1, events[i].proc, events[i].ts, events[i].name);
    return 0;
}
