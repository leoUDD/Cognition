# Agregar un ramo a Cognition

1. Copia `cursos/_plantilla/` como `cursos/<id>/` (sin el guion bajo; por ejemplo `cursos/bd/`).
2. Edita `curso.js`, escribe los ejercicios y las tarjetas, y agrega las soluciones en `soluciones/`.
3. Ejecuta `npm run construir`. Si hay errores en el contenido, el validador dice cuál y dónde.
4. Haz commit y push. El ramo aparece en el selector de la cabecera.

> Idea: pásale a Claude tus guías y evaluaciones antiguas y pídele "agrega el ramo X a Cognition siguiendo docs/NUEVO-CURSO.md". El archivo `CLAUDE.md` le explica las reglas.

## `curso.js`

| Campo | Obligatorio | Qué es |
|---|---|---|
| `id` | sí | Identificador único sin espacios. Es la clave del progreso: no lo cambies después. |
| `nombre` | sí | Nombre visible del ramo. |
| `lema`, `intro` | no | Título y texto de "Hoy" (admiten HTML; `<span>` colorea). |
| `lenguaje` | no | `c`, `cpp`, `java`, `js`, `python` o `sql`. Por defecto se deduce de la extensión de cada archivo. |
| `comando` | no | Cómo ejecutar una solución, con `{archivo}` y `{base}`. Ej.: `gcc -Wall -o {base} {archivo}`. |
| `examenes` | no | `[{ key, label }]`: evaluaciones con cuenta regresiva. |
| `grupos` | sí si hay ejercicios | `[{ id, nombre, sub }]`. **El orden es la prioridad** con que "Hoy" sugiere ejercicios. |
| `temas` | sí | `[{ id, n }]`: temas del mapa de dominio; ejercicios y tarjetas apuntan a ellos. |
| `titulos` | no | 6 nombres de nivel para la cabecera. |
| `modulos` | no | Ids de pestañas propias definidas en `modulos/`. |
| `textoEjercicios`, `solucionesProbadas` | no | Texto de la lista de ejercicios y la marca "(probada)". |

## Ejercicios (`ejercicios/*.js`)

Cada archivo hace `ejercicios.push({...}, {...})`. Los archivos se cargan en orden alfabético.

| Campo | Qué es |
|---|---|
| `id` | Único dentro del ramo. |
| `group`, `topic` | Ids de `curso.grupos` y `curso.temas`. |
| `n`, `title` | Etiqueta corta ("Ej. 3", "P2 ⭐⭐") y título. |
| `lvl`, `min` | Dificultad 1–3 y minutos sugeridos. |
| `statement` | Enunciado en HTML. |
| `files` | Rutas dentro de `soluciones/`. Puede haber varios archivos (servidor + cliente). |
| `comandos` | `{ "archivo.c": "comando especial" }` (ej. `-lm`). |
| `rubric` | `[{ pts, t }]`: autoevaluación tras ver la solución. |
| `fields` | Preguntas que se corrigen solas: `{ k, label, ans: ['respuesta', 'alternativa'] }` o `{ k, label, type: 'opt', opts: [...], ans: ['opción'] }`. |
| `think` | **Obligatorio.** Pasos de razonamiento (HTML) que se muestran con la solución. |
| `hints` | Pistas graduales (texto). |
| `qs` | Preguntas teóricas del enunciado con su respuesta: `[{ q, a }]` (HTML). |
| `errors` | Errores típicos. |
| `out` | Salida esperada o de ejemplo. |
| `diagram`, `solDiagram` | Diagrama espacio-tiempo (ver `cursos/redes/ejercicios/1-lamport.js`). |

Cada ejercicio necesita `rubric` o `fields`, o ambos.

## Marcas en las soluciones

El archivo de solución es código real (debe compilar o ejecutar). Las marcas son comentarios:

```c
void f(int *x) {
//@TODO A.1 | Descripción de lo que va aquí
    (*x)++;        //§   ← línea clave: se oculta en el nivel "Líneas clave ocultas"
    printf("ok");        ← se muestra como pista de estructura
//@END
}
```

- Nivel **Líneas clave ocultas**: muestra el bloque y oculta las líneas con `//§`.
- Nivel **Solo los TODO**: reemplaza el bloque por `/* TODO A.1: descripción */` (el formato de un control).
- Nivel **Sin esqueleto**: no muestra código.

En Python usa `#@TODO`, `#@END` y `#§`; en SQL, `--@TODO`, `--@END` y `--§`.

### Guía paso a paso (dentro de cada TODO)

Justo después de `//@TODO`, agrega una pregunta guía con `//?` y los pasos en pseudocódigo con `//-`. No aparecen en el código que ve el estudiante: alimentan el botón *"No sé por dónde empezar"*.

```c
//@TODO 3 | Recepción: C <- max(C, T) + 1
//? Al recibir, el reloj debe quedar por delante de su pasado y del emisor. ¿Cómo combinas los dos valores?
//- Si el ts recibido es mayor que tu reloj, tu reloj salta a ese valor (el max).
//- Después, en cualquier caso, súmale 1.
    if (ts_recv > n->clock) n->clock = ts_recv; //§
    n->clock++; //§
//@END
```

La pregunta debe hacer **pensar** (no dar la respuesta). Los pasos van en español, en el orden en que se escribe el código.

## Pruebas automáticas (`pruebas.js`, opcional)

Con el **ejecutor local** (WSL, ver README), el modo *En pantalla + compilar* compila el código del estudiante y lo prueba.
Cada ejercicio con código puede tener un plan en `pruebas.js`:

