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
    for (int i = 0; i < n; i++) {
        if (log[i].type == RECV && log[i].ts_recv > *clock) //§
            *clock = log[i].ts_recv; //§
        (*clock)++; //§
        printf("evento %d: C=%d\n", i + 1, *clock); //§
    }
//@END
}

int main(void) {
    int clock = 0;
    replay(&clock, log_, N);
    return 0;
}
