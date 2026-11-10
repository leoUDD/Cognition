/* Cada tarjeta, respondida con su propia respuesta oficial, debe sacar nota "good". */
const fs = require('fs'), vm = require('vm'), path = require('path');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../app/core.js'), 'utf8') + ';this.cal = calificarRespuesta; this.nota = notaDe;', ctx);
let malos = 0;
for (const dir of fs.readdirSync(path.join(__dirname, '../cursos'))) {
  const base = path.join(__dirname, '../cursos', dir), t = [], c = {};
  if (!fs.existsSync(path.join(base, 'claves.js'))) continue;
  vm.runInNewContext(fs.readFileSync(path.join(base, 'tarjetas.js'), 'utf8'), { tarjetas: t });
  vm.runInNewContext(fs.readFileSync(path.join(base, 'claves.js'), 'utf8'), { claves: c });
  for (const card of t) {
    if (!c[card.id]) continue;
    const r = ctx.cal(card.a, c[card.id]), ok = r.filter(x => x.ok).length;
    if (ctx.nota(ok / r.length) !== 'good') { malos++; console.log(`${dir}/${card.id}: ${ok}/${r.length} — faltan: ${r.filter(x => !x.ok).map(x => x.label).join(' | ')}`); }
  }
}
console.log(malos ? `${malos} tarjetas no reconocen su propia respuesta` : 'CLAVES OK: todas las respuestas oficiales sacan "good"');
process.exit(malos ? 1 : 0);
