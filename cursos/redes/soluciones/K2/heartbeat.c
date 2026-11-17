/* heartbeat.c — health check periódico: declarar inoperativo tras N ciclos sin respuesta */
//@PASO 1. Bibliotecas | ¿Qué biblioteca necesitas para printf?
#include <stdio.h>

//@PASO 2. Constantes | ¿Después de cuántos ciclos sin respuesta se declara inoperativo? Nómbralo con #define, igual que los estados.
#define MAX_FALLOS  3      /* ciclos consecutivos sin respuesta para declarar inoperativo */
#define PERIODO_HB  5      /* el líder emite un heartbeat cada 5 s */
#define TIMEOUT_MS  2000   /* espera de cada HB_REQ */

#define INOPERATIVO 0
#define OPERATIVO   1

//@PASO 3. Estructura Monitor | Para vigilar a un dron, ¿qué tienes que recordar entre un ciclo y el siguiente?
typedef struct {
    char nombre[4];   /* dron vigilado, p. ej. "C3" */
    int fallos;       /* ciclos CONSECUTIVOS sin respuesta */
    int estado;       /* OPERATIVO o INOPERATIVO */
} Monitor;

//@PASO 4. registrar_ciclo() — TODO 1 | Recibe un puntero (Monitor *m) porque debe MODIFICAR el monitor: con m-> cambias el original, no una copia.
/* Se llama una vez por ciclo. respondio = 1 si llegó el heartbeat.
   Retorna 1 SOLO en el ciclo en que se declara inoperativo (para iniciar la elección una vez). */
int registrar_ciclo(Monitor *m, int respondio, const char *hora) {
//@TODO 1 | Contar ciclos consecutivos sin respuesta y declarar inoperativo al llegar a MAX_FALLOS
//? Si responde en el ciclo 2, ¿los fallos del ciclo 1 siguen contando? ¿Y cuántas veces debe iniciarse la elección?
//- Si respondio: m->fallos = 0 y return 0 (la cuenta es de fallos CONSECUTIVOS).
//- Si no: m->fallos = m->fallos + 1 e imprime la línea de TIMEOUT.
//- Si m->fallos >= MAX_FALLOS y el estado sigue OPERATIVO: estado = INOPERATIVO, imprime el aviso y return 1.
//- En cualquier otro caso: return 0.
    if (respondio == 1) { //§ //: llegó el heartbeat
        m->fallos = 0; //§ //: reinicio: solo cuentan los fallos SEGUIDOS
        return 0; //§ //: está vivo, nada que hacer
    }
    m->fallos = m->fallos + 1; //§ //: un ciclo más sin respuesta
    printf("[%s] HB_REQ -> %s  TIMEOUT (sin respuesta tras %d ms)\n", hora, m->nombre, TIMEOUT_MS); //: igual que el log del control
    if (m->fallos >= MAX_FALLOS) { //§ //: ¿llegué a 3 seguidos?
        if (m->estado == OPERATIVO) { //§ //: ¿y todavía figuraba operativo? (así aviso una sola vez)
            m->estado = INOPERATIVO; //§ //: lo declaro caído
            printf("[%s] == PROTOCOLO CENTINELA: %s INOPERATIVO ==\n", hora, m->nombre); //: aviso
            return 1; //§ //: el que llama debe iniciar la elección
        }
    }
    return 0; //: todavía no (o ya estaba declarado)
//@END
}

//@PASO 5. main() | Simula los ciclos del log: en cada uno llama a registrar_ciclo(). ¿Qué haces cuando retorna 1?
int main(void) {
    Monitor c3 = { "C3", 0, OPERATIVO }; //: C3 parte con 0 fallos y operativo
    /* El log del Control 3: C3 deja de responder a las 03:12:00 */
    const char *horas[] = { "03:12:05", "03:12:12", "03:12:19" }; //: horas del log en que no respondió
    for (int i = 0; i < 3; i++) { //: un ciclo por hora
        if (registrar_ciclo(&c3, 0, horas[i]) == 1) { //: &c3 = la dirección del monitor, para que la función lo modifique; 0 = no respondió
            printf("[%s] == INICIAR ELECCION DE NUEVO LIDER ==\n", horas[i]); //: retornó 1: recién se declaró caído → empieza la elección
        }
    }
    return 0;
}
