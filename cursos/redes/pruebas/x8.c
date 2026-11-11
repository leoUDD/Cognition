/* Prueba del Extra 8: elección de líder por quórum durante una partición */
#include <stdio.h>
#define main main_estudiante
#include "../quorum_lider.c"
#undef main
#define CHECK(c, msg) printf((c) ? "OK: %s\n" : "FALLA: %s\n", msg)

int main(void) {
    CHECK(quorum(5) == 3 && quorum(3) == 2 && quorum(7) == 4, "quórum = n/2 + 1 (5 -> 3, 3 -> 2, 7 -> 4)");
    CHECK(quorum(4) == 3, "Con 4 nodos el quórum es 3: la mitad (2) no es mayoría");

    Nodo c5[] = { {0, 40, 0}, {1, 15, 0}, {2, 25, 0}, {3, 5, 1}, {4, 30, 1} };
    CHECK(elegir_voto(c5, 5, 0) == 1, "El nodo 0 vota por el de menor latencia de su lado (nodo 1)");
    CHECK(elegir_voto(c5, 5, 1) != 1, "Nadie vota por sí mismo: el nodo 1 no puede votar por el 1");
    CHECK(elegir_voto(c5, 5, 1) == 2, "El nodo 1 vota por el siguiente con menor latencia (nodo 2)");
    CHECK(elegir_voto(c5, 5, 4) == 3 && elegir_voto(c5, 5, 3) == 4,
          "Solo vota por nodos de su mismo lado de la partición (el 3 no ve al 1)");

    Nodo emp[] = { {0, 10, 0}, {1, 20, 0}, {2, 20, 0} };
    CHECK(elegir_voto(emp, 3, 0) == 1, "Si dos empatan en latencia, gana el menor id (determinista)");
    Nodo solo[] = { {0, 10, 0}, {1, 20, 1} };
    CHECK(elegir_voto(solo, 2, 0) == -1, "Si no hay nadie más en su lado, retorna -1");

    CHECK(elegir_lider(c5, 5, 0) == 1, "N=5, lado de 3 nodos: tiene quórum y elige al nodo 1 (2 votos)");
    CHECK(elegir_lider(c5, 5, 1) == -1,
          "N=5, lado de 2 nodos: no tiene quórum y NO elige líder (así no hay split-brain). "
          "Ojo: el quórum se calcula con el clúster completo, no con los nodos del lado");

    Nodo c4[] = { {0, 10, 0}, {1, 20, 0}, {2, 15, 1}, {3, 25, 1} };
    CHECK(elegir_lider(c4, 4, 0) == -1 && elegir_lider(c4, 4, 1) == -1,
          "N=4 partido 2|2: ningún lado tiene quórum y el sistema queda sin líder (por eso N impar)");

    Nodo c7[] = { {0, 30, 0}, {1, 12, 0}, {2, 50, 0}, {3, 8, 0}, {4, 20, 1}, {5, 9, 1}, {6, 40, 0} };
    CHECK(elegir_lider(c7, 7, 0) == 3, "N=7, lado de 5 nodos: gana el de menor latencia (nodo 3)");
    CHECK(elegir_lider(c7, 7, 1) == -1, "N=7, lado de 2 nodos: sin quórum");
    return 0;
}
