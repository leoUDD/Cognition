/* bully_fallas.c — Bully con aptitud cuando un dron se cae DURANTE la elección
   Algoritmo elegido: BULLY. La prioridad de cada dron es su aptitud F (pregunta 1): gana el más apto vivo.
   Cada dron es su posición en el arreglo: nodos[0] = C1, nodos[1] = C2, …
   Simulación simple: enviar() entrega el mensaje de inmediato llamando a procesar(). */
//@PASO 1. Bibliotecas | Igual que en Cert. 3: ¿qué biblioteca necesitas?
#include <stdio.h>

//@PASO 2. Constantes | ¿Cuántos drones hay, cuál era el líder, qué estados puede tener un dron, qué tipos de mensaje tiene Bully y cuánto pesa cada criterio de la aptitud? Dales nombre con #define.
#define N 6               /* drones C1..C6 = posiciones 0..5 */
#define LIDER_CAIDO 2     /* C3 (posición 2) era el líder */

/* Estados de un dron */
#define INOPERATIVO 0
#define OPERATIVO   1

/* Tipos de mensaje de Bully */
#define ELECTION    0     /* "¿hay alguien más apto que yo?" */
#define OK          1     /* "sí, yo soy más apto: yo sigo" */
#define COORDINATOR 2     /* "gané: soy el nuevo líder" */

/* Pesos de la función de aptitud (pregunta 1, suman 1.0) */
#define W_BAT  0.40       /* batería: el líder coordina por horas */
#define W_DIST 0.25       /* cercanía al perímetro: reacciona antes */
#define W_VIS  0.35       /* visibilidad: su cámara alimenta el terminal central */

//@PASO 3. Estructura del dron (Nodo) | ¿Qué datos del enunciado tiene cada dron (id, batería, distancia, visibilidad, estado) y qué más necesita durante la elección? Su aptitud, a quién reconoce como líder, si ya preguntó y si alguien le respondió OK.
typedef struct {
    int id;              /* 1..6 → C1..C6 */
    float bateria;       /* 0 – 100 % */
    float distancia;     /* km al perímetro (MENOR es mejor) */
    float visibilidad;   /* 0 – 100 */
    int estado;          /* OPERATIVO o INOPERATIVO */
    float aptitud;       /* prioridad en la elección: F de la pregunta 1 */
    int lider;           /* posición del líder que reconoce */
    int participo;       /* 1 = ya inició su elección */
    int recibio_ok;      /* 1 = alguien más apto le respondió OK */
} Nodo;

//@PASO 4. Estructura del mensaje (Msg) | ¿Qué lleva todo mensaje? Qué tipo es, quién lo manda y a quién va.
typedef struct {
    int tipo;            /* ELECTION, OK o COORDINATOR */
    int origen;          /* posición de quien envía */
    int destino;         /* posición de quien recibe */
} Msg;

//@PASO 5. Variables globales y prototipo | Igual que en Cert. 3, más una variable nueva para SIMULAR la falla: ¿qué dron se cae a mitad de la elección?
Nodo nodos[N]; //: un Nodo por dron: nodos[0] es C1
int enviados[3];                                   /* cuántos mensajes de cada tipo */
const char *TIPO[] = { "ELECTION", "OK", "COORDINATOR" }; //: nombres para imprimir: TIPO[OK] vale "OK"
int cae_tras_ok = -1; //: dron que se cae justo después de responder OK (-1 = nadie)

void procesar(Msg m);    /* prototipo: enviar() la usa antes de que esté escrita */

//@PASO 6. calcular_aptitud() | Es la MISMA función de la pregunta 1: así la elección usa tu fórmula como prioridad. ¿Cómo dejas los 3 criterios en escala 0–1, con la distancia invertida?
float calcular_aptitud(Nodo d, float dmax) { //: solo lee el dron y retorna su F (por eso va sin *)
    float bat = d.bateria / 100; //: batería a escala 0–1 (más es mejor)
    float vis = d.visibilidad / 100; //: visibilidad a escala 0–1 (más es mejor)
    float cerca = 1 - d.distancia / dmax; //: INVERSA: el más lejano da 0
    return 100 * (W_BAT * bat + W_DIST * cerca + W_VIS * vis); //: suma con pesos, en escala 0–100
}

