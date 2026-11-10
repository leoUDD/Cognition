/* Prueba del Ej. 9: tu servidor y tu cliente hablan por un socketpair */
#include <stdio.h>
#include <stdlib.h>
#include <sys/wait.h>
#include "../server_lamport.c"
#define CHECK(c, msg) printf((c) ? "OK: %s\n" : "FALLA: %s\n", msg)

int main(void) {
    int sv[2];
    socketpair(AF_UNIX, SOCK_STREAM, 0, sv);
    setvbuf(stdout, NULL, _IONBF, 0);
    if (fork() == 0) { close(sv[0]); handle_client(sv[1]); exit(0); }
    close(sv[1]);
    int clock = 0;
    Msg r;
    client_send(sv[0], &clock, "hola");
    CHECK(clock == 1, "client_send incrementa el reloj del cliente (0 -> 1)");
    recv(sv[0], &r, sizeof r, 0);
    printf("   respuesta 1: ts=%d\n", r.ts);
    CHECK(r.ts == 3 || r.ts == 4, "Respuesta 1: max(0,1)+1 = 2, +1 interno = 3 (o 4 si cuentas el envío)");
    int prev = r.ts;
    clock = 99;
    client_send(sv[0], &clock, "salto");
    CHECK(clock == 100, "client_send usa el puntero: el reloj queda en 100");
    recv(sv[0], &r, sizeof r, 0);
    printf("   respuesta 2 (mensaje con ts=100): ts=%d\n", r.ts);
    CHECK(r.ts == 102 || r.ts == 103, "Recepción con ts=100: el servidor salta a max(...,100)+1 = 101 y luego avanza");
    clock = 0;
    client_send(sv[0], &clock, "viejo");
    recv(sv[0], &r, sizeof r, 0);
    printf("   respuesta 3 (mensaje con ts=1): ts=%d\n", r.ts);
    CHECK(r.ts > 102, "Un mensaje con ts pequeño NO hace retroceder el reloj del servidor (usa max)");
    (void)prev;
    close(sv[0]);
    wait(NULL);
    return 0;
}
