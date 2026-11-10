/* Construye index.html a partir de app/ (motor) y cursos/ (contenido).
   Uso: node app/build.cjs            → index.html con los ramos de cursos/ (salta los que empiezan con "_")
        node app/build.cjs --todos     → incluye también los "_" (lo usan las pruebas) */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..'), APP = __dirname, CURSOS_DIR = path.join(ROOT, 'cursos');
const todos = process.argv.includes('--todos');
const out = (process.argv.find(a => a.startsWith('--out=')) || '--out=index.html').slice(6);
const EXT_LANG = { '.c': 'c', '.h': 'c', '.cpp': 'cpp', '.java': 'java', '.js': 'js', '.py': 'python', '.sql': 'sql' };
const errores = [];
const fallo = (curso, msg) => errores.push(`[${curso}] ${msg}`);

function cargarCurso(dir) {
  const base = path.join(CURSOS_DIR, dir);
  const curso = {}, ejercicios = [], tarjetas = [], glosario = [];
  const correr = f => vm.runInNewContext(fs.readFileSync(f, 'utf8'), { curso, ejercicios, tarjetas, glosario }, { filename: f });
  if (!fs.existsSync(path.join(base, 'curso.js'))) { fallo(dir, 'falta curso.js'); return null; }
  correr(path.join(base, 'curso.js'));
  const ls = d => fs.existsSync(d) ? fs.readdirSync(d).filter(f => f.endsWith('.js')).sort().map(f => path.join(d, f)) : [];
  ls(path.join(base, 'ejercicios')).forEach(correr);
  if (fs.existsSync(path.join(base, 'tarjetas.js'))) correr(path.join(base, 'tarjetas.js'));
  if (fs.existsSync(path.join(base, 'glosario.js'))) correr(path.join(base, 'glosario.js'));
  const id = curso.id || dir;
  /* validación: mensajes claros para quien agregue contenido */
  ['nombre'].forEach(k => { if (!curso[k]) fallo(id, `curso.js: falta "${k}"`); });
  const temas = new Set((curso.temas || []).map(t => t.id)), grupos = new Set((curso.grupos || []).map(g => g.id));
  const ids = new Set();
  ejercicios.forEach(e => {
    const q = `ejercicio ${e.id || '(sin id)'}`;
    ['id', 'title', 'statement', 'topic', 'group'].forEach(k => { if (!e[k]) fallo(id, `${q}: falta "${k}"`); });
    if (ids.has(e.id)) fallo(id, `${q}: id repetido`); ids.add(e.id);
    if (e.topic && !temas.has(e.topic)) fallo(id, `${q}: el tema "${e.topic}" no está en curso.temas`);
    if (e.group && !grupos.has(e.group)) fallo(id, `${q}: el grupo "${e.group}" no está en curso.grupos`);
    if (!e.rubric && !e.fields) fallo(id, `${q}: necesita "rubric" (autoevaluación) o "fields" (autocorrección)`);
    if (!e.think) fallo(id, `${q}: falta "think" (explicación de la solución)`);
    e.n = e.n || e.id; e.lvl = e.lvl || 1; e.min = e.min || 10;
    if (e.files) e.files = e.files.map(f => {
      const p = path.join(base, 'soluciones', f);
      if (!fs.existsSync(p)) { fallo(id, `${q}: no existe soluciones/${f}`); return { name: path.basename(f), code: '' }; }
      return { name: path.basename(f), code: fs.readFileSync(p, 'utf8') };
    });
    if (!e.lang && e.files && e.files[0]) e.lang = EXT_LANG[path.extname(e.files[0].name)] || curso.lenguaje;
  });
  const tids = new Set();
  tarjetas.forEach(t => {
    if (!t.id || !t.q || !t.a) fallo(id, `tarjeta ${t.id || '?'}: necesita id, q y a`);
    if (tids.has(t.id)) fallo(id, `tarjeta ${t.id}: id repetido`); tids.add(t.id);
    if (!temas.has(t.t)) fallo(id, `tarjeta ${t.id}: el tema "${t.t}" no está en curso.temas`);
  });
  /* pruebas para el ejecutor local (opcional): pruebas.js + carpeta pruebas/ */
  const pjs = path.join(base, 'pruebas.js');
  if (fs.existsSync(pjs)) {
    const pruebas = {};
    vm.runInNewContext(fs.readFileSync(pjs, 'utf8'), { pruebas, ejercicios }, { filename: pjs });
    for (const [eid, plan] of Object.entries(pruebas)) {
      const e = ejercicios.find(x => x.id === eid);
      if (!e) { fallo(id, `pruebas.js: no existe el ejercicio ${eid}`); continue; }
      if (!e.files) { fallo(id, `pruebas.js: ${eid} no tiene archivos de código`); continue; }
      const nombres = new Set(e.files.map(f => f.name)), archivos = {};
      const usar = ref => {
        if (ref.startsWith('prueba/')) {
          const p = path.join(base, 'pruebas', ref.slice(7));
          if (!fs.existsSync(p)) fallo(id, `pruebas.js (${eid}): no existe pruebas/${ref.slice(7)}`); else archivos[ref] = fs.readFileSync(p, 'utf8');
        } else if (ref.startsWith('ref/')) {
          /* ref/<archivo> = solución de este ejercicio; ref/<ID>/<archivo> = solución de otro ejercicio */
          const partes = ref.slice(4).split('/'), otro = partes.length === 2 ? ejercicios.find(x => x.id === partes[0]) : e;
          const f = otro && otro.files && otro.files.find(x => x.name === partes[partes.length - 1]);
          if (!f) fallo(id, `pruebas.js (${eid}): ${ref} no corresponde a ninguna solución`); else archivos[ref] = f.code;
        } else if (!nombres.has(ref)) fallo(id, `pruebas.js (${eid}): ${ref} no es un archivo del ejercicio`);
      };
      (plan.compilar || []).forEach(c => c.src.forEach(usar));
      (plan.pasos || []).forEach(p => { if (p.archivo) usar(p.archivo); });
      e.pruebas = { compilar: plan.compilar || [], pasos: plan.pasos || [], archivos };
    }
  }
  const gids = new Set();
  glosario.forEach(g => {
    if (!g.id || !g.t || !g.def) fallo(id, `glosario ${g.id || '?'}: necesita id, t y def`);
    if (gids.has(g.id)) fallo(id, `glosario ${g.id}: id repetido`); gids.add(g.id);
  });
  glosario.forEach(g => (g.ver || []).forEach(v => { if (!gids.has(v)) fallo(id, `glosario ${g.id}: "ver" apunta a ${v}, que no existe`); }));
  const modulos = ls(path.join(base, 'modulos')).map(f => `/* ---- ${dir}/modulos/${path.basename(f)} ---- */\n` + fs.readFileSync(f, 'utf8')).join('\n');
  return { config: { ...curso, id, ejercicios, tarjetas, glosario }, modulos };
}

