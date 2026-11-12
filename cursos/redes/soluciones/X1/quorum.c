/* Quórum y split-brain */
#include <stdio.h>
#include <stdbool.h>

bool has_quorum(int alive, int cluster_size) {
//@TODO 1 | Implementar has_quorum
//? Mayoría estricta de N nodos: ¿cuántos necesitas como mínimo?
//- Quórum = N/2 + 1 (división entera).
//- Si alive >= quórum → return true; si no → return false.
    int quorum = cluster_size / 2 + 1; //§ //: más de la mitad: con 5 → 3, con 4 → 3
    if (alive >= quorum) { //§ //: ¿hay suficientes nodos vivos?
        return true; //§ //: sí: hay mayoría
    }
    return false; //§ //: no alcanza la mayoría
//@END
}

int max_failures(int cluster_size) {
//@TODO 2 | Implementar max_failures
//? Si necesitas Q vivos de N, ¿cuántos pueden caer?
//- quorum = N/2 + 1.
//- return N − quorum.
    int quorum = cluster_size / 2 + 1; //§ //: los que deben seguir vivos
    return cluster_size - quorum; //§ //: el resto puede caer: con 5 → 2
//@END
}

int side_with_quorum(int size_a, int size_b) {
//@TODO 3 | Implementar side_with_quorum
//? En una partición, cada lado se compara contra el TOTAL del clúster, no contra su propio tamaño.
//- total = a + b.
//- Si has_quorum(a, total) → 0; si has_quorum(b, total) → 1; si ninguno → −1.
    int total = size_a + size_b; //: tamaño del clúster completo
    if (has_quorum(size_a, total)) { //§ //: ¿el lado A tiene mayoría del TOTAL?
        return 0; //§ //: opera el lado A
    }
    if (has_quorum(size_b, total)) { //§ //: ¿y el lado B?
        return 1; //§ //: opera el lado B
    }
    return -1; //§ //: ninguno tiene mayoría (ej. 2|2): nadie opera
//@END
}

int main(void) {
    printf("%d\n", has_quorum(3, 5));
    printf("%d\n", max_failures(5));
    printf("%d\n", side_with_quorum(3, 2));
    printf("%d\n", side_with_quorum(2, 2));
    return 0;
}
