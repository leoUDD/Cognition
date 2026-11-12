/* Elección de líder por quórum durante una partición de red */
#include <stdio.h>

#define MAX_NODOS 7

typedef struct {
    int id;          /* igual a su posición en el arreglo */
    int latencia;    /* ms: criterio para votar (menor es mejor) */
    int lado;        /* en qué lado de la partición quedó (0 o 1) */
} Nodo;

int quorum(int n) {
//@TODO 1 | Tamaño del quórum para un clúster de n nodos
//? ¿Cuántos nodos son "más de la mitad"? Prueba tu fórmula con n = 4 y n = 5.
//- Divide n por 2 (división entera) y súmale 1.
    return n / 2 + 1; //§ //: más de la mitad: 4 → 3, 5 → 3
//@END
}

/* Retorna el id por el que vota el nodo 'votante', o -1 si no puede votar por nadie. */
int elegir_voto(const Nodo v[], int n, int votante) {
//@TODO 2 | Regla de votación: nadie vota por sí mismo y gana la menor latencia
//? El votante solo "ve" a los nodos de su mismo lado. Entre ellos, ¿por quién vota y a quién debe saltarse?
//- Recorre los n nodos.
//- Sáltate al propio votante y a los que están en otro lado de la partición.
//- Quédate con el de menor latencia; si empatan, con el de menor id (así es determinista).
//- Si no encontraste a nadie, retorna -1.
    int mejor = -1; //: todavía no elijo a nadie
    for (int i = 0; i < n; i++) { //: reviso cada nodo
        if (i != votante) { //§ //: nadie vota por sí mismo
            if (v[i].lado == v[votante].lado) { //§ //: solo veo a los de mi lado de la partición
                if (mejor == -1) { //§ //: es el primero que encuentro…
                    mejor = i; //§ //: …por ahora es el mejor
                }
                if (v[i].latencia < v[mejor].latencia) { //§ //: ¿tiene menor latencia que el mejor? (< estricto: en empate gana el id menor)
                    mejor = i; //§ //: entonces voto por él
                }
            }
        }
    }
    return mejor; //: -1 si no había nadie más en mi lado
//@END
}

/* Retorna el id del líder elegido en ese lado de la partición, o -1 si ese lado no puede elegir. */
int elegir_lider(const Nodo v[], int n, int lado) {
//@TODO 3 | Elegir líder solo si el lado tiene quórum
//? Para evitar split-brain, ¿contra qué número se compara cuántos nodos hay en este lado: los del lado o los del clúster completo?
//- Cuenta cuántos nodos hay en este lado.
//- Si son menos que quorum(n) (n = clúster COMPLETO), retorna -1.
//- Cada nodo del lado vota con elegir_voto y sumas votos en un arreglo votos[MAX_NODOS] = {0}.
//- Gana el que tenga más votos; si empatan, el de menor id.
    int presentes = 0; //: cuántos nodos quedaron en este lado
    for (int i = 0; i < n; i++) { //: cuento…
        if (v[i].lado == lado) { //: …los de este lado
            presentes = presentes + 1;
        }
    }
    if (presentes < quorum(n)) { //§ //: ¿no tengo mayoría del clúster COMPLETO?
        return -1; //§ //: este lado no elige: así no hay split-brain
    }

    int votos[MAX_NODOS] = {0}; //: votos de cada nodo, todos en 0
    for (int i = 0; i < n; i++) { //: cada nodo…
        if (v[i].lado == lado) { //: …de este lado…
            int d = elegir_voto(v, n, i); //§ //: …elige por quién votar
            if (d >= 0) { //§ //: ¿encontró a alguien?
                votos[d] = votos[d] + 1; //§ //: sumo el voto
            }
        }
    }
    int lider = -1; //: todavía no hay líder
    for (int i = 0; i < n; i++) { //: busco al más votado
        if (v[i].lado == lado) { //: entre los de este lado
            if (lider == -1) { //§ //: el primero que veo…
                lider = i; //§ //: …es el líder por ahora
            }
            if (votos[i] > votos[lider]) { //§ //: ¿tiene más votos? (> estricto: en empate gana el id menor)
                lider = i; //§ //: es el nuevo líder
            }
        }
    }
    return lider;
//@END
}

int main(void) {
    /* 5 nodos; la red se parte en {0, 1, 2} | {3, 4} */
    Nodo c5[] = { {0, 40, 0}, {1, 15, 0}, {2, 25, 0}, {3, 5, 1}, {4, 30, 1} };
    printf("N=5, lado A (3 nodos): líder %d\n", elegir_lider(c5, 5, 0));
    printf("N=5, lado B (2 nodos): líder %d\n", elegir_lider(c5, 5, 1));

    /* 4 nodos; la red se parte en {0, 1} | {2, 3} */
    Nodo c4[] = { {0, 10, 0}, {1, 20, 0}, {2, 15, 1}, {3, 25, 1} };
    printf("N=4, lado A (2 nodos): líder %d\n", elegir_lider(c4, 4, 0));
    printf("N=4, lado B (2 nodos): líder %d\n", elegir_lider(c4, 4, 1));
    return 0;
}
