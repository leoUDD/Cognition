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
  /* guía paso a paso, conceptos y glosario (ramo redes) */
  w.eval("cambiarCurso('redes')"); await go('ejercicios'); if (d.querySelector('[data-act=exBack]')) click('[data-act=exBack]');
  const conGuia = w.eval("EXERCISES.filter(e => e.files)");
  for (const ex of conGuia) {
    const bl = w.eval(`bloquesDe(EXERCISES.find(e => e.id === '${ex.id}'))`);
    ok(bl.length > 0 && bl.every(b => b.pregunta && b.pasos.length), 'cada TODO de ' + ex.id + ' tiene pregunta y pasos');
  }
  click('[data-act=openEx][data-id="L06"]');
  ok(d.querySelectorAll('.conceptos .chipbtn').length >= 3, 'conceptos del ejercicio: ' + d.querySelectorAll('.conceptos .chipbtn').length);
  click('[data-act=guiaAbrir]');
  ok(d.querySelectorAll('.gpaso').length === 3 && /Pregúntate/.test(d.querySelector('.gpaso').textContent), 'guía con 3 pasos y pregunta');
  click(d.querySelector('[data-act=guiaPasos]')); ok(d.querySelector('.gp-s'), 'muestra los pasos');
  ok(d.querySelector('.gpaso.glos .term'), 'la guía marca términos del glosario');
  const xpAntes = w.eval('earned().xp');
  click(d.querySelector('[data-act=guiaLinea]'));
  ok(d.querySelector('.gpaso pre.code') && /clock/.test(d.querySelector('.gpaso pre.code').textContent), 'revela la primera línea de código');
  ok(w.eval('penalizacionGuia()') === .75, 'penalización por usar la guía: ' + w.eval('penalizacionGuia()'));
  /* popover del glosario */
  const termino = d.querySelector('.term'); click(termino);
  ok(d.querySelector('#glospop.on') && d.querySelector('#glospop .gf-d').textContent.length > 20, 'el popover muestra la definición de "' + termino.textContent + '"');
  d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape' })); ok(!d.querySelector('#glospop.on'), 'Escape cierra el popover');
  w.eval("EJ.sel = null; render()"); click('[data-act=openEx][data-id="C01A"]');
  ok([...d.querySelectorAll('.card.glos .term')].some(t => /TCP|checksum|puerto/i.test(t.textContent)), 'el enunciado del Control 01 marca TCP, checksum o puerto');
  /* vista glosario + búsqueda */
  await go('glosario'); const n0 = d.querySelectorAll('.glos-list .card').length;
  ok(n0 > 90, 'glosario con ' + n0 + ' términos');
  const q = d.querySelector('#glosq'); q.value = 'quórum'; q.dispatchEvent(new w.Event('input', { bubbles: true }));
  ok(d.querySelectorAll('.glos-list .card').length >= 1 && d.querySelectorAll('.glos-list .card').length < 10, 'la búsqueda filtra');
  /* tarjetas: tu respuesta queda para comparar */
  await go('tarjetas'); if (d.querySelector('[data-act=cEnd]')) click('[data-act=cEnd]');
  click('[data-act=cStart][data-free="1"]');
  const ta = d.querySelector('#myans'); ta.value = 'mi respuesta de prueba'; ta.dispatchEvent(new w.Event('input', { bubbles: true }));
  click('[data-act=cShow]');
  ok(d.querySelector('.cmp-mia') && d.querySelector('.cmp-mia').textContent === 'mi respuesta de prueba', 'tu respuesta se muestra junto a la solución');
  click('[data-act=cRate][data-r=good]'); ok(d.querySelector('#myans') && d.querySelector('#myans').value === '', 'la siguiente tarjeta empieza vacía');
  /* tarjetas: calificación automática */
  await go('tarjetas'); if (d.querySelector('[data-act=cEnd]')) click('[data-act=cEnd]');
  w.eval("CV.queue = ['c03', 'c05']; CV.i = 0; CV.shown = false; CV.on = true; CV.done = 0; CV.mia = ''; render()");
  let ta2 = d.querySelector('#myans'); ta2.value = 'local suma 1, al enviar suma 1 y el mensaje lleva el reloj, al recibir max(L,T)+1'; ta2.dispatchEvent(new w.Event('input', { bubbles: true }));
  click('[data-act=cShow]');
  ok(/3 de 3 ideas clave/.test(d.querySelector('.autocal').textContent) && d.querySelector('.autocal.good'), 'respuesta completa: 3 de 3 y nota Bien');
  click('.autocal [data-act=cRate].primary'); ok(w.eval("P.cards.c03.box") >= 1 && w.eval('CV.i') === 1, 'Continuar aplica la nota sugerida');
  ta2 = d.querySelector('#myans'); ta2.value = 'porque si no el reloj podría retroceder'; ta2.dispatchEvent(new w.Event('input', { bubbles: true }));
  click('[data-act=cShow]');
  ok(d.querySelector('.autocal.again') && d.querySelectorAll('.autocal .checks li.bad').length === 2, 'respuesta incompleta: nota Otra vez y muestra lo que faltó');
  click('.autocal [data-act=cRate].primary');
  ok(w.eval('CV.queue[CV.queue.length - 1]') === 'c05' && w.eval("P.cards.c05.box") === 0, 'con nota baja la tarjeta vuelve en la misma sesión');
  click('[data-act=cShow]'); ok(!d.querySelector('.autocal') && d.querySelector('.rate'), 'sin respuesta escrita: calificación manual');
  /* dos columnas y referencia de C */
  w.eval("cambiarCurso('redes')"); await go('ejercicios'); if (d.querySelector('[data-act=exBack]')) click('[data-act=exBack]');
  click('[data-act=openEx][data-id="C01A"]');
  ok(d.querySelector('#view').classList.contains('ancho') && d.querySelector('.ws-izq .card.glos') && /Enunciado/.test(d.querySelector('.ws-izq').textContent), 'enunciado en la columna izquierda');
  ok(d.querySelector('.ws-der pre.code') || d.querySelector('.ws-der #ed'), 'código en la columna derecha');
  ok(d.querySelectorAll('.patrones .chipbtn').length === 3, 'C01A muestra sus 3 patrones');
  click('.patrones .chipbtn'); ok(d.querySelector('#refpanel.on #ref-p-servidor.destacada'), 'tocar un patrón abre su esqueleto destacado');
  ok(d.querySelector('#ref-p-servidor details.ref-partes').open && !d.querySelector('#refpanel #ref-p-cliente details.ref-partes').open, 'el patrón destacado abre su "pieza por pieza"; los demás quedan cerrados');
  ok(/htons/.test(d.querySelector('#ref-p-servidor .rp-tabla').textContent) && d.querySelector('#ref-p-servidor .ref-recuerda'), 'pieza por pieza explica htons y trae "para recordar"');
  d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape' }));
  click('.row [data-act=refAbrir]');
  ok(d.querySelector('#refpanel.on') && d.querySelectorAll('#refpanel .ref').length >= 20, 'panel de sintaxis con ' + d.querySelectorAll('#refpanel .ref').length + ' entradas');
  const rq = d.querySelector('#refpq'); rq.value = 'strcmp'; rq.dispatchEvent(new w.Event('input', { bubbles: true }));
  const nres = d.querySelectorAll('#refpanel .ref').length; ok(nres >= 1 && nres < 6, 'la búsqueda del panel filtra (' + nres + ')');
  rq.value = 'caja apuntada por ts'; rq.dispatchEvent(new w.Event('input', { bubbles: true }));
  ok(d.querySelector('#refpanel #ref-punteros'), 'la búsqueda también encuentra texto de "pieza por pieza"');
  ok(d.querySelector('.ws-izq'), 'el ejercicio sigue abierto detrás del panel');
  d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape' })); ok(!d.querySelector('#refpanel.on'), 'Escape cierra el panel');
  w.eval("EJ.sel = null; render()"); click('[data-act=openEx][data-id="L01"]');
  ok(!d.querySelector('.ws') && !d.querySelector('#view').classList.contains('ancho'), 'ejercicio sin código: una columna');
  await go('referencia'); ok(/Patrones del curso/.test(d.querySelector('#view').textContent) && d.querySelectorAll('#view .ref').length >= 20, 'pestaña Sintaxis de C');
  const pz = d.querySelector('#view #ref-punteros details.ref-partes');
  ok(pz && pz.open && d.querySelectorAll('#view #ref-punteros .rp-fila').length >= 8 && /\(\*n\)\.clock/.test(pz.textContent), 'punteros: pieza por pieza abierta en la pestaña');
  ok(d.querySelectorAll('#view .ref details.ref-partes').length === d.querySelectorAll('#view .ref').length, 'todas las entradas tienen pieza por pieza');
  ok(d.querySelector('#view .ref').id === 'ref-simbolos', 'la primera entrada es "Cómo leer los símbolos"');
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
