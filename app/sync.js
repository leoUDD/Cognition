/* ===== Sincronización con el servidor (Vercel /api/progress) =====
   Estrategia: last-write-wins por updatedAt (la misma idea de la Unidad 2). */
const SYNC_KEY = 'cognition-sync';
const SY = { code: null, status: 'local', timer: null, busy: false, pendingCode: '', confirm: false, msg: '' };
try { SY.code = localStorage.getItem(SYNC_KEY) || localStorage.getItem('cuaderno-redes-sync'); } catch (e) { }
const SYNC_LABEL = { local: 'solo este navegador', sync: 'sincronizando…', ok: 'sincronizado', offline: 'sin conexión', noserver: 'servidor sin configurar' };
function setSync(st, msg) { SY.status = st; SY.msg = msg || ''; const el = document.getElementById('syncchip'); if (el) { el.textContent = SYNC_LABEL[st]; el.className = 'syncchip ' + (st === 'ok' ? 'ok' : st === 'offline' || st === 'noserver' ? 'err' : ''); } }
function newCode() {
  const abc = 'abcdefghjkmnpqrstuvwxyz23456789', b = new Uint8Array(12);
  crypto.getRandomValues(b);
  return Array.from(b, x => abc[x % abc.length]).join('').replace(/(.{4})(?=.)/g, '$1-');
}
async function apiProgress(method, code, body) {
  const r = await fetch('/api/progress?code=' + encodeURIComponent(code), {
    method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined
  });
  if (r.status === 503) throw Object.assign(new Error('noserver'), { kind: 'noserver' });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}
async function syncPull() {
  if (!SY.code || SY.busy) return;
  SY.busy = true; setSync('sync');
  try {
    const { data } = await apiProgress('GET', SY.code);
    if (data && (data.updatedAt || 0) > (S.updatedAt || 0)) { S = normalizar(data); activarCurso(S.curso); saveLocal(); render(); }
    else if (!data || (S.updatedAt || 0) > (data.updatedAt || 0)) await apiProgress('PUT', SY.code, S);
    setSync('ok');
  } catch (e) { setSync(e.kind === 'noserver' ? 'noserver' : 'offline'); }
  SY.busy = false;
}
function syncSchedule() {
  if (!SY.code) return;
  clearTimeout(SY.timer);
  SY.timer = setTimeout(async () => {
    setSync('sync');
    try { await apiProgress('PUT', SY.code, S); setSync('ok'); } catch (e) { setSync(e.kind === 'noserver' ? 'noserver' : 'offline'); }
  }, 1200);
}
function syncSetCode(code) { SY.code = code; try { code ? localStorage.setItem(SYNC_KEY, code) : localStorage.removeItem(SYNC_KEY); } catch (e) { } }
async function syncConnect(code, adoptRemote) {
  syncSetCode(code); setSync('sync');
  try {
    const { data } = await apiProgress('GET', code);
    if (data && adoptRemote) { S = normalizar(data); activarCurso(S.curso); saveLocal(); }
    else { S.updatedAt = Date.now(); saveLocal(); await apiProgress('PUT', code, S); }
    setSync('ok'); toast('Conectado');
  } catch (e) { setSync(e.kind === 'noserver' ? 'noserver' : 'offline'); }
  render();
}
window.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') syncPull(); });
function syncCard() {
  const st = `<span class="syncchip ${SY.status === 'ok' ? 'ok' : SY.status === 'offline' || SY.status === 'noserver' ? 'err' : ''}">${SYNC_LABEL[SY.status]}</span>`;
  if (SY.code) return `<section class="card stack" style="gap:10px"><div class="row spread"><h2 style="margin:0">Sincronización</h2>${st}</div>
    <p class="muted small" style="margin:0">Tu código. Ingrésalo en otro dispositivo para continuar ahí. Gana la versión guardada más reciente (last-write-wins), así que usa un dispositivo a la vez.</p>
    <div class="row"><span class="code-big">${esc(SY.code)}</span><button class="btn sm" data-act="syCopy">Copiar</button><button class="btn sm" data-act="syNow">Sincronizar ahora</button><button class="btn sm" data-act="syOff">Desconectar este dispositivo</button></div>
    ${SY.status === 'noserver' ? '<div class="callout warn small">La página funciona, pero el servidor no tiene base de datos conectada. Revisa el paso 3 del README.</div>' : ''}
    ${SY.status === 'offline' ? '<div class="callout warn small">No se pudo contactar al servidor. Tu progreso se guarda en este navegador y se subirá cuando vuelva la conexión.</div>' : ''}</section>`;
  return `<section class="card stack" style="gap:10px"><div class="row spread"><h2 style="margin:0">Sincronización</h2>${st}</div>
    <p class="muted small" style="margin:0">Para usar tu progreso en el PC y en el celular, crea un código aquí y luego ingrésalo en el otro dispositivo.</p>
    <div class="row"><button class="btn primary" data-act="syNew">Crear código</button><span class="muted small">o</span>
    <input type="text" id="sycode" placeholder="abcd-efgh-jkmn" value="${esc(SY.pendingCode)}" autocomplete="off" style="font-family:var(--f-mono);width:170px" aria-label="Código de sincronización"><button class="btn" data-act="syJoin">Conectar</button></div>
    ${SY.confirm ? `<div class="callout warn small">Se reemplazará el progreso de este navegador por el guardado en <b>${esc(SY.pendingCode)}</b>. <button class="btn sm" data-act="syJoinYes">Sí, conectar</button> <button class="btn sm" data-act="syJoinNo">Cancelar</button></div>` : ''}</section>`;
}
