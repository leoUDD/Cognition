/* Prueba la app completa en jsdom usando test/index.test.html (incluye cursos/_plantilla).
   Antes: node app/build.cjs --todos --out=test/index.test.html */
const { JSDOM } = require('jsdom'); const fs = require('fs');
const html = fs.readFileSync(__dirname + '/index.test.html', 'utf8').replace(/<link[^>]*>/g, '');
const STORE = {}; let mode = 'ok';
function makeDom(preset) {
  return new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/#hoy', pretendToBeVisual: true,
    beforeParse(w) {
      w.scrollTo = () => {};
      if (preset) for (const [k, v] of Object.entries(preset)) w.localStorage.setItem(k, v);
      w.fetch = async (url, opt = {}) => { await new Promise(r => setTimeout(r, 5));
        if (mode === 'noserver') return { ok: false, status: 503, json: async () => ({}) };
        if (mode === 'offline') throw new Error('net');
        const code = new URL(url, 'http://x').searchParams.get('code');
        if ((opt.method || 'GET') === 'GET') return { ok: true, status: 200, json: async () => ({ data: STORE[code] ? JSON.parse(STORE[code]) : null }) };
        STORE[code] = opt.body; return { ok: true, status: 200, json: async () => ({ ok: true }) }; };
      w.navigator.clipboard = { writeText: async () => {} };
    } });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
