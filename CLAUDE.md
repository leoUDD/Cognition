# Cognition — instrucciones para Claude

App de estudio con un motor genérico (`app/`) y contenido por ramo (`cursos/<id>/`). Usuario: estudiante de Ingeniería Civil Informática (UDD) que quiere **aprender**, no solo ver respuestas. Las evaluaciones suelen ser en papel.

## Reglas

- **No edites `index.html` a mano.** Se genera con `node app/build.cjs`. Regenera y haz commit de `index.html` tras cualquier cambio.
- Para agregar o editar un ramo, sigue `docs/NUEVO-CURSO.md`. Parte desde `cursos/_plantilla/`.
- Basa el contenido en los materiales que entregue el usuario (guías, controles, PPT). No inventes definiciones si el profesor tiene las suyas.
- Cada solución en `soluciones/` debe **compilar o ejecutarse** de verdad. Pruébala antes de commitear (por ejemplo `gcc -Wall -Wextra`; para servidores y clientes, ejecútalos en localhost).
- Cada ejercicio con código debería tener pruebas en `pruebas.js` (ver docs/NUEVO-CURSO.md). Comprueba que la solución de referencia pase y que un error típico falle con un mensaje útil.
- Cada bloque `//@TODO` lleva una pregunta guía `//?` y pasos `//-` (ver docs/NUEVO-CURSO.md). Cada concepto que el estudiante podría no recordar va en `glosario.js`.
- Cada ejercicio lleva `think` (el razonamiento) y, si aplica, `qs` con las preguntas teóricas respondidas. El objetivo es enseñar.
- Si un enunciado tiene una inconsistencia, resuélvela con un supuesto razonable y explícala en `think`.
- Textos visibles en español. Los ids de `temas` y `grupos` no se renombran (son claves del progreso guardado).
- Antes de terminar: `npm run probar` (necesita `npm install`).

## Comandos

```bash
node app/build.cjs                                  # genera index.html (valida el contenido)
node app/build.cjs --todos --out=test/index.test.html   # incluye cursos/_*, para pruebas
cd test && node dom.test.cjs && node api.test.mjs
python3 runner/cognition_runner.py --puerto 7799 &      # ejecutor para las pruebas
node test/runner.test.mjs                           # todas las soluciones de referencia pasan sus pruebas
cd test && node editor.test.cjs                     # editor + ejecutor real
```
