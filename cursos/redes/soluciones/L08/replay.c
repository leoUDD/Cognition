/* replay.c */
#include <stdio.h>

typedef enum { LOCAL, SEND, RECV } EvType;

typedef struct {
    EvType type;
    int ts_recv;    /* válido solo si type == RECV */
} LogEntry;

LogEntry log_[] = {
    {LOCAL,0}, {LOCAL,0}, {SEND,0}, {RECV,7},
    {LOCAL,0}, {RECV,5},  {SEND,0}, {RECV,12},
};
#define N (sizeof(log_)/sizeof(log_[0]))

void replay(int *clock, LogEntry *log, int n) {
//@TODO 1 | Itera el log aplicando Lamport e imprime "evento N: C=valor"
//? Fíjate que LOCAL, SEND y RECV terminan igual. ¿Qué tiene de especial RECV?
//- for (i = 0; i < n; i++).
//- Si es RECV: si ts_recv > *clock, entonces *clock = ts_recv (el max).
//- Siempre: *clock = *clock + 1 (clock es un puntero: *clock es el número).
//- printf("evento %d: C=%d\n", i + 1, *clock).
    for (int i = 0; i < n; i++) { //: recorro las n entradas del log, en orden
        if (log[i].type == RECV) { //§ //: ¿esta entrada es una recepción?
            if (log[i].ts_recv > *clock) { //§ //: ¿el ts que llegó es mayor que mi reloj?
                *clock = log[i].ts_recv; //§ //: entonces mi reloj salta a ese valor (el max)
            }
        }
        *clock = *clock + 1; //§ //: todo evento suma 1 (*clock es el número, clock es su dirección)
        printf("evento %d: C=%d\n", i + 1, *clock); //§ //: muestro el reloj después del evento i+1
    }
//@END
}

int main(void) {
    int clock = 0;
    replay(&clock, log_, N);
    return 0;
}
