/* bully_fallas.c — Bully con aptitud cuando un dron se cae DURANTE la elección
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
int cae_tras_ok = -1;        /* índice del dron que se desconecta justo después de responder OK (-1 = nadie) */

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
    if (nodos[a].aptitud > nodos[b].aptitud) {
        return 1;
    }
    if (nodos[a].aptitud == nodos[b].aptitud) {
        if (nodos[a].id < nodos[b].id) {
            return 1;
        }
    }
    return 0;
}

/* El nodo yo inicia (o se suma a) la elección. */
void iniciar_eleccion(int yo) {
    nodos[yo].en_eleccion = 1;
    nodos[yo].recibio_ok = 0;
    printf("%s inicia elección (aptitud %.1f)\n", nodos[yo].nombre, nodos[yo].aptitud);
    for (int j = 0; j < N; j++) {
        if (j != yo) {
            if (mas_prioridad(j, yo)) {
                enviar(ELECTION, yo, j);
            }
        }
    }
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
    int yo = m.destino;
    if (m.tipo == ELECTION) {
        enviar(OK, yo, m.origen);
        if (yo == cae_tras_ok) {             /* falla inyectada: se cae antes de seguir */
            nodos[yo].vivo = 0;
            printf("  *** %s se desconecta en plena elección ***\n", nodos[yo].nombre);
            return;
        }
        if (nodos[yo].en_eleccion == 0) {
            iniciar_eleccion(yo);
        }
    }
    if (m.tipo == OK) {
        nodos[yo].recibio_ok = 1;
    }
    if (m.tipo == COORDINATOR) {
        nodos[yo].lider = nodos[m.origen].id;
        nodos[yo].en_eleccion = 0;
        printf("%s reconoce a %s como líder\n", nodos[yo].nombre, nodos[m.origen].nombre);
    }
}

/* Corre la simulación con DOS timeouts:
   - timeout de OK: si sigo en elección y nadie más apto respondió, gano;
   - timeout de COORDINATOR (más largo): si recibí OK pero el anuncio nunca llegó, el más apto
     se cayó a mitad de camino → reinicio la elección. */
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
        int hubo_anuncio = 0;                   /* 2) timeout de OK */
        for (int i = 0; i < N; i++) {
            if (nodos[i].vivo == 1) {
                if (nodos[i].en_eleccion == 1) {
                    if (nodos[i].recibio_ok == 0) {
                        anunciar(i);
                        hubo_anuncio = 1;
                        hubo_cambios = 1;
                    }
                }
            }
        }
        if (hubo_anuncio == 0) {                /* 3) solo si nadie se anunció (ese timeout es más largo) */
//@TODO 1 | Timeout de COORDINATOR: recibí OK pero nadie se proclamó líder
//? Recibiste OK (alguien más apto iba a seguir) y no queda nada en tránsito, pero el COORDINATOR nunca llegó. ¿Qué le pasó a ese dron y qué haces tú?
//- Para cada nodo vivo con en_eleccion == 1 y recibio_ok == 1: el que respondió OK se cayó.
//- Imprime que venció el timeout y llama a iniciar_eleccion(i) (vuelve a preguntar hacia arriba).
//- hubo_cambios = 1 para que la simulación siga.
        for (int i = 0; i < N; i++) { //: reviso a cada dron
            if (nodos[i].vivo == 1) { //: solo los vivos
                if (nodos[i].en_eleccion == 1) { //§ //: sigue en elección…
                    if (nodos[i].recibio_ok == 1) { //§ //: …recibió OK, pero el COORDINATOR nunca llegó
                        printf("%s: venció el timeout esperando COORDINATOR, reinicia la elección\n", nodos[i].nombre); //: el más apto se cayó a mitad de camino
                        iniciar_eleccion(i); //§ //: vuelvo a preguntar a los más aptos (los caídos no responderán)
                        hubo_cambios = 1; //§ //: la simulación continúa
                    }
                }
            }
        }
//@END
        }
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

void reiniciar_todo(void) {
    cargar_enjambre();
    ini = 0;
    fin = 0;
    enviados[0] = 0;
    enviados[1] = 0;
    enviados[2] = 0;
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
    reiniciar_todo();
    cae_tras_ok = 4;                 /* C5 */
    iniciar_eleccion(0);
    ejecutar();
    mostrar_resultado();

    printf("\n=== Escenario B: C2 se desconecta durante la elección ===\n");
    reiniciar_todo();
    cae_tras_ok = -1;
    iniciar_eleccion(0);
    nodos[1].vivo = 0;               /* C2 se cae apenas empieza la elección */
    printf("  *** C2 se desconecta en plena elección ***\n");
    ejecutar();
    mostrar_resultado();
    return 0;
}
