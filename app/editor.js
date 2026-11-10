/* ===== Editor en pantalla + ejecutor local (WSL) ===== */
const RUN = { estado: 'desconocido', info: null, url: '', ultimo: null, corriendo: false, verAyuda: false };
try { RUN.url = localStorage.getItem('cognition-runner-url') || 'http://127.0.0.1:7777'; } catch (e) { RUN.url = 'http://127.0.0.1:7777'; }
let LUGAR = 'papel';
try { LUGAR = localStorage.getItem('cognition-lugar') || 'papel'; } catch (e) { }
const BKEY = 'cognition-borradores';
function borradores() { try { return JSON.parse(localStorage.getItem(BKEY) || '{}'); } catch (e) { return {}; } }
function borrador(ex, f) { const b = borradores(); return ((b[CUR.id] || {})[ex.id] || {})[f.name]; }
function guardarBorrador(ex, nombre, code) {
  const b = borradores(); b[CUR.id] = b[CUR.id] || {}; b[CUR.id][ex.id] = b[CUR.id][ex.id] || {}; b[CUR.id][ex.id][nombre] = code;
  try { localStorage.setItem(BKEY, JSON.stringify(b)); } catch (e) { }
}
function borrarBorrador(ex, nombre) { const b = borradores(); if (b[CUR.id] && b[CUR.id][ex.id]) { delete b[CUR.id][ex.id][nombre]; try { localStorage.setItem(BKEY, JSON.stringify(b)); } catch (e) { } } }
const codigoInicial = (ex, f) => renderCode(f.code, EJ.mode === 'ninguno' ? 'medio' : EJ.mode, langOf(ex));
const textoEditor = (ex, f) => borrador(ex, f) ?? (EJ.mode === 'ninguno' ? '' : codigoInicial(ex, f));
const sinMarcas = code => code.split('\n').filter(l => !/^\s*(\/\/|#|--)@(TODO|END)/.test(l)).map(l => l.replace(/\s*(\/\/|#|--)§\s*$/, '')).join('\n');

const vistoRunner = () => { try { return localStorage.getItem('cognition-runner-visto') === '1'; } catch (e) { return false; } };
/* Abre cognition:// (registrado por el instalador): Windows inicia el ejecutor oculto en WSL.
   Debe llamarse desde un clic (el navegador lo exige). Luego espera hasta 25 s a que responda. */
async function iniciarRunner() {
  if (RUN.estado === 'ok' || RUN.estado === 'iniciando') return;
  RUN.estado = 'iniciando'; render();
  try { location.href = 'cognition://iniciar'; } catch (e) { }
  for (let i = 0; i < 35; i++) {
    await new Promise(r => setTimeout(r, 700));
    await pingRunner(true);
    if (RUN.estado === 'ok' || RUN.estado === 'origen' || RUN.estado === 'singcc') break;
    RUN.estado = 'iniciando';
  }
  if (RUN.estado === 'iniciando') RUN.estado = 'noinicia';
  render();
}
/* Mientras la página esté abierta, avisa al ejecutor cada 20 s; al cerrarla, le pide apagarse */
setInterval(() => { if (RUN.estado === 'ok') pingRunner(true).then(() => { if (RUN.estado !== 'ok' && cur === 'ejercicios') render(); }); }, 20000);
window.addEventListener('pagehide', () => { if (RUN.estado === 'ok' && navigator.sendBeacon) navigator.sendBeacon(RUN.url + '/cerrar', ''); });
async function pingRunner(silencioso) {
  if (!silencioso) RUN.estado = 'buscando';
  try {
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 1500);
    const r = await fetch(RUN.url + '/salud', { signal: ctl.signal }); clearTimeout(t);
    if (r.status === 403) { RUN.estado = 'origen'; return; }
    RUN.info = await r.json(); RUN.estado = RUN.info.gcc ? 'ok' : 'singcc';
    if (RUN.estado === 'ok') try { localStorage.setItem('cognition-runner-visto', '1'); } catch (e) { }
  } catch (e) { RUN.estado = 'no'; }
}
function chipRunner() {
  const t = { desconocido: ['', 'ejecutor: sin revisar'], buscando: ['', 'buscando ejecutor…'], iniciando: ['', 'iniciando compilador…'], noinicia: ['err', 'el compilador no arrancó'], ok: ['ok', 'ejecutor conectado'], no: ['err', 'ejecutor no encontrado'], origen: ['err', 'ejecutor: sitio no autorizado'], singcc: ['err', 'ejecutor sin gcc'] }[RUN.estado];
  return `<span class="syncchip ${t[0]}">${t[1]}</span>`;
}
function ayudaRunner() {
  const origen = location.origin.startsWith('http') ? location.origin : 'https://TU-APP.vercel.app';
  const cmd = (txt) => `<div class="cmdrow"><pre class="code cmd">${esc(txt)}</pre><button class="btn sm" data-act="copiar" data-txt="${esc(txt)}">Copiar</button></div>`;
  const motivo = { noinicia: 'El compilador no respondió. Si nunca lo instalaste, sigue los pasos de abajo. Si ya lo hiciste, revisa que Chrome no haya bloqueado el enlace (ícono a la derecha de la barra de direcciones) o inícialo a mano: en Ubuntu escribe <code>cognition</code>.', origen: 'El ejecutor está corriendo, pero no autorizó a este sitio. Repite el paso 2 con el comando de esta página.', singcc: 'El ejecutor corre, pero falta gcc: ejecuta el paso 2.' }[RUN.estado] || '';
  const visto = vistoRunner();
  return `<div class="card stack" style="gap:10px"><h3 style="margin:0">Compilador apagado</h3>
  <p class="small muted" style="margin:0">El compilador es un programa pequeño que corre en el Linux de tu PC (WSL). Se enciende cuando lo pides aquí y se apaga solo cuando cierras la página: no queda nada corriendo.</p>
  <div class="row"><button class="btn primary" data-act="runIniciar" ${RUN.estado === 'iniciando' ? 'disabled' : ''}>${RUN.estado === 'iniciando' ? 'Iniciando… (WSL tarda unos segundos)' : 'Iniciar compilador'}</button><button class="btn sm" data-act="runPing">Ya está abierto: revisar</button>${chipRunner()}</div>
  <p class="small muted" style="margin:0">La primera vez Chrome pregunta si quieres abrir <b>Cognition</b>: marca <b>“Permitir siempre”</b> y acepta. Si pregunta por acceso a la red local, elige <b>Permitir</b>.</p>
  ${motivo ? `<div class="callout warn small">${motivo}</div>` : ''}
  <details class="small" ${visto ? '' : 'open'}><summary><b>Primera vez: instalarlo</b> (una sola vez)</summary>
  <ol class="clean small">
   <li><b>En PowerShell</b>, revisa que tengas Ubuntu: ${cmd('wsl -l -v')}
   Si no aparece, instálalo (PowerShell <b>como administrador</b>, luego reinicia el PC): ${cmd('wsl --install')}
   Si Ubuntu no tiene el <code>*</code> (por ejemplo, porque tienes Docker), déjalo como predeterminado: ${cmd('wsl --set-default Ubuntu')}</li>
   <li><b>Entra a Ubuntu</b> (escribe <code>wsl</code> en PowerShell) y pega este comando. Instala gcc si falta, descarga el ejecutor y registra el enlace <code>cognition://</code> para que esta página pueda encenderlo: ${cmd(`curl -fsSL ${origen}/runner/instalar.sh | bash -s -- ${origen}`)}
   Cuando termine dirá <i>“Listo”</i>. Ya puedes cerrar Ubuntu.</li>
   <li>Presiona <b>Iniciar compilador</b> (arriba).</li>
  </ol>
  </details>
  <details class="small"><summary>Sin el enlace cognition:// (a mano)</summary>
   ${cmd(`curl -fsSL ${origen}/runner/cognition_runner.py -o ~/cognition_runner.py`)}
   ${cmd(`python3 ~/cognition_runner.py --origen ${origen}`)} y deja esa ventana abierta mientras estudias (Ctrl+C para apagarlo).</details>
  <details class="small"><summary>Desinstalar</summary>${cmd('~/.cognition/desinstalar.sh')}</details>
  <details class="small"><summary>Sigue sin conectar</summary><p>En Ubuntu ejecuta <code>pkill -f cognition_runner.py; cognition --host 0.0.0.0</code> y deja la dirección en <code>http://127.0.0.1:7777</code>. Revisa también el registro: <code>tail ~/.cognition/ejecutor.log</code>. Si cambiaste el puerto, ajústala aquí:</p>
   <div class="row"><input type="text" id="runurl" value="${esc(RUN.url)}" style="font-family:var(--f-mono);width:240px" aria-label="Dirección del ejecutor"><button class="btn sm" data-act="runUrl">Guardar</button></div></details>
  <div class="row"><button class="btn primary" data-act="runPing">Reintentar</button>${chipRunner()}</div></div>`;
}
function editorHtml(ex) {
  const files = ex.files, f = files[EJ.file];
  const lineas = textoEditor(ex, f).split('\n').length;
  const listo = RUN.estado === 'ok';
  return `<div class="card stack" style="gap:10px">
   <div class="row spread"><div class="row">${files.length > 1 ? files.map((x, i) => `<button class="opt ${EJ.file === i ? 'on' : ''}" data-act="exFile" data-i="${i}">${esc(x.name)}${borrador(ex, x) !== undefined ? ' •' : ''}</button>`).join('') : `<b class="mono">${esc(f.name)}</b>`}</div>${chipRunner()}</div>
   <div class="editor"><div class="gutter" id="gutter" aria-hidden="true">${Array.from({ length: Math.max(lineas, 1) }, (_, i) => i + 1).join('\n')}</div>
   <div class="ed-area"><pre class="ed-hl" id="edhl" aria-hidden="true">${highlight(textoEditor(ex, f), langOf(ex)) + '\n'}</pre>
   <textarea id="ed" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" aria-label="Editor de ${esc(f.name)}">${esc(textoEditor(ex, f))}</textarea></div></div>
   <div class="row spread"><div class="row">
     <button class="btn primary" data-act="compilar" ${listo && !RUN.corriendo ? '' : 'disabled'}>${RUN.corriendo ? 'Compilando y probando…' : 'Compilar y probar'}</button>
     <button class="btn sm" data-act="edReset">Reiniciar ${esc(f.name)}</button></div>
     <span class="muted small">Tab = 4 espacios · se guarda solo en este navegador</span></div>
   ${!ex.pruebas ? '<div class="callout small">Este ejercicio no tiene pruebas automáticas: el ejecutor solo puede compilarlo.</div>' : ''}
   <div id="resultados">${resultadosHtml()}</div></div>
   ${listo ? '' : ayudaRunner()}`;
}
function resultadosHtml() {
  const r = RUN.ultimo; if (!r) return '';
  if (r.error) return `<div class="callout warn">${esc(r.error)}</div>`;
  const marca = ok => ok ? '<span class="res ok">✓</span>' : '<span class="res bad">✗</span>';
  const total = (r.pasos || []).flatMap(p => p.checks), bien = total.filter(c => c.ok).length;
  let h = `<div class="resumen ${r.ok ? 'ok' : 'bad'}"><b>${r.ok ? 'Todas las pruebas pasaron' : (r.compilacion || []).some(c => !c.ok) ? 'No compila' : 'Hay pruebas que fallan'}</b>${total.length ? ` · ${bien}/${total.length} comprobaciones` : ''}${r.segundos !== undefined ? ` · ${r.segundos} s` : ''}</div>`;
  (r.compilacion || []).forEach(c => {
    if (c.ok && !c.mensajes.trim()) return;
    h += `<div class="paso"><div>${marca(c.ok)} <b>Compilar ${esc(c.nombre)}</b>${c.ok ? ' (con advertencias: revísalas, en papel también cuentan)' : ''}</div><pre class="code out">${esc(c.mensajes)}</pre></div>`;
  });
  (r.pasos || []).forEach(p => {
    h += `<div class="paso"><div>${marca(p.ok)} <b>${esc(p.nombre)}</b></div>${p.checks.length ? `<ul class="checks">${p.checks.map(c => `<li class="${c.ok ? 'ok' : 'bad'}">${marca(c.ok)} ${esc(c.msg)}</li>`).join('')}</ul>` : ''}
    ${p.salida && p.salida.trim() ? `<details><summary class="small">Salida</summary><pre class="code out">${esc(p.salida)}</pre></details>` : ''}</div>`;
  });
  const fondo = Object.entries(r.fondo || {}).filter(([, v]) => v.trim());
  if (fondo.length) h += `<details><summary class="small">Salida de los programas en segundo plano</summary>${fondo.map(([k, v]) => `<div class="small"><b>${esc(k)}</b></div><pre class="code out">${esc(v)}</pre>`).join('')}</details>`;
  return h;
}
function actualizarGutter() {
  const ed = $('#ed'), g = $('#gutter'); if (!ed || !g) return;
  const n = ed.value.split('\n').length;
  if (g.childElementCount !== n) g.textContent = Array.from({ length: n }, (_, i) => i + 1).join('\n');
  g.scrollTop = ed.scrollTop;
  const hl = $('#edhl'); if (hl) { hl.scrollTop = ed.scrollTop; hl.scrollLeft = ed.scrollLeft; }
}
/* Colores en el editor: un <pre> resaltado detrás del textarea transparente */
function colorearEditor() {
  const ed = $('#ed'), hl = $('#edhl'), ex = curEx(); if (!ed || !hl || !ex) return;
  hl.innerHTML = highlight(ed.value, langOf(ex)) + '\n';
  hl.scrollTop = ed.scrollTop; hl.scrollLeft = ed.scrollLeft;
}
async function compilarYProbar() {
  const ex = curEx(); if (!ex || RUN.corriendo) return;
  const ed = $('#ed'); if (ed) guardarBorrador(ex, ex.files[EJ.file].name, ed.value);
  const archivos = ex.files.map(f => ({ nombre: f.name, codigo: textoEditor(ex, f) }));
  const plan = ex.pruebas || { compilar: ex.files.filter(f => /\.c$/.test(f.name)).map(f => ({ src: [f.name], out: f.name.replace(/\.c$/, '') })), pasos: [], archivos: {} };
  Object.entries(plan.archivos || {}).forEach(([n, c]) => archivos.push({ nombre: n, codigo: n.startsWith('ref/') ? sinMarcas(c) : c }));
  RUN.corriendo = true; RUN.ultimo = null; render();
  try {
    const r = await fetch(RUN.url + '/ejecutar', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Cognition': '1' },
      body: JSON.stringify({ archivos, compilar: plan.compilar, pasos: plan.pasos }) });
    RUN.ultimo = r.ok ? await r.json() : { error: r.status === 403 ? 'El ejecutor no autorizó a este sitio. Reinícialo con --origen ' + location.origin : r.status === 409 ? 'El ejecutor está ocupado con otra prueba; espera unos segundos.' : 'El ejecutor respondió ' + r.status };
    if (RUN.ultimo.ok && !EJ.pruebasOk) { EJ.pruebasOk = true; record(ex.topic, true); addXp(8 + ex.lvl * 4); }
  } catch (e) {
    RUN.estado = 'no'; RUN.ultimo = { error: 'Se perdió la conexión con el ejecutor. ¿Sigue abierta la ventana de WSL?' };
  }
  RUN.corriendo = false; render();
  const res = $('#resultados'); if (res) res.scrollIntoView({ block: 'nearest' });
}
Object.assign(ACT, {
  lugar(el) {
    LUGAR = el.dataset.v; try { localStorage.setItem('cognition-lugar', LUGAR); } catch (e) { }
    if (LUGAR === 'pantalla' && RUN.estado !== 'ok') { if (vistoRunner()) iniciarRunner(); else pingRunner().then(render); }
    render();
  },
  runIniciar() { iniciarRunner(); },
  compilar() { compilarYProbar(); },
  edReset() { const ex = curEx(), f = ex.files[EJ.file]; borrarBorrador(ex, f.name); render(); },
  runPing() { pingRunner().then(render); render(); },
  runUrl() { const v = ($('#runurl') || {}).value; if (v) { RUN.url = v.replace(/\/$/, ''); try { localStorage.setItem('cognition-runner-url', RUN.url); } catch (e) { } pingRunner().then(render); } },
  async copiar(el) { try { await navigator.clipboard.writeText(el.dataset.txt); toast('Copiado'); } catch (e) { toast('Cópialo a mano'); } }
});
document.addEventListener('input', e => {
  if (e.target.id !== 'ed') return;
  const ex = curEx(); if (ex) guardarBorrador(ex, ex.files[EJ.file].name, e.target.value);
  colorearEditor(); actualizarGutter();
});
document.addEventListener('scroll', e => { if (e.target.id === 'ed') actualizarGutter(); }, true);
document.addEventListener('keydown', e => {
  const ed = e.target; if (ed.id !== 'ed') return;
  const ins = txt => { const a = ed.selectionStart, b = ed.selectionEnd; ed.setRangeText(txt, a, b, 'end'); ed.dispatchEvent(new Event('input', { bubbles: true })); };
  if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); ins('    '); }
  else if (e.key === 'Enter') {
    const ini = ed.value.lastIndexOf('\n', ed.selectionStart - 1) + 1, linea = ed.value.slice(ini, ed.selectionStart);
    const sangria = linea.match(/^\s*/)[0] + (/[{:]\s*$/.test(linea) ? '    ' : '');
    e.preventDefault(); ins('\n' + sangria);
  } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); compilarYProbar(); }
});
