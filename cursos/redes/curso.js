/* Configuración del ramo. Ver docs/NUEVO-CURSO.md para el significado de cada campo. */
Object.assign(curso, {
  id: 'redes',
  nombre: 'Taller de Ciencia de Redes',
  lema: 'Escribir código <span>sin red de seguridad</span>',
  intro: 'El control y el certamen son en papel. Aquí practicas justo eso: recuperar el patrón de memoria, escribirlo a mano y corregirte con una rúbrica. Lo que fallas vuelve en pocos días.',
  lenguaje: 'c',
  comando: 'gcc -Wall -o {base} {archivo}',
  solucionesProbadas: true,
  textoEjercicios: 'Todos los ejercicios de tus guías, resueltos y explicados. Cada solución en C fue compilada y probada. Intenta primero en papel; la solución aparece solo cuando la pides.',
  titulos: ['Becario de telemetría', 'Operador de enlace', 'Ingeniero de réplicas', 'Arquitecto de quórums', 'Líder electo', 'Maestro del consenso'],
  examenes: [{ key: 'control', label: 'Control 3' }, { key: 'certamen', label: 'Certamen 2' }],
  /* El orden de los grupos es la prioridad con que "Hoy" sugiere ejercicios */
  grupos: [
    { id: 'lamport', nombre: 'Guía de relojes de Lamport', sub: 'Prioridad para el Control 3 y el Certamen 2' },
    { id: 'extra', nombre: 'Extras de la Unidad 2', sub: 'Quórum, 2PC, heartbeats y Raft también se programan' },
    { id: 'control', nombre: 'Control 01', sub: 'El formato real de la evaluación: esqueleto con TODO y puntaje' },
    { id: 'cert', nombre: 'Guía del Certamen 01', sub: 'Pipes, sockets y RPC: la base de todo lo demás' }
  ],
  temas: [
    { id: 'pipes', n: 'Pipes y fork' }, { id: 'sockets', n: 'Sockets TCP' }, { id: 'rpc', n: 'RPC' }, { id: 'integracion', n: 'Integración IPC' },
    { id: 'lamport', n: 'Lamport y orden' }, { id: 'vector', n: 'Vector clocks' }, { id: 'consistencia', n: 'Modelos de consistencia' },
    { id: 'cap', n: 'CAP, PACELC y 2PC' }, { id: 'replicacion', n: 'Replicación' }, { id: 'fallos', n: 'Fallos, heartbeats y quórum' }, { id: 'raft', n: 'Consenso y Raft' }
  ],
  /* Pestañas extra con código propio en cursos/redes/modulos/ */
  modulos: ['relojes', 'drills']
});
