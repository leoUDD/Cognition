/* Quórum y split-brain */
#include <stdio.h>
#include <stdbool.h>

bool has_quorum(int alive, int cluster_size) {
//@TODO 1 | Implementar has_quorum
    return alive >= cluster_size / 2 + 1; //§
//@END
}

int max_failures(int cluster_size) {
//@TODO 2 | Implementar max_failures
    return cluster_size - (cluster_size / 2 + 1); //§
//@END
}

int side_with_quorum(int size_a, int size_b) {
//@TODO 3 | Implementar side_with_quorum
    int total = size_a + size_b;
    if (has_quorum(size_a, total)) return 0; //§
    if (has_quorum(size_b, total)) return 1; //§
    return -1; //§
//@END
}

int main(void) {
    printf("%d\n", has_quorum(3, 5));
    printf("%d\n", max_failures(5));
    printf("%d\n", side_with_quorum(3, 2));
    printf("%d\n", side_with_quorum(2, 2));
    return 0;
}