const dirs = fs.readdirSync(CURSOS_DIR).filter(d => fs.statSync(path.join(CURSOS_DIR, d)).isDirectory() && (todos || !d.startsWith('_'))).sort();
const cursos = dirs.map(cargarCurso).filter(Boolean);
if (errores.length) { console.error('Errores en el contenido:\n  ' + errores.join('\n  ')); process.exit(1); }
if (!cursos.length) { console.error('No hay ramos en cursos/.'); process.exit(1); }

const read = f => fs.readFileSync(path.join(APP, f), 'utf8');
const sinExports = js => js.replace(/if \(typeof module !== 'undefined'\) module\.exports[^\n]*/g, '');
const js = [
  'const CURSOS = ' + JSON.stringify(cursos.map(c => c.config)) + ';',
  sinExports(read('core.js')), read('sync.js'), read('ui.js'), read('editor.js'), read('guia.js'),
  ...cursos.map(c => c.modulos),
  'activarCurso(S.curso); route(); syncPull();'
].join('\n');
const html = read('template.html').replace('/*CSS*/', () => read('style.css')).replace('/*JS*/', () => js);
fs.writeFileSync(path.join(ROOT, out), html);
console.log(`${out}: ${(html.length / 1024).toFixed(0)} KB · ` + cursos.map(c => `${c.config.id} (${c.config.ejercicios.length} ejercicios, ${c.config.tarjetas.length} tarjetas)`).join(' · '));
