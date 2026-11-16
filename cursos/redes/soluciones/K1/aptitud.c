/* aptitud.c — función de aptitud del enjambre CENTINELA (Control 3, pregunta 1) */
#include <stdio.h>
#include <string.h>

#define N_DRONES 6

/* Estados de un dron */
#define INOPERATIVO 0
#define OPERATIVO   1

/* Pesos de cada criterio (suman 1.0) */
#define W_BAT  0.40   /* batería: el líder coordina por horas y gasta más energía */
#define W_DIST 0.25   /* distancia al perímetro: cerca reacciona antes (MENOR es mejor) */
#define W_VIS  0.35   /* visibilidad: consolida el video de la cámara multiespectral */

typedef struct {
    char nombre[4];      /* "C1" … "C6" */
    float bateria;       /* 0 – 100 % */
    float distancia;     /* km al perímetro */
    float visibilidad;   /* 0 – 100 */
    int estado;          /* OPERATIVO o INOPERATIVO */
    float aptitud;       /* 0 – 100; -1 si está inoperativo */
} Dron;

/* Aptitud de UN dron. dmin y dmax: menor y mayor distancia entre los drones operativos. */
float calcular_aptitud(Dron d, float dmin, float dmax) {
//@TODO 1 | Fórmula: normalizar los 3 criterios a 0–1 y combinarlos con los pesos
//? Batería y visibilidad: más es mejor y ya están en 0–100. La distancia: MENOS es mejor. ¿Cómo la conviertes para que el más cercano saque 1 y el más lejano 0?
//- bat = bateria / 100 y vis = visibilidad / 100.
//- dist = (dmax - distancia) / (dmax - dmin): relación INVERSA (el más cercano da 1).
//- Si dmax == dmin (todos a la misma distancia), dist = 1 para no dividir por 0.
//- return 100 * (W_BAT * bat + W_DIST * dist + W_VIS * vis).
    float bat = d.bateria / 100.0; //§ //: batería a escala 0–1 (más es mejor)
    float vis = d.visibilidad / 100.0; //§ //: visibilidad a escala 0–1 (más es mejor)
    float dist; //: aquí va la distancia ya invertida
    if (dmax == dmin) { //: ¿todos están a la misma distancia?
        dist = 1.0; //: entonces la distancia no diferencia a nadie
    } else {
        dist = (dmax - d.distancia) / (dmax - dmin); //§ //: INVERSA: el más cercano da 1, el más lejano da 0
    }
    return 100.0 * (W_BAT * bat + W_DIST * dist + W_VIS * vis); //§ //: suma ponderada, en escala 0–100
//@END
}

/* Calcula la aptitud de todos. Los inoperativos quedan con -1. */
void calcular_todas(Dron v[], int n) {
//@TODO 2 | Buscar dmin y dmax SOLO entre los operativos y calcular cada aptitud
//? ¿Por qué no hay que considerar al dron caído al buscar la distancia mínima y máxima?
//- dmin y dmax parten con la distancia del primer operativo que encuentres (usa una bandera).
//- Recorre los operativos y actualiza dmin y dmax.
//- Segundo recorrido: operativo → aptitud = calcular_aptitud(...); inoperativo → aptitud = -1.
    float dmin = 0, dmax = 0; //: menor y mayor distancia
    int primero = 1; //: bandera: ¿todavía no veo ningún operativo?
    for (int i = 0; i < n; i++) { //: busco el rango de distancias…
        if (v[i].estado == OPERATIVO) { //§ //: …solo entre los operativos (C3 no tiene datos)
            if (primero == 1) { //: el primer operativo inicia el rango
                dmin = v[i].distancia;
                dmax = v[i].distancia;
                primero = 0;
            }
            if (v[i].distancia < dmin) { //§ //: ¿más cerca que el mínimo?
                dmin = v[i].distancia; //§
            }
            if (v[i].distancia > dmax) { //§ //: ¿más lejos que el máximo?
                dmax = v[i].distancia; //§
            }
        }
    }
    for (int i = 0; i < n; i++) { //: ahora calculo cada aptitud
        if (v[i].estado == OPERATIVO) {
            v[i].aptitud = calcular_aptitud(v[i], dmin, dmax); //§ //: aptitud con el rango ya conocido
        } else {
            v[i].aptitud = -1; //§ //: un dron caído no puede ser líder
        }
    }
//@END
}

/* Ordena de mayor a menor aptitud. Empate: gana el nombre menor (C1 antes que C2). */
void ordenar(Dron v[], int n) {
//@TODO 3 | Ordenamiento burbuja de mayor a menor aptitud
//? Burbuja: comparas vecinos y los intercambias si están al revés. ¿Cuándo están "al revés" si quieres de MAYOR a menor?
//- Dos for: i de 0 a n-1 y j de 0 a n-1-i.
//- Si v[j].aptitud < v[j+1].aptitud → intercambiar (con una variable Dron tmp).
//- Si empatan y strcmp(v[j].nombre, v[j+1].nombre) > 0 → también intercambiar.
    for (int i = 0; i < n - 1; i++) { //: cada pasada deja al menor al final
        for (int j = 0; j < n - 1 - i; j++) { //: comparo cada par de vecinos
            int cambiar = 0; //: ¿están al revés?
            if (v[j].aptitud < v[j + 1].aptitud) { //§ //: el de la derecha es más apto
                cambiar = 1; //§
            }
            if (v[j].aptitud == v[j + 1].aptitud) { //: empate…
                if (strcmp(v[j].nombre, v[j + 1].nombre) > 0) { //: …gana el nombre menor
                    cambiar = 1;
                }
            }
            if (cambiar == 1) { //§ //: intercambio con una variable auxiliar
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
