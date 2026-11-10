/* Cada archivo de esta carpeta agrega ejercicios con ejercicios.push({...}, {...}) */
ejercicios.push(
{
  id: 'G1-1', group: 'guia1', n: 'Ej. 1', topic: 'listas', lvl: 1, min: 8, title: 'Suma de una lista',
  statement: '<p>Implementa <code>suma(xs)</code> sin usar <code>sum()</code>.</p>',
  files: ['ejemplo/suma.py'],
  out: '6',
  hints: ['Usa un acumulador que parte en 0.'],
  think: ['Recorre la lista sumando cada elemento al acumulador.', 'Retorna el acumulador.'],
  errors: ['Partir el acumulador en el primer elemento y fallar con la lista vacía.'],
  rubric: [{ pts: 2, t: 'Acumulador inicializado en 0' }, { pts: 2, t: 'Recorrido correcto' }, { pts: 1, t: 'Retorna el resultado' }]
},
{
  id: 'G1-2', group: 'guia1', n: 'Ej. 2', topic: 'bases', lvl: 1, min: 3, title: 'Pregunta con autocorrección',
  statement: '<p>¿Cuánto vale <code>len([1, [2, 3], 4])</code>?</p>',
  fields: [{ k: 'r', label: 'Resultado', ans: ['3'] }, { k: 't', label: '¿Las listas son mutables?', type: 'opt', opts: ['Sí', 'No'], ans: ['Sí'] }],
  think: ['La lista interna cuenta como un solo elemento: 3.']
}
);
