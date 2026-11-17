/* bully.c — elección de líder con Bully adaptado a la aptitud (Control 3, pregunta 2)
   Prioridad de cada dron = su aptitud F (gana el más apto vivo).
   Simulación simple: enviar() entrega el mensaje de inmediato llamando a procesar(). */
#include <stdio.h>

#define N 6               /* drones C1..C6 (índices 0..5) */
#define LIDER_CAIDO 3     /* C3 era el líder */

/* Tipos de mensaje de Bully */
#define ELECTION    0     /* "¿hay alguien más apto que yo?" */
#define OK          1     /* "sí, yo soy más apto: yo sigo" */
#define COORDINATOR 2     /* "gané: soy el nuevo líder" */

typedef struct {
    int id;              /* 1..6 */
    char nombre[4];      /* "C1".."C6" */
    float aptitud;       /* prioridad en la elección */
    int vivo;            /* 1 = operativo, 0 = caído */
    int lider;           /* id del líder que reconoce */
    int participo;       /* 1 = ya inició su elección */
    int recibio_ok;      /* 1 = alguien más apto le respondió OK */
} Nodo;

typedef struct {
    int tipo;            /* ELECTION, OK o COORDINATOR */
    int origen;          /* índice del que envía */
    int destino;         /* índice del que recibe */
} Msg;

Nodo nodos[N];
int enviados[3] = {0, 0, 0};    /* cuántos mensajes de cada tipo */
const char *TIPO[] = { "ELECTION", "OK", "COORDINATOR" };

void procesar(Msg m);           /* prototipo: enviar() la usa antes de que esté escrita */

/* Envía un mensaje. Si el destino está caído, se pierde. Si no, le llega de inmediato. */
void enviar(int tipo, int origen, int destino) {
    Msg m;
    m.tipo = tipo;
    m.origen = origen;
    m.destino = destino;
    enviados[tipo] = enviados[tipo] + 1;
    if (nodos[destino].vivo == 0) {
        printf("  %s -> %s : %s (perdido: %s está caído)\n", nodos[origen].nombre, nodos[destino].nombre, TIPO[tipo], nodos[destino].nombre);
        return;
    }
    printf("  %s -> %s : %s\n", nodos[origen].nombre, nodos[destino].nombre, TIPO[tipo]);
    procesar(m);
}

/* yo ganó: se proclama líder y avisa a todos. */
void anunciar(int yo) {
    nodos[yo].lider = nodos[yo].id;
    printf("%s no recibió OK: se proclama líder\n", nodos[yo].nombre);
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
    printf("%s inicia elección (aptitud %.1f)\n", nodos[yo].nombre, nodos[yo].aptitud);
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
//- COORDINATOR: lider = id del origen e imprime que lo reconoces.
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
        nodos[yo].lider = nodos[m.origen].id; //§ //: reconozco al nuevo líder
        printf("%s reconoce a %s como líder\n", nodos[yo].nombre, nodos[m.origen].nombre);
    }
//@END
}

void cargar_enjambre(void) {
    /* Aptitudes calculadas con la función del ejercicio Cert. 1 */
    const char *nom[N] = { "C1", "C2", "C3", "C4", "C5", "C6" };
    float apt[N] = { 71.7, 65.7, -1, 60.9, 74.6, 56.1 };
    for (int i = 0; i < N; i++) {
        nodos[i].id = i + 1;
        nodos[i].nombre[0] = nom[i][0];
        nodos[i].nombre[1] = nom[i][1];
        nodos[i].nombre[2] = '\0';
        nodos[i].aptitud = apt[i];
        nodos[i].vivo = 1;
        nodos[i].lider = LIDER_CAIDO;    /* todos reconocían a C3 */
        nodos[i].participo = 0;
        nodos[i].recibio_ok = 0;
    }
    nodos[2].vivo = 0;                    /* C3 cayó */
    enviados[0] = 0;
    enviados[1] = 0;
    enviados[2] = 0;
}

int main(void) {
    cargar_enjambre();
    printf("[03:12:19] C1 declara a C3 inoperativo\n");
    iniciar_eleccion(0);                  /* C1 detectó la caída */
    printf("\nResultado:\n");
    for (int i = 0; i < N; i++) {
        if (nodos[i].vivo == 1) {
            printf("%s reconoce como líder a C%d\n", nodos[i].nombre, nodos[i].lider);
        }
    }
    printf("Mensajes: %d ELECTION, %d OK, %d COORDINATOR\n", enviados[ELECTION], enviados[OK], enviados[COORDINATOR]);
    return 0;
}
