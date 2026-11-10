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

async function pingRunner() {
  RUN.estado = 'buscando';
  try {
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 1500);
    const r = await fetch(RUN.url + '/salud', { signal: ctl.signal }); clearTimeout(t);
    if (r.status === 403) { RUN.estado = 'origen'; return; }
    RUN.info = await r.json(); RUN.estado = RUN.info.gcc ? 'ok' : 'singcc';
  } catch (e) { RUN.estado = 'no'; }
}
function chipRunner() {
  const t = { desconocido: ['', 'ejecutor: sin revisar'], buscando: ['', 'buscando ejecutor…'], ok: ['ok', 'ejecutor conectado'], no: ['err', 'ejecutor no encontrado'], origen: ['err', 'ejecutor: sitio no autorizado'], singcc: ['err', 'ejecutor sin gcc'] }[RUN.estado];
  return `<span class="syncchip ${t[0]}">${t[1]}</span>`;
}
function ayudaRunner() {
  const origen = location.origin.startsWith('http') ? location.origin : 'https://TU-APP.vercel.app';
  const cmd = (txt) => `<div class="cmdrow"><pre class="code cmd">${esc(txt)}</pre><button class="btn sm" data-act="copiar" data-txt="${esc(txt)}">Copiar</button></div>`;
  const motivo = { no: 'No encontré el ejecutor en tu PC.', origen: 'El ejecutor está corriendo, pero no autorizó a este sitio. Vuelve a iniciarlo con el comando del paso 4 (incluye <code>--origen</code>).', singcc: 'El ejecutor corre, pero falta gcc: ejecuta el paso 2.' }[RUN.estado] || '';
  return `<div class="card stack" style="gap:10px"><h3 style="margin:0">Conectar el compilador (WSL)</h3>
  ${motivo ? `<div class="callout warn small">${motivo}</div>` : ''}
  <p class="small muted" style="margin:0">El ejecutor es un programa pequeño que corre en el Linux de tu PC (WSL), compila con gcc y prueba tu código. Solo acepta pedidos de este sitio y desde tu propio computador.</p>
  <ol class="clean small">
   <li><b>¿Tienes WSL?</b> En PowerShell: ${cmd('wsl -l -v')} Si no aparece Ubuntu, en PowerShell <b>como administrador</b> ejecuta ${cmd('wsl --install')} reinicia el PC y crea tu usuario de Linux.</li>
   <li><b>En Ubuntu</b>, instala gcc: ${cmd('sudo apt update && sudo apt install -y gcc python3 curl')}</li>
   <li><b>Descarga el ejecutor</b> (una vez): ${cmd(`curl -fsSL ${origen}/runner/cognition_runner.py -o ~/cognition_runner.py`)}</li>
   <li><b>Inícialo</b> cada vez que estudies (deja la ventana abierta): ${cmd(`python3 ~/cognition_runner.py --origen ${origen}`)}
   Atajo opcional, para después escribir solo <code>cognition</code>: ${cmd(`echo "alias cognition='python3 ~/cognition_runner.py --origen ${origen}'" >> ~/.bashrc && source ~/.bashrc`)}</li>
   <li>Vuelve aquí y presiona <b>Reintentar</b>. Si el navegador pregunta si este sitio puede acceder a otros dispositivos o apps de tu red local, elige <b>Permitir</b>.</li>
  </ol>
  <details class="small"><summary>Sigue sin conectar</summary><p>Inicia el ejecutor con <code>--host 0.0.0.0</code> además de <code>--origen</code>, y deja la dirección en <code>http://127.0.0.1:7777</code>. Si cambiaste el puerto, ajústala aquí:</p>
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
   <textarea id="ed" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" aria-label="Editor de ${esc(f.name)}">${esc(textoEditor(ex, f))}</textarea></div>
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
  lugar(el) { LUGAR = el.dataset.v; try { localStorage.setItem('cognition-lugar', LUGAR); } catch (e) { } if (LUGAR === 'pantalla' && RUN.estado !== 'ok') pingRunner().then(render); render(); },
  compilar() { compilarYProbar(); },
  edReset() { const ex = curEx(), f = ex.files[EJ.file]; borrarBorrador(ex, f.name); render(); },
  runPing() { pingRunner().then(render); render(); },
  runUrl() { const v = ($('#runurl') || {}).value; if (v) { RUN.url = v.replace(/\/$/, ''); try { localStorage.setItem('cognition-runner-url', RUN.url); } catch (e) { } pingRunner().then(render); } },
  async copiar(el) { try { await navigator.clipboard.writeText(el.dataset.txt); toast('Copiado'); } catch (e) { toast('Cópialo a mano'); } }
});
document.addEventListener('input', e => {
  if (e.target.id !== 'ed') return;
  const ex = curEx(); if (ex) guardarBorrador(ex, ex.files[EJ.file].name, e.target.value);
  actualizarGutter();
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
