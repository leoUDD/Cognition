/* Pruebas para el ejecutor local (opcional). Ver docs/NUEVO-CURSO.md → "Pruebas automáticas". */
Object.assign(pruebas, {
  'G1-1': { pasos: [{ tipo: 'ejecutar', nombre: 'suma([1, 2, 3]) imprime 6', cmd: 'python3 suma.py', espera: { salida: '6' } }] }
});
