/* bully.c — elección de líder con Bully adaptado a la aptitud (Control 3, pregunta 2)
   Prioridad de cada dron = su aptitud F (mayor gana; empate: gana el id menor).
   Simulación: los mensajes van a una cola y se procesan en orden (red sin pérdidas entre vivos). */
#include <stdio.h>

#define N 6               /* drones C1..C6 (índices 0..5) */
#define MAX_MSGS 100

/* Tipos de mensaje de Bully */
#define ELECTION    0     /* "estoy haciendo una elección: ¿hay alguien con más prioridad?" */
#define OK          1     /* "sí, yo tengo más prioridad: yo sigo con la elección" */
#define COORDINATOR 2     /* "gané: soy el nuevo líder" */

typedef struct {
    int id;              /* 1..6 */
    char nombre[4];      /* "C1".."C6" */
    float aptitud;       /* prioridad en la elección */
    int vivo;            /* 1 = operativo, 0 = caído */
    int lider;           /* id del líder que este dron reconoce (0 = ninguno) */
    int en_eleccion;     /* 1 = inició o sigue una elección */
    int recibio_ok;      /* 1 = alguien con más prioridad le respondió OK */
} Nodo;

typedef struct {
    int tipo;            /* ELECTION, OK o COORDINATOR */
    int origen;          /* índice del que envía */
    int destino;         /* índice del que recibe */
} Msg;

Nodo nodos[N];
Msg cola[MAX_MSGS];          /* cola FIFO de mensajes en tránsito */
int ini = 0, fin = 0;        /* se saca de ini, se agrega en fin */
int enviados[3] = {0, 0, 0}; /* cuántos mensajes de cada tipo se enviaron */
const char *TIPO[] = { "ELECTION", "OK", "COORDINATOR" };

/* Envía un mensaje: si el destino está caído, se pierde (nadie lo recibe). */
void enviar(int tipo, int origen, int destino) {
    enviados[tipo] = enviados[tipo] + 1;
    if (nodos[destino].vivo == 0) {
        printf("  %s -> %s : %s (perdido: %s está caído)\n", nodos[origen].nombre, nodos[destino].nombre, TIPO[tipo], nodos[destino].nombre);
        return;
    }
    printf("  %s -> %s : %s\n", nodos[origen].nombre, nodos[destino].nombre, TIPO[tipo]);
    cola[fin].tipo = tipo;
    cola[fin].origen = origen;
    cola[fin].destino = destino;
    fin = fin + 1;
}

/* ¿El nodo a tiene MÁS prioridad que b? */
int mas_prioridad(int a, int b) {
//@TODO 1 | Comparar prioridades: aptitud y desempate por id
//? Bully original usa el ID. Aquí usamos la aptitud. ¿Qué pasa si dos drones tienen la misma aptitud?
//- Si aptitud de a > aptitud de b → return 1.
//- Si son iguales y el id de a es menor → return 1 (desempate determinista).
//- En otro caso → return 0.
    if (nodos[a].aptitud > nodos[b].aptitud) { //§ //: a es más apto
        return 1; //§
    }
    if (nodos[a].aptitud == nodos[b].aptitud) { //§ //: empate de aptitud…
        if (nodos[a].id < nodos[b].id) { //§ //: …gana el id menor (todos deciden igual)
            return 1; //§
        }
    }
    return 0; //§ //: b tiene igual o más prioridad
//@END
}

/* El nodo yo inicia (o se suma a) la elección. */
void iniciar_eleccion(int yo) {
//@TODO 2 | Iniciar la elección: ELECTION a todos los de MAYOR prioridad
//? En Bully solo se pregunta "hacia arriba". ¿A quiénes le mandas ELECTION? (Ojo: el que inicia no sabe quién está vivo).
//- en_eleccion = 1 y recibio_ok = 0.
//- Para cada j ≠ yo: si mas_prioridad(j, yo) → enviar(ELECTION, yo, j).
    nodos[yo].en_eleccion = 1; //§ //: participo en la elección
    nodos[yo].recibio_ok = 0; //§ //: todavía nadie me ha respondido
    printf("%s inicia elección (aptitud %.1f)\n", nodos[yo].nombre, nodos[yo].aptitud);
    for (int j = 0; j < N; j++) { //: reviso a cada dron
        if (j != yo) { //: menos a mí
            if (mas_prioridad(j, yo)) { //§ //: solo a los que tienen MÁS prioridad que yo
                enviar(ELECTION, yo, j); //§ //: "¿hay alguien más apto?" (si está caído, se pierde)
            }
        }
    }
//@END
}

/* yo ganó: se proclama líder y avisa a todos. */
void anunciar(int yo) {
    nodos[yo].lider = nodos[yo].id;
    nodos[yo].en_eleccion = 0;
    printf("%s no recibió OK: se proclama líder\n", nodos[yo].nombre);
    for (int j = 0; j < N; j++) {
        if (j != yo) {
            enviar(COORDINATOR, yo, j);
        }
    }
}

