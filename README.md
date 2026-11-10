# Cognition

Herramienta de estudio para ramos donde te evalúan **escribiendo a mano**: código en papel, desarrollo y teoría.
Un motor genérico donde **cada ramo es una carpeta de contenido**.

- **Hoy:** plan del día, meta de XP, racha, cuenta regresiva a tus evaluaciones y mapa de dominio por tema.
- **Ejercicios:** enunciado, tres niveles de ayuda (líneas clave ocultas → solo los TODO → sin esqueleto), cronómetro, pistas, solución explicada y autoevaluación con rúbrica o autocorrección.
- **Tarjetas:** teoría con repetición espaciada.
- **En pantalla + compilar:** editor con números de línea; con el ejecutor local en WSL compila con gcc y corre las pruebas del ejercicio (tu servidor contra un cliente de prueba, tu cliente contra el servidor de referencia, salida esperada…).
- **Módulos:** pestañas propias de un ramo (por ejemplo, Relojes y Drills en Redes).
- **Sincronización:** el mismo progreso en el PC y el celular, con un código.

Ramos incluidos: **Taller de Ciencia de Redes** (`cursos/redes`). Para agregar otro, lee [docs/NUEVO-CURSO.md](docs/NUEVO-CURSO.md).

## Estructura

```
index.html            ← la app generada (no la edites a mano: se regenera)
app/                  ← motor genérico
  ui.js                 vistas Hoy / Ejercicios / Tarjetas, estado y progreso por ramo
  core.js               código con TODO, resaltado multi-lenguaje, diagramas
  sync.js               sincronización con /api/progress
  style.css, template.html
  build.cjs             valida el contenido y genera index.html
api/progress.js       ← función serverless de Vercel (progreso en Upstash Redis)
cursos/
  redes/                ramo de ejemplo completo (34 ejercicios, 60 tarjetas, 2 módulos)
    curso.js            configuración: nombre, temas, grupos, evaluaciones, lenguaje…
    ejercicios/*.js     ejercicios.push({...})
    tarjetas.js         tarjetas.push({...})
    soluciones/         código de las soluciones con marcas //@TODO y //§
    modulos/            pestañas propias del ramo (opcional)
  _plantilla/           punto de partida para un ramo nuevo (no aparece en la app)
docs/NUEVO-CURSO.md   ← cómo agregar un ramo y formato de cada campo
test/                 ← pruebas (jsdom + API simulada)
```

## Uso diario

```bash
npm run construir     # regenera index.html después de cambiar contenido
npm install && npm run probar   # pruebas (opcional; ver CLAUDE.md para las del ejecutor)
```
Luego `git commit` y `git push`: Vercel publica solo.

## Despliegue en Vercel (una vez)

1. En [vercel.com](https://vercel.com), entra con GitHub → *Add New… → Project* → importa `Cognition`.
   *Framework Preset:* **Other**. Deja vacíos *Build Command* y *Output Directory*. Luego *Deploy*.
2. **Base de datos para sincronizar:** *Storage → Create Database → Upstash for Redis* (plan gratis) → *Connect* al proyecto.
   Vercel agrega `KV_REST_API_URL` y `KV_REST_API_TOKEN`. Después ve a *Deployments → ⋯ → Redeploy*.
3. Abre tu URL → *Hoy → Sincronización → Crear código*. En el celular, ingresa ese código.

> Si el indicador dice "servidor sin configurar", falta el paso 2 o el redeploy. Sin base de datos la app funciona igual, pero el progreso queda solo en cada navegador.

## Compilar desde la página (ejecutor local en WSL)

La página no puede compilar C por sí sola: los ejercicios usan `fork`, pipes y sockets, que necesitan un Linux real.
Por eso hay un ejecutor pequeño (`runner/cognition_runner.py`, solo biblioteca estándar de Python) que corre en tu PC:

```bash
# en Ubuntu (WSL), una sola vez
curl -fsSL https://<tu-app>.vercel.app/runner/instalar.sh | bash -s -- https://<tu-app>.vercel.app
```

El instalador (`runner/instalar.sh`) instala gcc si falta y deja el ejecutor en `~/.cognition/`. También crea el comando `cognition` y agrega un archivo en la carpeta de Inicio de Windows, para que el ejecutor arranque oculto al iniciar sesión. En cada arranque se actualiza desde el sitio. Para desinstalar: `~/.cognition/desinstalar.sh`.

La página muestra estos comandos ya con tu dirección (*Ejercicios → un ejercicio → En pantalla + compilar*).

**Seguridad:**
- El ejecutor solo escucha en `127.0.0.1` y solo acepta pedidos del sitio indicado en `--origen`, con una cabecera propia que obliga al navegador a verificar el origen.
- Cada prueba corre en una carpeta temporal que se borra al terminar, con límites de tiempo y sin dejar procesos vivos.
- Aun así, ejecuta código: no lo inicies con orígenes en los que no confíes.

## Cómo funciona la sincronización

`api/progress.js` guarda todo tu progreso (todos los ramos) como un JSON en Redis, bajo la clave `cognition:<código>`.
Ante conflictos gana la versión con `updatedAt` más reciente (*last-write-wins*), así que conviene usar un dispositivo a la vez.
El progreso de la versión anterior ("Cuaderno de Redes") se migra solo al ramo Redes.