//@PASO 7. calcular_todas() | Igual que el TODO 2 de la pregunta 1: busca dmax solo entre los operativos y calcula la aptitud de cada dron. ¿Qué aptitud le das a C3, que está caído?
void calcular_todas(void) {
    float dmax = 0; //: la mayor distancia vista hasta ahora
    for (int i = 0; i < N; i++) { //: busco la distancia máxima…
        if (nodos[i].estado == OPERATIVO) { //: …solo entre los operativos
            if (nodos[i].distancia > dmax) { //: ¿más lejos que el máximo?
                dmax = nodos[i].distancia; //: es el nuevo máximo
            }
        }
    }
    for (int i = 0; i < N; i++) { //: ahora calculo cada aptitud
        if (nodos[i].estado == OPERATIVO) { //: si está operativo…
            nodos[i].aptitud = calcular_aptitud(nodos[i], dmax); //: …su F de la pregunta 1
        } else {
            nodos[i].aptitud = -1; //: un dron caído nunca es el más apto
        }
    }
}

//@PASO 8. enviar() | Un mensaje a un dron caído se pierde. Si el destino está operativo, ¿qué función lo recibe?
/* Envía un mensaje. Si el destino está caído, se pierde. Si no, le llega de inmediato. */
void enviar(int tipo, int origen, int destino) { //: qué tipo es, quién envía y a quién
    Msg m; //: armo el mensaje…
    m.tipo = tipo; //: …con su tipo…
    m.origen = origen; //: …quién lo envía…
    m.destino = destino; //: …y a quién va
    enviados[tipo] = enviados[tipo] + 1; //: cuento el mensaje (solo para el resumen final)
    if (nodos[destino].estado == INOPERATIVO) { //: ¿el destino está caído?
        printf("  C%d -> C%d : %s (perdido: está caído)\n", nodos[origen].id, nodos[destino].id, TIPO[tipo]); //: muestro que se perdió
        return; //: nadie lo recibe: salgo de la función
    }
    printf("  C%d -> C%d : %s\n", nodos[origen].id, nodos[destino].id, TIPO[tipo]); //: muestro el mensaje, ej. "C1 -> C5 : ELECTION"
    procesar(m); //: le llega al destino de inmediato
}

//@PASO 9. anunciar() | El ganador: ¿qué anota en sí mismo y a quiénes les avisa?
/* yo ganó: se proclama líder y avisa a todos. */
void anunciar(int yo) { //: yo = el ganador
    nodos[yo].lider = yo; //: me reconozco a mí mismo como líder
    printf("C%d no recibió OK: se proclama líder\n", nodos[yo].id); //: aviso en pantalla
    for (int j = 0; j < N; j++) { //: recorro a todos…
        if (j != yo) { //: …menos a mí…
            enviar(COORDINATOR, yo, j); //: …y les digo "soy el nuevo líder"
        }
    }
}

//@PASO 10. iniciar_eleccion() | Igual que el TODO 1 del Cert. 3: ELECTION a los más aptos; si nadie responde OK, gano.
void iniciar_eleccion(int yo) {
    nodos[yo].participo = 1; //: ya inicié mi elección
    nodos[yo].recibio_ok = 0; //: todavía nadie me respondió
    for (int j = 0; j < N; j++) { //: reviso a cada dron
        if (j != yo) { //: menos a mí
            if (nodos[j].aptitud > nodos[yo].aptitud) { //: solo a los MÁS aptos que yo
                enviar(ELECTION, yo, j); //: "¿hay alguien más apto?" (si está caído, se pierde)
            }
        }
    }
    if (nodos[yo].recibio_ok == 0) { //: nadie más apto respondió…
        anunciar(yo); //: …entonces soy el más apto vivo: gano
    }
}

//@PASO 11. procesar() | Igual que el TODO 2 del Cert. 3, pero con la falla inyectada: el dron responde OK y se cae antes de seguir. ¿Qué pasa con su elección?
void procesar(Msg m) {
    int yo = m.destino; //: el que recibe
    if (m.tipo == ELECTION) { //: alguien menos apto pregunta
        enviar(OK, yo, m.origen); //: "tranquilo, yo sigo"
        if (yo == cae_tras_ok) { //: ¿yo soy el dron que debe caerse ahora?
            nodos[yo].estado = INOPERATIVO; //: me caigo: ya no recibo mensajes
            printf("  *** C%d se desconecta en plena elección ***\n", nodos[yo].id); //: aviso en pantalla
            return; //: salgo SIN iniciar mi elección: nunca enviaré COORDINATOR
        }
        if (nodos[yo].participo == 0) { //: si todavía no hice mi elección…
            iniciar_eleccion(yo); //: …ahora pregunto yo hacia arriba
        }
    }
    if (m.tipo == OK) { //: alguien más apto respondió
        nodos[yo].recibio_ok = 1; //: ya no puedo ganar: espero el COORDINATOR
    }
    if (m.tipo == COORDINATOR) { //: llegó el anuncio del ganador
        nodos[yo].lider = m.origen; //: reconozco al nuevo líder
    }
}

