/* bully.c — elección de líder con Bully adaptado a la aptitud (Control 3, pregunta 2)
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
//@TODO 1 | ELECTION a los más aptos; si nadie responde OK, gano
//? En Bully solo se pregunta "hacia arriba". ¿A quién le mandas ELECTION? ¿Y qué significa que nadie te responda OK?
//- participo = 1 y recibio_ok = 0.
//- Para cada j ≠ yo: si nodos[j].aptitud > nodos[yo].aptitud → enviar(ELECTION, yo, j).
//- Después del for: si recibio_ok sigue en 0 → anunciar(yo).
    nodos[yo].participo = 1; //§ //: ya inicié mi elección
    nodos[yo].recibio_ok = 0; //§ //: todavía nadie me respondió
    for (int j = 0; j < N; j++) { //: reviso a cada dron
        if (j != yo) { //: menos a mí
            if (nodos[j].aptitud > nodos[yo].aptitud) { //§ //: solo a los MÁS aptos que yo
                enviar(ELECTION, yo, j); //§ //: "¿hay alguien más apto?" (si está caído, se pierde)
            }
        }
    }
    if (nodos[yo].recibio_ok == 0) { //§ //: nadie más apto respondió…
        anunciar(yo); //§ //: …entonces soy el más apto vivo: gano
    }
//@END
}

void procesar(Msg m) {
//@TODO 2 | Reaccionar a ELECTION, OK y COORDINATOR
//? Te llega un ELECTION de alguien menos apto. ¿Qué le respondes y qué haces tú después?
//- ELECTION: enviar(OK, yo, m.origen). Si no habías participado, iniciar_eleccion(yo).
//- OK: recibio_ok = 1.
//- COORDINATOR: lider = m.origen.
    int yo = m.destino; //: el que recibe
    if (m.tipo == ELECTION) { //§ //: alguien menos apto pregunta
        enviar(OK, yo, m.origen); //§ //: "tranquilo, yo sigo"
        if (nodos[yo].participo == 0) { //§ //: si todavía no hice mi elección…
            iniciar_eleccion(yo); //§ //: …ahora pregunto yo hacia arriba
        }
    }
    if (m.tipo == OK) { //§ //: alguien más apto respondió
        nodos[yo].recibio_ok = 1; //§ //: ya no puedo ganar: espero el COORDINATOR
    }
    if (m.tipo == COORDINATOR) { //§ //: llegó el anuncio del ganador
        nodos[yo].lider = m.origen; //§ //: reconozco al nuevo líder
    }
//@END
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

int main(void) {
    cargar_enjambre();
    printf("C1 declara a C3 inoperativo e inicia la elección\n");
    iniciar_eleccion(0);                  /* C1 = posición 0 */
    printf("\nResultado:\n");
    for (int i = 0; i < N; i++) {
        if (nodos[i].vivo == 1) {
            printf("C%d reconoce como líder a C%d\n", i + 1, nodos[i].lider + 1);
        }
    }
    printf("Mensajes: %d ELECTION, %d OK, %d COORDINATOR\n", enviados[ELECTION], enviados[OK], enviados[COORDINATOR]);
    return 0;
}