```js
Object.assign(pruebas, {
  'EJ1': {
    compilar: [{ src: ['servidor.c'], out: 'servidor', flags: ['-lm'] }],    // gcc -Wall -Wextra
    pasos: [
      { tipo: 'iniciar', nombre: 'Tu servidor', cmd: './servidor', puerto: 7070, log: 'servidor.out', critico: true },
      { tipo: 'python', nombre: 'Protocolo', archivo: 'prueba/sonda.py', timeout: 20 },
      { tipo: 'ejecutar', nombre: 'Salida', cmd: './prog', timeout: 10, guardar: 'salida.txt',
        espera: { salida: '...', contiene: ['...'], noContiene: ['...'] } }
    ]
  }
});
```

- En `src` y `archivo`: el nombre a secas es el archivo **del estudiante**; `ref/<archivo>` es la solución del mismo ejercicio; `ref/<ID>/<archivo>`, la de otro ejercicio (por ejemplo, probar el cliente contra el servidor de referencia); `prueba/<archivo>` está en `cursos/<id>/pruebas/`.
- Las sondas en Python hacen `from cognition_prueba import *` y usan `ok()`, `falla()`, `check()`, `conectar(puerto)`, `Linea(sock)` y `leer_archivo()`. Los programas de prueba en C también pueden imprimir `OK: ...` o `FALLA: ...`.
- Para probar funciones sueltas, crea `pruebas/x.c` con `#include "../archivo_del_estudiante.c"` y un `main`. Si el archivo del estudiante ya trae `main`, usa `#define main main_estudiante` antes del include.
- **Verifica siempre las dos direcciones:** la solución de referencia debe pasar (`node test/runner.test.mjs ID`) y un error típico debe fallar con un mensaje que enseñe.

## Glosario (`glosario.js`)

`glosario.push({ id, t: 'término', alias: ['otras formas'], def: 'definición HTML corta', ej: 'código de ejemplo (opcional)', ver: ['ids relacionados'] })`.

- Cada término y alias se marca **automáticamente** (primera aparición por sección) en enunciados, pistas, guías, explicaciones y respuestas de tarjetas. Al tocarlo se abre su definición.
- Cada ejercicio lista al inicio los conceptos que usa.
- **Cuidado con los alias genéricos:** una palabra común ("cliente", "concurrente") se marcará donde no corresponde. Prefiere frases ("servidor concurrente", "eventos concurrentes").
- Las definiciones deben bastarle a alguien que **no recuerda** el concepto: qué es, para qué sirve y, si aplica, una línea de código.

## Referencia del lenguaje (`referencia.js`, opcional)

`referencia.push({ id, grupo, titulo, cuando, texto, codigo })` crea la pestaña de referencia (con el nombre de `curso.referenciaNombre`, por ejemplo "Sintaxis de C"). También se abre como **panel lateral** dentro de cada ejercicio, sin perder lo escrito en el editor.

- **Sintaxis básica:** lo que se olvida (formatos de printf, punteros, strings…).
- **Patrones del ramo:** el esqueleto comentado de cada tipo de programa, con `cuando` (en qué ejercicios se usa). Es la mejor ayuda para empezar desde cero.
- Al final de `referencia.js`, `Object.assign(usaPatrones, { EJ1: ['id-patron', …] })` indica qué patrones usa cada ejercicio. Aparecen como "Patrones que usa" y abren el panel en ese esqueleto.
- Verifica que cada fragmento compile.

## Tarjetas (`tarjetas.js`)

`tarjetas.push({ id, t: '<id de tema>', q: '<pregunta HTML>', a: '<respuesta HTML>' })`.

**Calificación automática (`claves.js`):** si el estudiante escribe su respuesta, se compara con las ideas clave de la tarjeta y se sugiere la nota. Si cubre el 85 % o más, *Bien*; desde el 50 %, *Difícil*; bajo eso, *Otra vez*, y la tarjeta vuelve en la misma sesión.

```js
Object.assign(claves, {
  c03: [['Recepción: max(L, T) + 1', 'max|maximo'], ['Envío: +1 y el mensaje lleva el reloj', 'mensaje lleva|adjunta|envia el reloj']]
});
```

- Cada idea es `[etiqueta visible, "alternativa1|alternativa2"]`. Dentro de una alternativa, **todas** las palabras deben aparecer, en cualquier orden.
- Se compara sin tildes ni mayúsculas. Las palabras de más de 3 letras se buscan por raíz ("cerr" acepta cerrar y cerrado). Las cortas o con símbolos (`max`, `+1`, `fd[0]`) se buscan tal cual.
- Escribe varias alternativas por idea: sinónimos, otra forma de conjugar, el término en inglés.
- `node test/claves.test.cjs` verifica que la **respuesta oficial** de cada tarjeta saque *Bien* con sus propias claves.

## Módulos (opcional, avanzado)

Un archivo en `modulos/` puede registrar una pestaña propia:

```js
VIEWS.mimodulo = () => `<h1>…</h1>`;                // HTML de la vista
Object.assign(ACT, { miAccion(el) { … render(); } }); // botones con data-act="miAccion"
MODULOS.mimodulo = { nombre: 'Mi módulo', hoy: { titulo, texto, boton } };
```
y declara `modulos: ['mimodulo']` en `curso.js`. Para registrar progreso usa `record(idTema, acierto)` y `addXp(n)`.
Todos los módulos comparten el mismo espacio de nombres: usa nombres propios (por ejemplo `BD_ESTADO`, no `ESTADO`).