/* Procesa UN mensaje que llegó a su destino. */
void procesar(Msg m) {
//@TODO 3 | Reaccionar a ELECTION, OK y COORDINATOR
//? Te llega un ELECTION de alguien con menos prioridad. ¿Qué le respondes y qué haces tú después?
//- ELECTION: responde OK al origen. Si no estabas en elección, inicia la tuya (iniciar_eleccion).
//- OK: recibio_ok = 1 (alguien más apto seguirá; ahora esperas el COORDINATOR).
//- COORDINATOR: lider = id del origen, en_eleccion = 0 e imprime que lo reconoces.
    int yo = m.destino; //: el que recibe
    if (m.tipo == ELECTION) { //§ //: alguien menos apto pregunta
        enviar(OK, yo, m.origen); //§ //: "tranquilo, yo sigo"
        if (nodos[yo].en_eleccion == 0) { //§ //: si no estaba en elección…
            iniciar_eleccion(yo); //§ //: …ahora pregunto yo hacia arriba
        }
    }
    if (m.tipo == OK) { //§ //: alguien más apto respondió
        nodos[yo].recibio_ok = 1; //§ //: ya no puedo ganar: espero el COORDINATOR
    }
    if (m.tipo == COORDINATOR) { //§ //: llegó el anuncio del ganador
        nodos[yo].lider = nodos[m.origen].id; //§ //: reconozco al nuevo líder
        nodos[yo].en_eleccion = 0; //§ //: la elección terminó para mí
        printf("%s reconoce a %s como líder\n", nodos[yo].nombre, nodos[m.origen].nombre);
    }
//@END
}

/* Corre la simulación hasta que no quede nada por hacer. */
void ejecutar(void) {
    int hubo_cambios = 1;
    int rondas = 0;                             /* límite de seguridad: evita un bucle infinito si algo falla */
    while (hubo_cambios == 1 && rondas < 50) {
        hubo_cambios = 0;
        rondas = rondas + 1;
        while (ini < fin) {                     /* 1) entregar todos los mensajes en tránsito */
            Msg m = cola[ini];
            ini = ini + 1;
            if (nodos[m.destino].vivo == 1) {
                procesar(m);
            }
            hubo_cambios = 1;
        }
//@TODO 4 | Timeout de OK: quien está en elección y nadie le respondió, gana
//? Ya no quedan mensajes en tránsito. Si sigues en elección y nadie más apto te respondió, ¿qué significa?
//- Para cada nodo vivo con en_eleccion == 1 y recibio_ok == 0 → anunciar(i) y hubo_cambios = 1.
        for (int i = 0; i < N; i++) { //: reviso a cada dron
            if (nodos[i].vivo == 1) { //: solo los vivos
                if (nodos[i].en_eleccion == 1) { //§ //: sigue en elección…
                    if (nodos[i].recibio_ok == 0) { //§ //: …y nadie más apto respondió (venció el timeout)
                        anunciar(i); //§ //: entonces es el más apto vivo: gana
                        hubo_cambios = 1; //§ //: hay COORDINATOR nuevos que entregar
                    }
                }
            }
        }
//@END
    }
}

void cargar_enjambre(void) {
    /* Aptitudes calculadas con la función del ejercicio K1 */
    const char *nom[N] = { "C1", "C2", "C3", "C4", "C5", "C6" };
    float apt[N] = { 75.0, 70.5, 0, 60.9, 80.6, 58.3 };
    for (int i = 0; i < N; i++) {
        nodos[i].id = i + 1;
        nodos[i].nombre[0] = nom[i][0];
        nodos[i].nombre[1] = nom[i][1];
        nodos[i].nombre[2] = '\0';
        nodos[i].aptitud = apt[i];
        nodos[i].vivo = 1;
        nodos[i].lider = 3;          /* todos reconocían a C3 */
        nodos[i].en_eleccion = 0;
        nodos[i].recibio_ok = 0;
    }
    nodos[2].vivo = 0;               /* C3 cayó */
    nodos[2].aptitud = -1;
}

int main(void) {
    cargar_enjambre();
    printf("[03:12:19] C1 declara a C3 inoperativo\n");
    iniciar_eleccion(0);             /* C1 detectó la caída */
    ejecutar();
    printf("\nResultado:\n");
    for (int i = 0; i < N; i++) {
        if (nodos[i].vivo == 1) {
            printf("%s reconoce como líder a C%d\n", nodos[i].nombre, nodos[i].lider);
        }
    }
    printf("Mensajes: %d ELECTION, %d OK, %d COORDINATOR\n", enviados[ELECTION], enviados[OK], enviados[COORDINATOR]);
    return 0;
}
