/* aptitud.c — función de aptitud del enjambre CENTINELA (Control 3, pregunta 1) */
#include <stdio.h>

#define N_DRONES 6

/* Estados de un dron */
#define INOPERATIVO 0
#define OPERATIVO   1

/* Pesos de cada criterio (suman 1.0) */
#define W_BAT  0.40   /* batería: el líder coordina por horas y gasta más energía */
#define W_DIST 0.25   /* cercanía al perímetro: reacciona antes */
#define W_VIS  0.35   /* visibilidad: consolida el video de la cámara multiespectral */

typedef struct {
    char nombre[4];      /* "C1" … "C6" */
    float bateria;       /* 0 – 100 % */
    float distancia;     /* km al perímetro (MENOR es mejor) */
    float visibilidad;   /* 0 – 100 */
    int estado;          /* OPERATIVO o INOPERATIVO */
    float aptitud;       /* 0 – 100; -1 si está inoperativo */
} Dron;

/* Aptitud de UN dron. dmax = la mayor distancia entre los drones operativos. */
float calcular_aptitud(Dron d, float dmax) {
//@TODO 1 | Fórmula: los 3 criterios a escala 0–1 y suma con pesos
//? Batería y visibilidad: más es mejor. Distancia: MENOS es mejor. ¿Cómo la conviertes en una "cercanía" donde el más cercano saque casi 1 y el más lejano 0?
//- bat = bateria / 100 y vis = visibilidad / 100.
//- cerca = 1 - distancia / dmax (relación INVERSA: el más lejano da 0).
//- return 100 * (W_BAT * bat + W_DIST * cerca + W_VIS * vis).
    float bat = d.bateria / 100; //§ //: batería a escala 0–1 (más es mejor)
    float vis = d.visibilidad / 100; //§ //: visibilidad a escala 0–1 (más es mejor)
    float cerca = 1 - d.distancia / dmax; //§ //: INVERSA: lejos da 0, cerca da casi 1
    return 100 * (W_BAT * bat + W_DIST * cerca + W_VIS * vis); //§ //: suma con pesos, en escala 0–100
//@END
}

/* Calcula la aptitud de todos. Los inoperativos quedan con -1. */
void calcular_todas(Dron v[], int n) {
//@TODO 2 | Buscar dmax SOLO entre los operativos y calcular cada aptitud
//? ¿Por qué no hay que considerar al dron caído al buscar la distancia máxima?
//- dmax = 0; recorre los operativos y quédate con la mayor distancia.
//- Segundo recorrido: operativo → aptitud = calcular_aptitud(v[i], dmax); inoperativo → aptitud = -1.
    float dmax = 0; //: la mayor distancia vista hasta ahora
    for (int i = 0; i < n; i++) { //: busco la distancia máxima…
        if (v[i].estado == OPERATIVO) { //§ //: …solo entre los operativos (C3 no tiene datos)
            if (v[i].distancia > dmax) { //§ //: ¿más lejos que el máximo?
                dmax = v[i].distancia; //§ //: es el nuevo máximo
            }
        }
    }
    for (int i = 0; i < n; i++) { //: ahora calculo cada aptitud
        if (v[i].estado == OPERATIVO) {
            v[i].aptitud = calcular_aptitud(v[i], dmax); //§ //: aptitud con la distancia máxima ya conocida
        } else {
            v[i].aptitud = -1; //§ //: un dron caído no puede ser líder
        }
    }
//@END
}

/* Ordena de mayor a menor aptitud (burbuja). */
void ordenar(Dron v[], int n) {
//@TODO 3 | Burbuja de mayor a menor
//? Burbuja: comparas cada par de vecinos y los cambias si están al revés. Para ordenar de MAYOR a menor, ¿cuándo están al revés?
//- Dos for: i de 0 a n-1 y j de 0 a n-1-i.
//- Si v[j].aptitud < v[j+1].aptitud → intercambiar con una variable Dron tmp.
    for (int i = 0; i < n - 1; i++) { //: cada pasada deja al menor al final
        for (int j = 0; j < n - 1 - i; j++) { //: comparo cada par de vecinos
            if (v[j].aptitud < v[j + 1].aptitud) { //§ //: el de la derecha es más apto: están al revés
                Dron tmp = v[j]; //§ //: guardo el de la izquierda
                v[j] = v[j + 1]; //§ //: muevo el de la derecha a la izquierda
                v[j + 1] = tmp; //§ //: y el guardado a la derecha
            }
        }
    }
//@END
}

int main(void) {
    Dron enjambre[N_DRONES] = {
        { "C1", 78, 1.2, 85, OPERATIVO,   0 },
        { "C2", 45, 0.8, 92, OPERATIVO,   0 },
        { "C3",  0, 0.0,  0, INOPERATIVO, 0 },
        { "C4", 91, 2.1, 70, OPERATIVO,   0 },
        { "C5", 62, 0.5, 88, OPERATIVO,   0 },
        { "C6", 83, 1.5, 45, OPERATIVO,   0 }
    };
    calcular_todas(enjambre, N_DRONES);
    ordenar(enjambre, N_DRONES);
    printf("Ranking de aptitud:\n");
    for (int i = 0; i < N_DRONES; i++) {
        if (enjambre[i].estado == OPERATIVO) {
            printf("%d. %s  F = %.1f\n", i + 1, enjambre[i].nombre, enjambre[i].aptitud);
        }
    }
    return 0;
}
