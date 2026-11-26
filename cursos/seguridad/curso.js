/* Seguridad y Protección de Datos (IIT421W). Línea jurídica (jueves) + taller práctico (viernes) + proyecto integrador. */
Object.assign(curso, {
  id: 'seguridad',
  nombre: 'Seguridad y Protección de Datos',
  lema: 'De la ley <span>al código</span>',
  intro: 'El examen tiene 50 preguntas (selección múltiple, verdadero o falso y desarrollo) sobre el marco legal, el taller práctico, las actividades y el proyecto integrador. Aquí estudias la teoría de cada sesión y practicas con preguntas del mismo formato.',
  lenguaje: 'python',
  examenes: [{ key: 'examen', label: 'Examen final' }],
  temas: [
    { id: 'fundamentos', n: 'Fundamentos de seguridad' },
    { id: 'ley19628', n: 'Ley 19.628' },
    { id: 'ley21719', n: 'Ley 21.719' },
    { id: 'cifrado', n: 'Cifrado, hashing y tokenización' },
    { id: 'privacidad', n: 'Privacidad desde el diseño' },
    { id: 'consentimiento', n: 'Consentimiento' },
    { id: 'derechos', n: 'Derechos del titular' },
    { id: 'incidentes', n: 'Trazabilidad e incidentes' }
  ]
});
