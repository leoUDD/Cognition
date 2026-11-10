/* Ejecuta cada solución de referencia a través del ejecutor local: todas deben pasar sus pruebas.
   Uso: python3 runner/cognition_runner.py --puerto 7799 &   y luego   node test/runner.test.mjs [ID...] */
import fs from 'node:fs';
const html = fs.readFileSync(process.env.HTML || new URL('../index.html', import.meta.url), 'utf8');
const CURSOS = JSON.parse(html.match(/const CURSOS = (.*);\n/)[1]);
const URL_ = process.env.RUNNER || 'http://127.0.0.1:7799';
const solo = process.argv.slice(2);
const sinMarcas = code => code.split('\n').filter(l => !/^\s*(\/\/|#|--)@(TODO|END)/.test(l)).map(l => l.replace(/\s*(\/\/|#|--)§\s*$/, '')).join('\n');
let fallos = 0;
for (const c of CURSOS) for (const e of c.ejercicios.filter(x => x.pruebas && (!solo.length || solo.includes(x.id)))) {
  const archivos = e.files.map(f => ({ nombre: f.name, codigo: sinMarcas(f.code) }))
    .concat(Object.entries(e.pruebas.archivos).map(([n, codigo]) => ({ nombre: n, codigo: n.endsWith('.c') && n.startsWith('ref/') ? sinMarcas(codigo) : codigo })));
  const t0 = Date.now();
  const r = await fetch(URL_ + '/ejecutar', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Cognition': '1', Origin: 'http://localhost:3000' },
    body: JSON.stringify({ archivos, compilar: e.pruebas.compilar, pasos: e.pruebas.pasos }) }).then(x => x.json());
  const checks = (r.pasos || []).flatMap(p => p.checks), malos = checks.filter(x => !x.ok);
  const comp = (r.compilacion || []).filter(x => !x.ok || x.mensajes.trim());
  console.log(`${r.ok ? 'OK  ' : 'MAL '} ${c.id}/${e.id.padEnd(5)} ${String(checks.length).padStart(2)} checks  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  if (!r.ok || comp.length) { fallos++; console.log(JSON.stringify({ comp, malos, error: r.error, pasos: (r.pasos || []).filter(p => !p.ok).map(p => ({ n: p.nombre, salida: p.salida.slice(0, 400) })) }, null, 1)); }
}
console.log(fallos ? `${fallos} ejercicios con problemas` : 'RUNNER OK');
process.exit(fallos ? 1 : 0);
