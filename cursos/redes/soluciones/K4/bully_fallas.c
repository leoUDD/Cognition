/* bully_fallas.c — Bully con aptitud cuando un dron se cae DURANTE la elección
   Cada dron es su posición en el arreglo: nodos[0] = C1, nodos[1] = C2, …
   Prioridad = aptitud (gana el más apto vivo).
   Simulación simple: enviar() entrega el mensaje de inmediato llamando a procesar(). */
#include <stdio.h>

#define N 6               /* drones C1..C6 = posiciones 0..5 */
#define LIDER_CAIDO 2     /* C3 (posición 2) era el líder */

/* Tipos de mensaje de Bully */
#define ELECTION    0     /* "¿hay alguien más apto que yo?" */
#define OK          1     /* "sí, yo soy más apto: yo sigo" */
#define COORDINATOR 2     /* "gané: soy el nuevo líder" */

typedef struct {
    float aptitud;       /* prioridad en la elección */
    int vivo;            /* 1 = operativo, 0 = caído */
    int lider;           /* posición del líder que reconoce */
    int participo;       /* 1 = ya inició su elección */
    int recibio_ok;      /* 1 = alguien más apto le respondió OK */
} Nodo;

typedef struct {
    int tipo;            /* ELECTION, OK o COORDINATOR */
    int origen;          /* quién envía */
    int destino;         /* quién recibe */
} Msg;

Nodo nodos[N];
int enviados[3];                                   /* cuántos mensajes de cada tipo */
const char *TIPO[] = { "ELECTION", "OK", "COORDINATOR" };
int cae_tras_ok = -1;                              /* dron que se cae justo después de responder OK (-1 = nadie) */

void procesar(Msg m);    /* prototipo: enviar() la usa antes de que esté escrita */

/* Envía un mensaje. Si el destino está caído, se pierde. Si no, le llega de inmediato. */
void enviar(int tipo, int origen, int destino) {
    Msg m;
    m.tipo = tipo;
    m.origen = origen;
    m.destino = destino;
    enviados[tipo] = enviados[tipo] + 1;
    if (nodos[destino].vivo == 0) {
        printf("  C%d -> C%d : %s (perdido: está caído)\n", origen + 1, destino + 1, TIPO[tipo]);
        return;
    }
    printf("  C%d -> C%d : %s\n", origen + 1, destino + 1, TIPO[tipo]);
    procesar(m);
}

/* yo ganó: se proclama líder y avisa a todos. */
void anunciar(int yo) {
    nodos[yo].lider = yo;
    printf("C%d no recibió OK: se proclama líder\n", yo + 1);
    for (int j = 0; j < N; j++) {
        if (j != yo) {
            enviar(COORDINATOR, yo, j);
        }
    }
}

void iniciar_eleccion(int yo) {
    nodos[yo].participo = 1;
    nodos[yo].recibio_ok = 0;
    for (int j = 0; j < N; j++) {
        if (j != yo) {
            if (nodos[j].aptitud > nodos[yo].aptitud) {
                enviar(ELECTION, yo, j);
            }
        }
    }
    if (nodos[yo].recibio_ok == 0) {
        anunciar(yo);
    }
}

void procesar(Msg m) {
    int yo = m.destino;
    if (m.tipo == ELECTION) {
        enviar(OK, yo, m.origen);
        if (yo == cae_tras_ok) {           /* falla inyectada: se cae antes de seguir */
            nodos[yo].vivo = 0;
            printf("  *** C%d se desconecta en plena elección ***\n", yo + 1);
            return;
        }
        if (nodos[yo].participo == 0) {
            iniciar_eleccion(yo);
        }
    }
    if (m.tipo == OK) {
        nodos[yo].recibio_ok = 1;
    }
    if (m.tipo == COORDINATOR) {
        nodos[yo].lider = m.origen;
    }
}

/* Datos del enjambre: aptitud (Cert. 1), vivo, líder, participo, recibio_ok */
const Nodo INICIAL[N] = {
    { 71.7, 1, LIDER_CAIDO, 0, 0 },   /* C1 */
    { 65.7, 1, LIDER_CAIDO, 0, 0 },   /* C2 */
    { -1,   0, LIDER_CAIDO, 0, 0 },   /* C3: caído */
    { 60.9, 1, LIDER_CAIDO, 0, 0 },   /* C4 */
    { 74.6, 1, LIDER_CAIDO, 0, 0 },   /* C5 */
    { 56.1, 1, LIDER_CAIDO, 0, 0 }    /* C6 */
};

void cargar_enjambre(void) {
    for (int i = 0; i < N; i++) {
        nodos[i] = INICIAL[i];
    }
    for (int t = 0; t < 3; t++) {
        enviados[t] = 0;
    }
}

/* Timeout de COORDINATOR: se llama cuando ya pasó el tiempo de espera del anuncio. */
void esperar_coordinador(int yo) {
//@TODO 1 | Recibí OK pero el COORDINATOR nunca llegó: reiniciar la elección
//? Alguien más apto te respondió OK, pero nunca se anunció como líder. ¿Qué le pasó y qué haces tú?
//- Si recibio_ok == 1 y lider sigue siendo LIDER_CAIDO: el que respondió OK se cayó.
//- Llama de nuevo a iniciar_eleccion(yo): los caídos no responderán.
    if (nodos[yo].recibio_ok == 1) { //§ //: alguien más apto me respondió OK…
        if (nodos[yo].lider == LIDER_CAIDO) { //§ //: …pero nunca llegó el COORDINATOR
            printf("C%d: venció el timeout esperando COORDINATOR, reinicia\n", yo + 1); //: el más apto se cayó a mitad de camino
            iniciar_eleccion(yo); //§ //: vuelvo a preguntar; los caídos no responden
        }
    }
//@END
}

void mostrar_resultado(void) {
    for (int i = 0; i < N; i++) {
        if (nodos[i].vivo == 1) {
            printf("  C%d reconoce como líder a C%d\n", i + 1, nodos[i].lider + 1);
        }
    }
}

int main(void) {
    printf("=== Escenario A: C5 se cae justo después de responder OK ===\n");
    cargar_enjambre();
    cae_tras_ok = 4;                       /* C5 = posición 4 */
    iniciar_eleccion(0);                   /* C1 detectó la caída de C3 */
    esperar_coordinador(0);                /* pasó el tiempo de espera del anuncio */
    mostrar_resultado();

    printf("\n=== Escenario B: C2 se desconecta durante la elección ===\n");
    cargar_enjambre();
    cae_tras_ok = -1;
    nodos[1].vivo = 0;                     /* C2 = posición 1 */
    iniciar_eleccion(0);
    esperar_coordinador(0);
    mostrar_resultado();
    return 0;
}
