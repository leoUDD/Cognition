/* bully.c — elección de líder con Bully adaptado a la aptitud (Control 3, pregunta 2)
   Algoritmo elegido: BULLY. La prioridad de cada dron es su aptitud F (pregunta 1): gana el más apto vivo.
   Cada dron es su posición en el arreglo: nodos[0] = C1, nodos[1] = C2, …
   Simulación simple: enviar() entrega el mensaje de inmediato llamando a procesar(). */
//@PASO 1. Bibliotecas | Solo vas a imprimir con printf: ¿qué biblioteca necesitas?
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

//@PASO 5. Variables globales y prototipo | Todas las funciones usan el arreglo de drones. ¿Por qué hay que declarar procesar() antes de escribirla?
Nodo nodos[N]; //: un Nodo por dron: nodos[0] es C1
int enviados[3];                                   /* cuántos mensajes de cada tipo */
const char *TIPO[] = { "ELECTION", "OK", "COORDINATOR" }; //: nombres para imprimir: TIPO[OK] vale "OK"

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

//@PASO 10. iniciar_eleccion() — TODO 1
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

//@PASO 11. procesar() — TODO 2
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

//@PASO 13. cargar_enjambre() | Copia la tabla a nodos[], calcula las aptitudes con tu función y deja los contadores en 0.
void cargar_enjambre(void) { //: deja todo como al inicio
    for (int i = 0; i < N; i++) { //: para cada dron…
        nodos[i] = INICIAL[i]; //: …copio su fila (un struct se copia entero con =)
    }
    calcular_todas(); //: la prioridad de cada dron = su aptitud F
    for (int t = 0; t < 3; t++) { //: los 3 contadores de mensajes…
        enviados[t] = 0; //: …parten en 0
    }
}

//@PASO 14. main() | Muestra las aptitudes (la conexión con la pregunta 1). C1 detecta la caída: ¿qué función llama? Después, ¿cómo muestras que todos reconocen al nuevo líder?
int main(void) {
    cargar_enjambre(); //: cargo los datos y calculo las aptitudes
    printf("Aptitudes (prioridad en la elección):\n"); //: título
    for (int i = 0; i < N; i++) { //: para cada dron…
        if (nodos[i].estado == OPERATIVO) { //: …operativo…
            printf("  C%d  F = %.1f\n", nodos[i].id, nodos[i].aptitud); //: …muestro su F
        }
    }
    printf("\nC1 declara a C3 inoperativo e inicia la elección\n"); //: C1 detectó la caída (heartbeat)
    iniciar_eleccion(0);                  /* C1 = posición 0 */
    printf("\nResultado:\n"); //: después de la elección, muestro el resultado
    for (int i = 0; i < N; i++) { //: recorro todos los drones…
        if (nodos[i].estado == OPERATIVO) { //: …solo los operativos…
            int l = nodos[i].lider; //: posición del líder que reconoce
            printf("C%d reconoce como líder a C%d\n", nodos[i].id, nodos[l].id); //: …dicen a quién reconocen
        }
    }
    printf("Mensajes: %d ELECTION, %d OK, %d COORDINATOR\n", enviados[ELECTION], enviados[OK], enviados[COORDINATOR]); //: resumen de mensajes enviados
    return 0;
}
