/* PLANTILLA: copia esta carpeta como cursos/<id-del-ramo>/ (sin el "_") y edita.
   Las carpetas que empiezan con "_" no se incluyen en la app. */
Object.assign(curso, {
  id: 'plantilla',                       // único, sin espacios; es la clave del progreso guardado
  nombre: 'Ramo de ejemplo',
  lema: 'Aprender <span>haciendo</span>', // título grande de "Hoy" (admite <span> para el color)
  intro: 'Describe en una o dos frases cómo te evalúan y qué vas a practicar.',
  lenguaje: 'python',                    // c | cpp | java | js | python | sql (resaltado y comentarios)
  comando: 'python3 {archivo}',          // opcional: cómo ejecutar una solución ({archivo}, {base})
  examenes: [{ key: 'solemne1', label: 'Solemne 1' }],
  grupos: [{ id: 'guia1', nombre: 'Guía 1', sub: 'Ejercicios de la primera guía' }],
  temas: [{ id: 'bases', n: 'Fundamentos' }, { id: 'listas', n: 'Listas' }],
  modulos: []                            // pestañas con código propio en ./modulos (opcional)
});
