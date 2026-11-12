/* En el nivel de ayuda "alto" (líneas clave ocultas) no deben quedar llaves huérfanas:
   en lo visible, cada "}" debe tener su "{". */
const fs = require('fs'), vm = require('vm'), path = require('path');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../app/core.js'), 'utf8') + ';this.render = renderCode;', ctx);
let malos = 0, n = 0;
const raiz = path.join(__dirname, '../cursos');
for (const curso of fs.readdirSync(raiz)) {
  const sol = path.join(raiz, curso, 'soluciones');
  if (!fs.existsSync(sol)) continue;
  for (const ej of fs.readdirSync(sol)) for (const f of fs.readdirSync(path.join(sol, ej))) {
    if (!/\.(c|h|cpp|java|js)$/.test(f)) continue;
    const src = fs.readFileSync(path.join(sol, ej, f), 'utf8');
    if (!src.includes('@TODO')) continue;
    n++;
    const visible = ctx.render(src, 'alto', 'c').replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, '');
    let prof = 0, min = 0;
    for (const ch of visible) { if (ch === '{') prof++; if (ch === '}') { prof--; min = Math.min(min, prof); } }
    if (prof !== 0 || min < 0) { malos++; console.log(`${curso}/${ej}/${f}: llaves desbalanceadas en el nivel "líneas clave ocultas" (${prof})`); }
  }
}
console.log(malos ? `${malos} archivos con llaves huérfanas` : `LLAVES OK: ${n} archivos sin llaves huérfanas al ocultar líneas clave`);
process.exit(malos ? 1 : 0);