//@PASO 12. Datos del enjambre | Una fila por dron con los datos de la tabla del enunciado, en el orden del struct. La aptitud parte en 0 porque se calcula después.
/* id, batería, distancia, visibilidad, estado, aptitud, líder, participo, recibio_ok */
const Nodo INICIAL[N] = { //: tabla del enunciado
    { 1, 78, 1.2, 85, OPERATIVO,   0, LIDER_CAIDO, 0, 0 },   /* C1 */
    { 2, 45, 0.8, 92, OPERATIVO,   0, LIDER_CAIDO, 0, 0 },   /* C2 */
    { 3,  0, 0.0,  0, INOPERATIVO, 0, LIDER_CAIDO, 0, 0 },   /* C3: el líder caído */
    { 4, 91, 2.1, 70, OPERATIVO,   0, LIDER_CAIDO, 0, 0 },   /* C4 */
    { 5, 62, 0.5, 88, OPERATIVO,   0, LIDER_CAIDO, 0, 0 },   /* C5 */
    { 6, 83, 1.5, 45, OPERATIVO,   0, LIDER_CAIDO, 0, 0 }    /* C6 */
};

//@PASO 13. cargar_enjambre() | Deja todo como al inicio. Aquí importa: main corre DOS escenarios y cada uno parte limpio.
void cargar_enjambre(void) { //: deja todo como al inicio
    for (int i = 0; i < N; i++) { //: para cada dron…
        nodos[i] = INICIAL[i]; //: …copio su fila (un struct se copia entero con =)
    }
    calcular_todas(); //: la prioridad de cada dron = su aptitud F
    for (int t = 0; t < 3; t++) { //: los 3 contadores de mensajes…
        enviados[t] = 0; //: …parten en 0
    }
}

//@PASO 14. esperar_coordinador() — TODO 1
/* Timeout de COORDINATOR: se llama cuando ya pasó el tiempo de espera del anuncio. */
void esperar_coordinador(int yo) {
//@TODO 1 | Recibí OK pero el COORDINATOR nunca llegó: reiniciar la elección
//? Alguien más apto te respondió OK, pero nunca se anunció como líder. ¿Qué le pasó y qué haces tú?
//- Si recibio_ok == 1 y lider sigue siendo LIDER_CAIDO: el que respondió OK se cayó.
//- Llama de nuevo a iniciar_eleccion(yo): los caídos no responderán.
    if (nodos[yo].recibio_ok == 1) { //§ //: alguien más apto me respondió OK…
        if (nodos[yo].lider == LIDER_CAIDO) { //§ //: …pero nunca llegó el COORDINATOR
            printf("C%d: venció el timeout esperando COORDINATOR, reinicia\n", nodos[yo].id); //: el más apto se cayó a mitad de camino
            iniciar_eleccion(yo); //§ //: vuelvo a preguntar; los caídos no responden
        }
    }
//@END
}

//@PASO 15. mostrar_resultado() | ¿Cómo muestras a quién reconoce cada dron operativo?
void mostrar_resultado(void) {
    for (int i = 0; i < N; i++) { //: recorro todos los drones…
        if (nodos[i].estado == OPERATIVO) { //: …solo los operativos…
            int l = nodos[i].lider; //: posición del líder que reconoce
            printf("  C%d reconoce como líder a C%d\n", nodos[i].id, nodos[l].id); //: …dicen a quién reconocen
        }
    }
}

//@PASO 16. main() | Dos escenarios. En cada uno: cargar, provocar la falla, iniciar la elección, esperar el anuncio y mostrar.
int main(void) {
    printf("=== Escenario A: C5 se cae justo después de responder OK ===\n");
    cargar_enjambre(); //: parto con los datos limpios
    cae_tras_ok = 4;                       /* C5 = posición 4 */
    iniciar_eleccion(0);                   /* C1 detectó la caída de C3 */
    esperar_coordinador(0);                /* pasó el tiempo de espera del anuncio */
    mostrar_resultado(); //: C1 debería reconocer a… ¿quién?

    printf("\n=== Escenario B: C2 se desconecta durante la elección ===\n");
    cargar_enjambre(); //: de nuevo datos limpios
    cae_tras_ok = -1; //: esta vez nadie se cae tras el OK…
    nodos[1].estado = INOPERATIVO;         /* …pero C2 (posición 1) se desconecta */
    iniciar_eleccion(0);
    esperar_coordinador(0);
    mostrar_resultado();
    return 0;
}
