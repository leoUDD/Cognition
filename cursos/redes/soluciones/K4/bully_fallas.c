/* bully_fallas.c — Bully con aptitud cuando un dron se cae DURANTE la elección
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
int cae_tras_ok = -1;           /* índice del dron que se desconecta justo después de responder OK (-1 = nadie) */

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
    nodos[yo].participo = 1;
    nodos[yo].recibio_ok = 0;
    printf("%s inicia elección (aptitud %.1f)\n", nodos[yo].nombre, nodos[yo].aptitud);
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
        if (yo == cae_tras_ok) {               /* falla inyectada: se cae antes de seguir */
            nodos[yo].vivo = 0;
            printf("  *** %s se desconecta en plena elección ***\n", nodos[yo].nombre);
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
        nodos[yo].lider = nodos[m.origen].id;
        printf("%s reconoce a %s como líder\n", nodos[yo].nombre, nodos[m.origen].nombre);
    }
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

/* Timeout de COORDINATOR: se llama cuando ya pasó el tiempo de espera del anuncio. */
void esperar_coordinador(int yo) {
//@TODO 1 | Recibí OK pero el COORDINATOR nunca llegó: reiniciar la elección
//? Alguien más apto te respondió OK, pero nunca se anunció como líder. ¿Qué le pasó y qué haces tú?
//- Si recibio_ok == 1 y lider sigue siendo LIDER_CAIDO: el que respondió OK se cayó.
//- Imprime que venció el timeout y llama a iniciar_eleccion(yo): los caídos no responderán.
    if (nodos[yo].recibio_ok == 1) { //§ //: alguien más apto me respondió OK…
        if (nodos[yo].lider == LIDER_CAIDO) { //§ //: …pero nunca llegó el COORDINATOR
            printf("%s: venció el timeout esperando COORDINATOR, reinicia la elección\n", nodos[yo].nombre); //: el más apto se cayó a mitad de camino
            iniciar_eleccion(yo); //§ //: vuelvo a preguntar; los caídos no responden y termino ganando yo (o el siguiente más apto)
        }
    }
//@END
}

void mostrar_resultado(void) {
    for (int i = 0; i < N; i++) {
        if (nodos[i].vivo == 1) {
            printf("  %s reconoce como líder a C%d\n", nodos[i].nombre, nodos[i].lider);
        }
    }
}

int main(void) {
    printf("=== Escenario A: C5 se cae justo después de responder OK ===\n");
    cargar_enjambre();
    cae_tras_ok = 4;                       /* C5 */
    iniciar_eleccion(0);                   /* C1 detectó la caída de C3 */
    esperar_coordinador(0);                /* pasó el tiempo de espera del anuncio */
    mostrar_resultado();

    printf("\n=== Escenario B: C2 se desconecta durante la elección ===\n");
    cargar_enjambre();
    cae_tras_ok = -1;
    nodos[1].vivo = 0;                     /* C2 se cae */
    printf("  *** C2 se desconecta en plena elección ***\n");
    iniciar_eleccion(0);
    esperar_coordinador(0);
    mostrar_resultado();
    return 0;
}
