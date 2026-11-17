/* bully_fallas.c — Bully con aptitud cuando un dron se cae DURANTE la elección
   Cada dron es su posición en el arreglo: nodos[0] = C1, nodos[1] = C2, …
   Prioridad = aptitud (gana el más apto vivo).
   Simulación simple: enviar() entrega el mensaje de inmediato llamando a procesar(). */
//@PASO 1. Bibliotecas | Igual que en Cert. 3: ¿qué biblioteca necesitas?
#include <stdio.h>

//@PASO 2. Constantes | Las mismas del Cert. 3: N, el líder caído y los 3 tipos de mensaje.
#define N 6               /* drones C1..C6 = posiciones 0..5 */
#define LIDER_CAIDO 2     /* C3 (posición 2) era el líder */

/* Tipos de mensaje de Bully */
#define ELECTION    0     /* "¿hay alguien más apto que yo?" */
#define OK          1     /* "sí, yo soy más apto: yo sigo" */
#define COORDINATOR 2     /* "gané: soy el nuevo líder" */

//@PASO 3. Estructura del dron (Nodo) | La misma del Cert. 3. ¿Qué campo te sirve para saber que alguien más apto te respondió?
typedef struct {
    float aptitud;       /* prioridad en la elección */
    int vivo;            /* 1 = operativo, 0 = caído */
    int lider;           /* posición del líder que reconoce */
    int participo;       /* 1 = ya inició su elección */
    int recibio_ok;      /* 1 = alguien más apto le respondió OK */
} Nodo;

//@PASO 4. Estructura del mensaje (Msg) | Tipo, origen y destino.
typedef struct {
    int tipo;            /* ELECTION, OK o COORDINATOR */
    int origen;          /* quién envía */
    int destino;         /* quién recibe */
} Msg;

//@PASO 5. Variables globales | Igual que Cert. 3, más una variable nueva para SIMULAR la falla: ¿qué dron se cae a mitad de la elección?
Nodo nodos[N];
int enviados[3];                                   /* cuántos mensajes de cada tipo */
const char *TIPO[] = { "ELECTION", "OK", "COORDINATOR" };
int cae_tras_ok = -1;                              /* dron que se cae justo después de responder OK (-1 = nadie) */ //: -1 = nadie; si vale 4, C5 se cae justo después de responder OK

void procesar(Msg m);    /* prototipo: enviar() la usa antes de que esté escrita */

//@PASO 6. enviar() | Igual que en Cert. 3: un mensaje a un caído se pierde.
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

//@PASO 7. anunciar() | Igual que en Cert. 3.
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

//@PASO 8. iniciar_eleccion() | Igual que el TODO 1 del Cert. 3: ELECTION a los más aptos; si nadie responde OK, gano.
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

//@PASO 9. procesar() | Igual que el TODO 2 del Cert. 3, pero con la falla inyectada: el dron responde OK y se cae antes de seguir. ¿Qué pasa con su elección?
void procesar(Msg m) {
    int yo = m.destino;
    if (m.tipo == ELECTION) {
        enviar(OK, yo, m.origen);
        if (yo == cae_tras_ok) {           /* falla inyectada: se cae antes de seguir */ //: ¿yo soy el dron que debe caerse ahora?
            nodos[yo].vivo = 0; //: me caigo: ya no recibo mensajes
            printf("  *** C%d se desconecta en plena elección ***\n", yo + 1); //: aviso en pantalla
            return; //: salgo SIN iniciar mi elección: nunca enviaré COORDINATOR
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

//@PASO 10. Datos del enjambre | La misma tabla del Cert. 3.
/* Datos del enjambre: aptitud (Cert. 1), vivo, líder, participo, recibio_ok */
const Nodo INICIAL[N] = {
    { 71.7, 1, LIDER_CAIDO, 0, 0 },   /* C1 */
    { 65.7, 1, LIDER_CAIDO, 0, 0 },   /* C2 */
    { -1,   0, LIDER_CAIDO, 0, 0 },   /* C3: caído */
    { 60.9, 1, LIDER_CAIDO, 0, 0 },   /* C4 */
    { 74.6, 1, LIDER_CAIDO, 0, 0 },   /* C5 */
    { 56.1, 1, LIDER_CAIDO, 0, 0 }    /* C6 */
};

//@PASO 11. cargar_enjambre() | Deja todo como al inicio. Aquí importa: main corre DOS escenarios y cada uno parte limpio.
void cargar_enjambre(void) {
    for (int i = 0; i < N; i++) {
        nodos[i] = INICIAL[i];
    }
    for (int t = 0; t < 3; t++) {
        enviados[t] = 0;
    }
}

//@PASO 12. esperar_coordinador() — TODO 1
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

//@PASO 13. mostrar_resultado() | ¿Cómo muestras a quién reconoce cada dron vivo?
void mostrar_resultado(void) {
    for (int i = 0; i < N; i++) {
        if (nodos[i].vivo == 1) {
            printf("  C%d reconoce como líder a C%d\n", i + 1, nodos[i].lider + 1);
        }
    }
}

//@PASO 14. main() | Dos escenarios. En cada uno: cargar, provocar la falla, iniciar la elección, esperar el anuncio y mostrar.
int main(void) {
    printf("=== Escenario A: C5 se cae justo después de responder OK ===\n");
    cargar_enjambre(); //: parto con los datos limpios
    cae_tras_ok = 4;                       /* C5 = posición 4 */ //: C5 (posición 4) se caerá tras responder OK
    iniciar_eleccion(0);                   /* C1 detectó la caída de C3 */ //: C1 detectó la caída de C3
    esperar_coordinador(0);                /* pasó el tiempo de espera del anuncio */ //: pasó el tiempo de espera del anuncio
    mostrar_resultado(); //: C1 debería reconocer a… ¿quién?

    printf("\n=== Escenario B: C2 se desconecta durante la elección ===\n");
    cargar_enjambre(); //: de nuevo datos limpios
    cae_tras_ok = -1; //: esta vez nadie se cae tras el OK…
    nodos[1].vivo = 0;                     /* C2 = posición 1 */ //: …pero C2 (posición 1) ya está caído desde el inicio
    iniciar_eleccion(0);
    esperar_coordinador(0);
    mostrar_resultado();
    return 0;
}
