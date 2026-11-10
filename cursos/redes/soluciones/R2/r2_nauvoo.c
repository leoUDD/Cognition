/* r2_nauvoo.c — servidor RPC con dispatch table (compilar con -lm) */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <time.h>
#include <unistd.h>
#include <signal.h>
#include <sys/socket.h>
#include <netinet/in.h>

#define PORT 8002
#define NNODOS 5

const char *nodos[NNODOS] = { "Tierra", "Marte", "Ceres", "Jupiter", "Tycho" };
const double au[NNODOS]   = { 1.0, 1.52, 2.77, 5.2, 2.2 };
/* Rutas directas disponibles (grafo no dirigido) */
const int ady[NNODOS][NNODOS] = {
    /* Tie Mar Cer Jup Tyc */
    {  0,  1,  0,  0,  0 },     /* Tierra  */
    {  1,  0,  1,  0,  1 },     /* Marte   */
    {  0,  1,  0,  1,  1 },     /* Ceres   */
    {  0,  0,  1,  0,  1 },     /* Jupiter */
    {  0,  1,  1,  1,  0 },     /* Tycho   */
};

int idx(const char *n) { for (int i = 0; i < NNODOS; i++) if (strcmp(nodos[i], n) == 0) return i; return -1; }

/* Todas las funciones remotas tienen la misma firma: args en texto -> resultado en texto */
typedef void (*handler_fn)(const char *args, char *out, size_t n);

//@TODO 1 | Implementar los 4 handlers
void calcular_quema(const char *args, char *out, size_t n) {
    double dv, masa;
    if (sscanf(args, "%lf %lf", &dv, &masa) != 2) { snprintf(out, n, "ERROR args"); return; } //§
    snprintf(out, n, "%.2f", masa * (exp(dv / 9800.0) - 1)); //§
}

void distancia_AU(const char *args, char *out, size_t n) {
    char a[32], b[32];
    if (sscanf(args, "%31s %31s", a, b) != 2 || idx(a) < 0 || idx(b) < 0) { snprintf(out, n, "ERROR args"); return; } //§
    snprintf(out, n, "%.2f", fabs(au[idx(a)] - au[idx(b)])); //§
}

void ruta_optima(const char *args, char *out, size_t n) {
    char a[32], b[32];
    if (sscanf(args, "%31s %31s", a, b) != 2 || idx(a) < 0 || idx(b) < 0) { snprintf(out, n, "ERROR args"); return; }
    int s = idx(a), t = idx(b), prev[NNODOS], cola[NNODOS], ini = 0, fin = 0;
    for (int i = 0; i < NNODOS; i++) prev[i] = -2;
    prev[s] = -1; cola[fin++] = s;
    while (ini < fin) {                         /* BFS: menos saltos = ruta más corta */ //§
        int u = cola[ini++];
        for (int v = 0; v < NNODOS; v++)
            if (ady[u][v] && prev[v] == -2) { prev[v] = u; cola[fin++] = v; } //§
    }
    if (prev[t] == -2) { snprintf(out, n, "SIN_RUTA"); return; }
    int camino[NNODOS], k = 0;
    for (int v = t; v != -1; v = prev[v]) camino[k++] = v; //§
    out[0] = '\0';
    for (int i = k - 1; i >= 0; i--) {
        strncat(out, nodos[camino[i]], n - strlen(out) - 1);
        if (i > 0) strncat(out, "->", n - strlen(out) - 1);
    }
}

void estado_reactor(const char *args, char *out, size_t n) {
    (void)args;
    const char *e[] = { "OPTIMO", "DEGRADADO", "CRITICO" };
    snprintf(out, n, "%s", e[rand() % 3]); //§
}
//@END

//@TODO 2 | La dispatch table: nombre -> función
typedef struct { const char *nombre; handler_fn fn; } Entrada;
Entrada dispatch[] = {
    { "calcular_quema", calcular_quema }, //§
    { "distancia_AU",   distancia_AU }, //§
    { "ruta_optima",    ruta_optima }, //§
    { "estado_reactor", estado_reactor }, //§
};
#define NFUNC (sizeof(dispatch) / sizeof(dispatch[0]))
//@END

void atender(int fd) {
//@TODO 3 | Parsear "CALL <funcion> <args>", buscar en la tabla y responder
    char buf[256], fn[32], args[200], res[200], resp[256];
    int n;
    while ((n = recv(fd, buf, sizeof(buf) - 1, 0)) > 0) { //§
        buf[n] = '\0';
        buf[strcspn(buf, "\r\n")] = '\0';
        args[0] = '\0';
        if (sscanf(buf, "CALL %31s %199[^\n]", fn, args) < 1) { send(fd, "ERROR\n", 6, 0); continue; } //§
        snprintf(resp, sizeof resp, "RESULT ERROR funcion_desconocida\n");
        for (size_t i = 0; i < NFUNC; i++)
            if (strcmp(dispatch[i].nombre, fn) == 0) { //§
                dispatch[i].fn(args, res, sizeof res);      /* llamada por puntero */ //§
                snprintf(resp, sizeof resp, "RESULT %s\n", res); //§
            }
        send(fd, resp, strlen(resp), 0); //§
    }
//@END
}

int main(void) {
    int srv = socket(AF_INET, SOCK_STREAM, 0);
    setsockopt(srv, SOL_SOCKET, SO_REUSEADDR, &(int){1}, sizeof(int));
    struct sockaddr_in addr;
    memset(&addr, 0, sizeof addr);
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = INADDR_ANY;
    addr.sin_port = htons(PORT);
    if (bind(srv, (struct sockaddr *)&addr, sizeof addr) < 0) { perror("bind"); return 1; }
    listen(srv, 5);
    signal(SIGCHLD, SIG_IGN);
    while (1) {
        int cli = accept(srv, NULL, NULL);
        if (cli < 0) continue;
        if (fork() == 0) { close(srv); srand(getpid()); atender(cli); close(cli); exit(0); }
        close(cli);
    }
}