let errs = []; const ok = (c, m) => { if (!c) errs.push('FAIL ' + m); };
(async () => {
  /* migración: progreso guardado con la versión anterior (Cuaderno de Redes) */
  const viejo = { xp: 123, streak: 2, cards: { c01: { box: 2, due: '2099-01-01' } }, papel: { L01: { best: 80, last: 80, due: '2099-01-01', n: 1 } }, topics: { lamport: [1, 1] }, exams: { control: '2026-11-20', certamen: '' } };
  const dom = makeDom({ 'cuaderno-redes-v1': JSON.stringify(viejo) }), w = dom.window, d = w.document;
  w.addEventListener('error', e => errs.push('ERR ' + e.message));
  const click = sel => { const el = typeof sel === 'string' ? d.querySelector(sel) : sel; if (!el) throw new Error('no ' + sel); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); };
  const go = async h => { w.location.hash = '#' + h; await sleep(20); };
  await sleep(50);
  ok(w.eval('S.v') === 2 && w.eval('S.xp') === 123, 'migra xp');
  ok(w.eval('S.curso') === 'redes', 'migra al ramo redes');
  ok(w.eval('P.papel.L01.best') === 80 && w.eval('P.exams.control') === '2026-11-20', 'migra progreso del ramo');
  ok(d.querySelector('#cursosel'), 'selector de ramos visible con 2 ramos');

  async function probarCurso(id) {
    w.eval(`cambiarCurso('${id}')`); await sleep(20);
    ok(w.eval('CUR.id') === id, 'activo ' + id);
    const EX = w.eval('EXERCISES'), tabs = w.eval('tabsCurso()').map(t => t[0]);
    for (const ex of EX) {
      await go('ejercicios'); if (d.querySelector('[data-act=exBack]')) click('[data-act=exBack]');
      click(`[data-act=openEx][data-id="${ex.id}"]`); await sleep(5);
      ok(d.querySelector('h1').textContent === ex.title, 'titulo ' + ex.id);
      if (ex.files) for (const m of ['alto', 'medio', 'ninguno']) {
        click(`[data-act=exMode][data-v=${m}]`);
        if (m === 'alto') { const t = d.querySelector('pre.code').textContent; ok(/\?\?\?/.test(t), 'alto oculta ' + ex.id); ok(!/(\/\/|#)(§|@TODO|@END)/.test(t), 'sin marcas ' + ex.id); }
      }
      if (ex.fields) {
        for (const f of ex.fields) { if (f.type === 'opt') click(d.querySelector(`[data-act=fldPick][data-k="${f.k}"][data-v="${f.ans[0]}"]`)); else { const i = d.querySelector(`[data-fld="${f.k}"]`); i.value = f.ans[0]; i.dispatchEvent(new w.Event('input', { bubbles: true })); } }
        click('[data-act=fldCheck]'); ok(w.eval('P.papel')[ex.id].best === 100, '100 ' + ex.id);
      }
      if (ex.rubric) {
        click('[data-act=exReveal]');
        d.querySelectorAll('[data-act=exTick]').forEach(c => { c.checked = true; c.dispatchEvent(new w.Event('change', { bubbles: true })); });
        click('[data-act=exSave]'); ok(w.eval('P.papel')[ex.id].best === 100, 'rubrica ' + ex.id);
      }
      ok(/Cómo pensarlo/.test(d.querySelector('#view').innerHTML), 'solucion ' + ex.id);
    }
    for (const v of tabs) { await go(v); ok(d.querySelector('#view').innerHTML.length > 200, 'vista ' + id + '/' + v); }
    await go('tarjetas'); click('[data-act=cStart][data-free="1"]'); click('[data-act=cShow]'); click('[data-act=cRate][data-r=good]');
    return { EX, tabs };
  }
  const r1 = await probarCurso('redes');
  ok(r1.tabs.includes('relojes') && r1.tabs.includes('drills'), 'redes tiene sus módulos');
  ok(w.eval("EXERCISES.find(e=>e.id==='R2').comandos")['r2_nauvoo.c'].includes('-lm'), 'comando -lm');
  const r2 = await probarCurso('plantilla');
  ok(!r2.tabs.includes('relojes'), 'plantilla sin módulos de redes');
  await go('relojes'); ok(w.eval('cur') === 'hoy', 'módulo ajeno no accesible');
  await go('ejercicios'); if (d.querySelector('[data-act=exBack]')) click('[data-act=exBack]'); click('[data-act=openEx][data-id="G1-1"]'); click('[data-act=exMode][data-v=alto]');
  ok(d.querySelector('pre.code').textContent.includes('# ???'), 'comentarios estilo python');
  ok(d.querySelector('pre.code .tk-k'), 'resaltado python');
  ok(w.eval("S.cursos.redes.papel.L01.best") === 100 && w.eval("!S.cursos.plantilla.papel.L01"), 'progreso separado por ramo');
  /* sincronización entre dos dispositivos */
  await go('hoy'); click('[data-act=syNew]'); await sleep(80);
  const code = w.eval('SY.code'); ok(/^[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}$/.test(code), 'codigo');
  const dom2 = makeDom(), w2 = dom2.window, d2 = w2.document; await sleep(60);
  const inp = d2.querySelector('#sycode'); inp.value = code; inp.dispatchEvent(new w2.Event('input', { bubbles: true }));
  d2.querySelector('[data-act=syJoin]').dispatchEvent(new w2.MouseEvent('click', { bubbles: true }));
  d2.querySelector('[data-act=syJoinYes]').dispatchEvent(new w2.MouseEvent('click', { bubbles: true })); await sleep(80);
  ok(w2.eval('S.xp') === w.eval('S.xp') && w2.eval('Object.keys(S.cursos).length') === 2, 'B recibe ambos ramos');
  ok(w2.eval('CUR.id') === w.eval('CUR.id'), 'B abre el mismo ramo');
  const xpA = w.eval('S.xp'); w2.eval('addXp(50)'); await sleep(1500);
  await w.eval('syncPull()'); ok(w.eval('S.xp') === xpA + 50, 'A recibe cambios de B');
  mode = 'noserver'; await w.eval('syncPull()'); ok(w.eval('SY.status') === 'noserver', 'noserver');
  mode = 'offline'; await w.eval('syncPull()'); ok(w.eval('SY.status') === 'offline', 'offline');
  console.log(errs.length ? errs.slice(0, 20).join('\n') : 'ALL OK', '·', r1.EX.length + r2.EX.length, 'ejercicios en 2 ramos');
  process.exit(0);
})();
