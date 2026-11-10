/* Editor + ejecutor real (python3 runner/cognition_runner.py --puerto 7799 debe estar corriendo) */
const { JSDOM } = require('jsdom'); const fs = require('fs');
const html = fs.readFileSync(__dirname + '/index.test.html', 'utf8').replace(/<link[^>]*>/g, '');
const sleep = ms => new Promise(r => setTimeout(r, ms));
let errs = []; const ok = (c, m) => { if (!c) errs.push('FAIL ' + m); };
const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost:3000/#hoy', pretendToBeVisual: true, beforeParse(w) {
  w.scrollTo = () => {}; w.Element.prototype.scrollIntoView = () => {};
  w.fetch = async (url, opt = {}) => {
    if (url.startsWith('http://127.0.0.1:7777')) {
      const r = await fetch(url.replace('7777', '7799'), { ...opt, headers: { ...(opt.headers || {}), Origin: 'http://localhost:3000' }, signal: undefined });
      return { ok: r.ok, status: r.status, json: () => r.json() };
    }
    throw new Error('sin red');
  };
  w.navigator.clipboard = { writeText: async () => {} };
} });
const w = dom.window, d = w.document;
w.addEventListener('error', e => errs.push('ERR ' + e.message));
const click = sel => { const el = typeof sel === 'string' ? d.querySelector(sel) : sel; if (!el) throw new Error('no ' + sel); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); };
const escribir = txt => { const ed = d.querySelector('#ed'); ed.value = txt; ed.dispatchEvent(new w.Event('input', { bubbles: true })); };
const esperarFin = async () => { for (let i = 0; i < 400 && w.eval('RUN.corriendo'); i++) await sleep(50); await sleep(30); };
(async () => {
  await sleep(60);
  w.eval("cambiarCurso('redes')"); w.location.hash = '#ejercicios'; await sleep(30);
  click('[data-act=openEx][data-id="L06"]');
  click('[data-act=lugar][data-v=pantalla]'); await sleep(300);
  ok(w.eval('RUN.estado') === 'ok', 'ping al ejecutor: ' + w.eval('RUN.estado'));
  const ed = d.querySelector('#ed'); ok(ed && /TODO 3/.test(ed.value), 'editor con el esqueleto (solo TODO)');
  ok(d.querySelector('#gutter').textContent.split('\n').length === ed.value.split('\n').length, 'números de línea');
  click('[data-act=compilar]'); await esperarFin();
  ok(w.eval('RUN.ultimo.ok') === false && /pruebas que fallan/.test(d.querySelector('#resultados').textContent), 'esqueleto vacío: fallan las pruebas');
  const EX = w.eval("EXERCISES.find(e=>e.id==='L06')");
  escribir(w.eval('sinMarcas')(EX.files[0].code));
  click('[data-act=compilar]'); await esperarFin();
  ok(w.eval('RUN.ultimo.ok') === true && /Todas las pruebas pasaron/.test(d.querySelector('#resultados').textContent), 'solución correcta: todo pasa');
  ok(w.eval('P.topics.lamport.length') >= 1, 'registra progreso al pasar');
  /* error de compilación visible */
  escribir(d.querySelector('#ed').value.replace('n->clock++;', 'n->clock++'));
  click('[data-act=compilar]'); await esperarFin();
  ok(/No compila/.test(d.querySelector('#resultados').textContent) && /error/.test(d.querySelector('#resultados').textContent), 'muestra errores de gcc');
  /* borrador persiste y se puede reiniciar */
  w.eval("EJ.sel = null; render()"); click('[data-act=openEx][data-id="L06"]'); await sleep(20);
  ok(/n->clock\+\+\n/.test(d.querySelector('#ed').value) || d.querySelector('#ed').value.includes('n->clock++\n'), 'el borrador se conserva al volver');
  click('[data-act=edReset]'); ok(/TODO 3/.test(d.querySelector('#ed').value), 'reiniciar vuelve al esqueleto');
  /* ejercicio con 2 archivos: S1 servidor + cliente */
  w.eval("EJ.sel = null; render()"); click('[data-act=openEx][data-id="S1"]'); await sleep(20);
  const S1 = w.eval("EXERCISES.find(e=>e.id==='S1')"), sm = w.eval('sinMarcas');
  escribir(sm(S1.files[0].code)); click('[data-act=exFile][data-i="1"]'); escribir(sm(S1.files[1].code));
  click('[data-act=compilar]'); await esperarFin();
  ok(w.eval('RUN.ultimo.ok') === true, 'S1 con tus 2 archivos pasa');
  /* sin ejecutor: muestra la guía de instalación */
  w.eval("RUN.url = 'http://127.0.0.1:7777'.replace('7777','7');"); w.eval('RUN.estado="no"; render()');
  ok(/Conectar el compilador/.test(d.querySelector('#view').textContent) && d.querySelector('[data-act=compilar]').disabled, 'sin ejecutor: guía y botón deshabilitado');
  ok(d.querySelector('#view').textContent.includes('instalar.sh | bash -s -- http://localhost:3000'), 'el comando incluye el origen del sitio');
  /* modo papel sigue igual */
  click('[data-act=lugar][data-v=papel]'); ok(d.querySelector('pre.code') && !d.querySelector('#ed'), 'modo papel sin editor');
  console.log(errs.length ? errs.join('\n') : 'EDITOR OK'); process.exit(0);
})();
