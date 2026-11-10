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

## Tarjetas (`tarjetas.js`)

`tarjetas.push({ id, t: '<id de tema>', q: '<pregunta HTML>', a: '<respuesta HTML>' })`.

## Módulos (opcional, avanzado)

Un archivo en `modulos/` puede registrar una pestaña propia:

```js
VIEWS.mimodulo = () => `<h1>…</h1>`;                // HTML de la vista
Object.assign(ACT, { miAccion(el) { … render(); } }); // botones con data-act="miAccion"
MODULOS.mimodulo = { nombre: 'Mi módulo', hoy: { titulo, texto, boton } };
```
y declara `modulos: ['mimodulo']` en `curso.js`. Para registrar progreso usa `record(idTema, acierto)` y `addXp(n)`.
Todos los módulos comparten el mismo espacio de nombres: usa nombres propios (por ejemplo `BD_ESTADO`, no `ESTADO`).
