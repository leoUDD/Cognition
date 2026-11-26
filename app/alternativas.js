/* ===== Alternativas: banco de preguntas (selección múltiple, verdadero o falso y desarrollo) y simulacro =====
   Contenido en cursos/<id>/preguntas.js:
   examen = { titulo, preguntas: 60, minutos: 120, exigencia: 0.6, meta?: 0.7, secciones: [{ id, titulo, peso }] }
   preguntas.push({ id, sec, q, code?, ops: [correcta, distractor, ...], exp })        ← selección múltiple: la primera es la correcta; se barajan
   preguntas.push({ id, sec, q, tipo: 'vf', ops: ['Verdadero','Falso'] (la correcta primero), exp })   ← se muestran siempre V y luego F
   preguntas.push({ id, sec, q, tipo: 'dev', modelo, claves: ['idea 1', ...] })        ← desarrollo: escribes y te autoevalúas con las ideas clave */
const AL = { modo: null, sec: null, cola: [], i: 0, resp: null, orden: null, iv: null, dev: { txt: '', ver: false, chk: [] } };
const alCfg = () => CUR.examen || null;
const alBanco = () => CUR.preguntas || [];
const alStats = () => (P.preg = P.preg || {});
const alMezcla = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = b[i]; b[i] = b[j]; b[j] = t; } return b; };
const alNota = p => { const e = alCfg().exigencia || 0.6; const n = p < e ? 1 + 3 * p / e : 4 + 3 * (p - e) / (1 - e); return Math.round(n * 10) / 10; };
const alTipo = q => q.tipo || 'alt';
const TIPO_AL = { alt: 'Selección múltiple', vf: 'Verdadero o falso', dev: 'Desarrollo' };
/* desarrollo: cuenta como correcta si incluiste al menos el 60 % de las ideas clave */
const alDevMin = q => Math.ceil(0.6 * q.claves.length);
const alDevOk = (q, chk) => (chk || []).filter(Boolean).length >= alDevMin(q);
function alSecStats(sec) {
  const st = alStats(), qs = alBanco().filter(q => q.sec === sec);
  let vistas = 0, ok = 0; qs.forEach(q => { const s = st[q.id]; if (s) { vistas++; if (s.u) ok++; } });
  return { total: qs.length, vistas, ok };
}
const alFalladas = () => alBanco().filter(q => { const s = alStats()[q.id]; return s && !s.u; });

/* orden de opciones fijo por pregunta mientras está en pantalla; V/F siempre en ese orden */
function alOrden(q) {
  const t = alTipo(q);
  if (t === 'dev') return [];
  if (t === 'vf') return [q.ops.indexOf('Verdadero'), q.ops.indexOf('Falso')];
  return alMezcla(q.ops.map((_, i) => i));
}
const alLetra = (q, k) => alTipo(q) === 'vf' ? (k === 0 ? 'V' : 'F') : 'ABCDEFG'[k];

function alCabecera(q, num, total) {
  const sec = (alCfg().secciones.find(s => s.id === q.sec) || {}).titulo || '';
  return `<div class="row spread"><span class="eyebrow">${esc(sec)} · ${TIPO_AL[alTipo(q)]}</span><span class="muted small">Pregunta ${num} de ${total}</span></div>
  <div class="al-enun glos">${q.q}</div>${q.code ? `<pre class="code">${highlight(q.code, CUR.lenguaje)}</pre>` : ''}`;
}

function alPreguntaHtml(q, orden, elegida, revelar, num, total) {
  return `<div class="card stack al-q">${alCabecera(q, num, total)}
  <div class="al-ops ${alTipo(q) === 'vf' ? 'al-vf' : ''}">${orden.map((oi, k) => {
    let cls = elegida === oi ? 'on' : '';
    if (revelar) cls = oi === 0 ? 'ok' : elegida === oi ? 'mal' : '';
    return `<button class="al-op ${cls}" data-act="alElegir" data-v="${oi}" ${revelar ? 'disabled' : ''}><b>${alLetra(q, k)}</b><span>${q.ops[oi]}</span></button>`;
  }).join('')}</div>
  ${revelar ? `<div class="callout ${elegida === 0 ? '' : 'warn'} glos"><b>${elegida === 0 ? 'Correcto.' : elegida == null ? 'Sin responder.' : 'Incorrecto.'}</b> La respuesta es <b>${alTipo(q) === 'vf' ? q.ops[0] : alLetra(q, orden.indexOf(0))}</b>. ${q.exp}</div>` : ''}</div>`;
}

/* desarrollo: k = 'p' en práctica, o el índice de la pregunta en el simulacro */
function alDevHtml(q, o) {
  const marcadas = (o.chk || []).filter(Boolean).length;
  const lista = o.ver ? `<div class="callout glos"><span class="eyebrow">Respuesta modelo</span><div>${q.modelo}</div></div>
    <div class="stack" style="gap:6px"><b>¿Qué ideas clave incluiste? (marca las que sí)</b>
    ${q.claves.map((c, i) => `<button class="al-clave ${o.chk && o.chk[i] ? 'on' : ''}" data-act="alDevClave" data-k="${o.k}" data-i="${i}" ${o.bloqueado ? 'disabled' : ''}><span class="al-check">${o.chk && o.chk[i] ? '✓' : ''}</span><span>${c}</span></button>`).join('')}
    <p class="small muted" style="margin:0">Marcaste ${marcadas} de ${q.claves.length}. Cuenta como correcta con ${alDevMin(q)} o más.${o.bloqueado ? ` <b>${alDevOk(q, o.chk) ? 'Correcta.' : 'Incompleta.'}</b>` : ''}</p></div>` : '';
  return `<div class="card stack al-q">${alCabecera(q, o.num, o.total)}
  ${o.soloLectura ? `<div class="al-devresp">${o.txt ? esc(o.txt) : '<i class="muted">Sin respuesta</i>'}</div>` : `<textarea class="al-dev" data-dev="${o.k}" rows="6" placeholder="Escribe tu respuesta: clara y fundamentada. Si corresponde, relaciónala con un ejemplo o con tu proyecto.">${esc(o.txt || '')}</textarea>`}
  ${lista}</div>`;
}

function alInicio() {
  const cfg = alCfg(), fall = alFalladas().length, sim = P.alSim;
  const meta = cfg.meta ? Math.ceil(cfg.meta * cfg.preguntas) : null;
  const tipos = [...new Set(alBanco().map(alTipo))], mixto = tipos.length > 1;
  return `<div class="stack"><div><h1>${esc(cfg.titulo)}</h1>
  <p class="muted" style="max-width:66ch">${cfg.preguntas} preguntas ${mixto ? `(${tipos.map(t => TIPO_AL[t].toLowerCase()).join(', ')})` : 'de selección múltiple'} en ${cfg.minutos} minutos. Practica por sección (ves la explicación al responder) o rinde un simulacro con la misma cantidad de preguntas por tema que el temario.${meta ? ` Meta: <b>${meta} de ${cfg.preguntas}</b> correctas (${Math.round(cfg.meta * 100)} %, nota ≈ ${alNota(cfg.meta).toFixed(1)} con exigencia ${Math.round((cfg.exigencia || 0.6) * 100)} %).` : ''}</p>
  ${cfg.indicaciones ? `<div class="callout small">${cfg.indicaciones}</div>` : ''}</div>
  <div class="grid g2">
    <div class="card stack"><span class="eyebrow">Simulacro</span><h3 style="margin:0">${cfg.preguntas} preguntas · ${cfg.minutos} min</h3>
      <p class="muted small" style="margin:0">Como el examen: sin explicaciones hasta el final. Al terminar ves tu nota estimada, el resultado por tema y cada pregunta que fallaste.${tipos.includes('dev') ? ' Las de desarrollo las autoevalúas con la respuesta modelo.' : ''}</p>
      <div class="row">${sim && !sim.fin ? '<button class="btn primary" data-act="alSimSeguir">Continuar simulacro (en pausa)</button><button class="btn" data-act="alSimNuevo">Empezar otro</button>' : '<button class="btn primary" data-act="alSimNuevo">Empezar simulacro</button>'}${sim && sim.fin ? '<button class="btn" data-act="alSimVer">Ver el último resultado</button>' : ''}</div></div>
    <div class="card stack"><span class="eyebrow">Repaso</span><h3 style="margin:0">Preguntas falladas</h3>
      <p class="muted small" style="margin:0">Las que respondiste mal la última vez, en práctica o en simulacro. Salen de la lista cuando las aciertas.</p>
      <div class="row"><button class="btn ${fall ? 'primary' : ''}" data-act="alPracticar" data-v="__fall" ${fall ? '' : 'disabled'}>Repasar ${fall} falladas</button><button class="btn" data-act="alPracticar" data-v="__todo">Práctica mezclada</button>${tipos.includes('dev') ? '<button class="btn" data-act="alPracticar" data-v="__dev">Solo desarrollo</button>' : ''}</div></div>
  </div>
  <h2 style="margin-bottom:0">Por sección</h2>
  <div class="grid g2">${cfg.secciones.map(s => {
    const st = alSecStats(s.id), pct = st.vistas ? Math.round(100 * st.ok / st.vistas) : null;
    return `<div class="card stack al-sec"><div class="row spread"><span class="eyebrow">${s.peso ? `~${s.peso} en el examen` : 'Fuera del temario · no entra al simulacro'}</span>${pct != null ? `<span class="chip ${pct >= 70 ? 'good' : 'warn'}">${pct} % de acierto</span>` : ''}</div>
      <h3 style="margin:0">${esc(s.titulo)}</h3><p class="muted small" style="margin:0">${st.total} preguntas en el banco · ${st.vistas} respondidas</p>
      <div class="bar" aria-hidden="true"><i style="width:${st.total ? Math.round(100 * st.vistas / st.total) : 0}%"></i></div>
      <div class="row"><button class="btn sm primary" data-act="alPracticar" data-v="${s.id}">Practicar</button>${s.teoria ? `<button class="btn sm" data-act="teIr" data-v="${s.teoria}">Leer la teoría</button>` : ''}</div></div>`;
  }).join('')}</div></div>`;
}

function alPractica() {
  const q = AL.cola[AL.i];
  if (!q) return `<div class="stack"><div class="row"><button class="btn sm" data-act="alSalir">← Alternativas</button></div><div class="card"><h2>¡Terminaste esta tanda!</h2><p>Respondiste ${AL.cola.length} preguntas: <b>${AL.aciertos}</b> correctas.</p><div class="row"><button class="btn primary" data-act="alPracticar" data-v="${AL.sec}">Otra tanda</button><button class="btn" data-act="alSalir">Volver</button></div></div></div>`;
  if (!AL.orden) AL.orden = alOrden(q);
  const revelar = AL.resp != null, dev = alTipo(q) === 'dev';
  const cuerpo = dev ? alDevHtml(q, { k: 'p', txt: AL.dev.txt, ver: AL.dev.ver, chk: AL.dev.chk, bloqueado: revelar, num: AL.i + 1, total: AL.cola.length })
    : alPreguntaHtml(q, AL.orden, AL.resp, revelar, AL.i + 1, AL.cola.length);
  const pie = revelar ? `<div class="row"><button class="btn primary" data-act="alSig">Siguiente →</button></div>`
    : dev ? (AL.dev.ver ? '<div class="row"><button class="btn primary" data-act="alDevListo">Registrar mi autoevaluación</button></div>' : '<div class="row"><button class="btn primary" data-act="alDevVer">Ver respuesta modelo</button><span class="muted small">Escribe primero, aunque sea en borrador.</span></div>')
    : '<p class="muted small">Elige una alternativa: verás al tiro si es correcta y por qué.</p>';
  return `<div class="stack al-wrap"><div class="row spread"><button class="btn sm" data-act="alSalir">← Alternativas</button><span class="muted small">Aciertos en esta tanda: <b>${AL.aciertos}</b> de ${AL.i + (revelar ? 1 : 0)}</span></div>
  ${cuerpo}${pie}</div>`;
}

/* ---- simulacro ---- */
function alArmarSim() {
  const cfg = alCfg(), banco = alBanco(), usadas = new Set(), ids = [];
  const st = alStats(), vista = q => (st[q.id] ? 1 : 0);   /* primero las que nunca has respondido */
  cfg.secciones.forEach(s => { alMezcla(banco.filter(q => q.sec === s.id)).sort((x, y) => vista(x) - vista(y)).slice(0, s.peso).forEach(q => { ids.push(q.id); usadas.add(q.id); }); });
  alMezcla(banco.filter(q => !usadas.has(q.id) && (cfg.secciones.find(s => s.id === q.sec) || {}).peso > 0)).slice(0, Math.max(0, cfg.preguntas - ids.length)).forEach(q => ids.push(q.id));
  /* desarrollo al final, como suele venir en la prueba */
  const lista = alMezcla(ids).slice(0, cfg.preguntas).sort((a, b) => (alTipo(alQ(a)) === 'dev') - (alTipo(alQ(b)) === 'dev'));
  return { ids: lista, ord: lista.map(id => alOrden(alQ(id))), resp: {}, dev: {}, chk: {}, t0: Date.now(), i: 0, fin: false };
}
const alQ = id => alBanco().find(q => q.id === id);
const alRespondida = (S, k) => alTipo(alQ(S.ids[k])) === 'dev' ? !!((S.dev || {})[k] || '').trim() : S.resp[k] != null;
const alCorrecta = (S, k) => { const q = alQ(S.ids[k]); return alTipo(q) === 'dev' ? alDevOk(q, (S.chk || {})[k]) : S.resp[k] === 0; };
/* tiempo usado = ahora (o el inicio de la pausa) − inicio − lo que estuvo en pausa */
const alRestante = () => { const S = P.alSim; return alCfg().minutos * 60000 - ((S.pausaDesde || Date.now()) - S.t0 - (S.pausado || 0)); };
function alTick() { const el = $('#al-reloj'); if (!el || !P.alSim || P.alSim.fin) { alParar(); return; } const r = alRestante(); el.textContent = r > 0 ? fmtT(r) : '00:00'; el.classList.toggle('over', r < 10 * 60000); if (r <= 0 && !P.alSim.pausaDesde) ACT.alSimTerminar(); }
function alParar() { if (AL.iv) { clearInterval(AL.iv); AL.iv = null; } }

function alSimulacro() {
  const S = P.alSim; if (!S) return alInicio();
  if (S.fin) return alResultado();
  const q = alQ(S.ids[S.i]), n = S.ids.length, resp = S.ids.filter((_, k) => alRespondida(S, k)).length;
  setTimeout(() => { if (!AL.iv) AL.iv = setInterval(alTick, 1000); alTick(); }, 0);
  if (S.pausaDesde) return `<div class="stack al-wrap"><div class="row spread"><span class="eyebrow">Simulacro en pausa · ${resp} de ${n} respondidas</span><span class="al-reloj" id="al-reloj">--:--</span></div>
  <div class="card stack" style="text-align:center;padding:40px 20px"><h2 style="margin:0">⏸ Simulacro en pausa</h2><p class="muted" style="margin:0">El reloj está detenido y la pregunta, oculta. Te quedan los minutos que ves arriba.</p>
  <div class="row" style="justify-content:center"><button class="btn primary" data-act="alSimPausa">▶ Reanudar</button><button class="btn" data-act="alSalir">Salir</button></div></div></div>`;
  const cuerpo = alTipo(q) === 'dev' ? alDevHtml(q, { k: S.i, txt: (S.dev || {})[S.i], ver: false, num: S.i + 1, total: n }) : alPreguntaHtml(q, S.ord[S.i], S.resp[S.i], false, S.i + 1, n);
  return `<div class="stack al-wrap"><div class="row spread"><span class="eyebrow">Simulacro · ${resp} de ${n} respondidas</span><span class="al-reloj" id="al-reloj">--:--</span></div>
  ${cuerpo}
  <div class="row spread"><button class="btn" data-act="alSimIr" data-v="${S.i - 1}" ${S.i ? '' : 'disabled'}>← Anterior</button>
  ${S.i < n - 1 ? `<button class="btn primary" data-act="alSimIr" data-v="${S.i + 1}">Siguiente →</button>` : '<button class="btn primary" data-act="alSimTerminar">Terminar y ver resultado</button>'}</div>
  <div class="al-mapa">${S.ids.map((_, k) => `<button class="${k === S.i ? 'act' : ''} ${alRespondida(S, k) ? 'resp' : ''}" data-act="alSimIr" data-v="${k}" title="Pregunta ${k + 1}">${k + 1}</button>`).join('')}</div>
  <div class="row"><button class="btn sm" data-act="alSimPausa">⏸ Pausar</button><button class="btn sm" data-act="alSalir">Pausar y salir</button><button class="btn sm" data-act="alSimTerminar">Terminar ahora</button></div></div>`;
}

function alResultado() {
  const S = P.alSim, cfg = alCfg(), n = S.ids.length, ks = S.ids.map((_, k) => k);
  const ok = ks.filter(k => alCorrecta(S, k)).length, p = ok / n;
  const porSec = cfg.secciones.map(s => { const kk = ks.filter(k => alQ(S.ids[k]).sec === s.id); return { s, n: kk.length, ok: kk.filter(k => alCorrecta(S, k)).length }; }).filter(x => x.n);
  const devs = ks.filter(k => alTipo(alQ(S.ids[k])) === 'dev');
  const malas = ks.filter(k => alTipo(alQ(S.ids[k])) !== 'dev' && !alCorrecta(S, k));
  return `<div class="stack al-wrap"><div class="row"><button class="btn sm" data-act="alSalir">← Alternativas</button></div>
  <div class="card stack"><span class="eyebrow">Resultado del simulacro</span><h1 style="margin:0">${ok} de ${n} correctas · ${Math.round(100 * p)} %</h1>
  <p style="margin:0">Nota estimada: <b>${alNota(p).toFixed(1)}</b> (exigencia ${Math.round((cfg.exigencia || 0.6) * 100)} %)${cfg.meta ? ` · Meta: ${Math.ceil(cfg.meta * n)} correctas ${ok >= Math.ceil(cfg.meta * n) ? '<span class="chip good">¡lograda!</span>' : `<span class="chip warn">te faltaron ${Math.ceil(cfg.meta * n) - ok}</span>`}` : ''}</p>
  ${devs.length ? `<p class="small muted" style="margin:0">Incluye ${devs.length} preguntas de desarrollo: autoevalúalas más abajo marcando las ideas clave que incluiste. La nota se actualiza al marcar.</p>` : ''}</div>
  <div class="te-tabla"><table class="t"><thead><tr><th>Sección</th><th>Correctas</th><th>%</th></tr></thead><tbody>${porSec.map(x => `<tr><th scope="row">${esc(x.s.titulo)}</th><td>${x.ok} / ${x.n}</td><td>${Math.round(100 * x.ok / x.n)} %</td></tr>`).join('')}</tbody></table></div>
  ${devs.length ? `<h2 style="margin-bottom:0">Desarrollo: autoevalúate (${devs.length})</h2>${devs.map(k => alDevHtml(alQ(S.ids[k]), { k, txt: (S.dev || {})[k], ver: true, chk: (S.chk || {})[k], soloLectura: true, num: k + 1, total: n })).join('')}` : ''}
  <h2 style="margin-bottom:0">Preguntas a repasar (${malas.length})</h2>
  ${malas.map(k => alPreguntaHtml(alQ(S.ids[k]), S.ord[k], S.resp[k], true, k + 1, n)).join('') || '<p>¡Ninguna! Respondiste todo bien.</p>'}
  <div class="row"><button class="btn primary" data-act="alSimNuevo">Otro simulacro</button><button class="btn" data-act="alPracticar" data-v="__fall">Repasar falladas</button></div></div>`;
}

VIEWS.alternativas = () => {
  if (!alCfg()) return '<p>Este ramo no tiene banco de preguntas.</p>';
  if (AL.modo === 'practica') return alPractica();
  if (AL.modo === 'sim') return alSimulacro();
  alParar(); return alInicio();
};

function alRegistrar(q, ok) {
  const st = alStats(), s = st[q.id] || { n: 0, a: 0 };
  s.n++; if (ok) s.a++; s.u = ok ? 1 : 0; st[q.id] = s;
  const tema = (alCfg().secciones.find(x => x.id === q.sec) || {}).tema; if (tema) record(tema, ok); else save();
}

/* lo que se escribe en desarrollo se guarda al tiro (sin redibujar) */
document.addEventListener('input', e => {
  const t = e.target; if (!t.dataset || t.dataset.dev === undefined) return;
  if (t.dataset.dev === 'p') AL.dev.txt = t.value;
  else if (P.alSim) { P.alSim.dev = P.alSim.dev || {}; P.alSim.dev[t.dataset.dev] = t.value; saveLocal(); }
});

Object.assign(ACT, {
  alSalir() {
    const S = P.alSim; if (AL.modo === 'sim' && S && !S.fin && !S.pausaDesde) { S.pausaDesde = Date.now(); save(); }   /* salir pausa el reloj */
    AL.modo = null; alParar(); render(); window.scrollTo(0, 0);
  },
  alSimPausa() {
    const S = P.alSim; if (!S || S.fin) return;
    if (S.pausaDesde) { S.pausado = (S.pausado || 0) + (Date.now() - S.pausaDesde); S.pausaDesde = null; }
    else S.pausaDesde = Date.now();
    save(); render();
  },
  alPracticar(el) {
    const v = el.dataset.v, st = alStats();
    let qs = v === '__fall' ? alFalladas() : v === '__todo' ? alBanco() : v === '__dev' ? alBanco().filter(q => alTipo(q) === 'dev') : alBanco().filter(q => q.sec === v);
    /* primero las nunca vistas y las falladas, luego el resto; tandas de 15 */
    const peso = q => { const s = st[q.id]; return !s ? 0 : !s.u ? 1 : 2; };
    qs = alMezcla(qs).sort((a, b) => peso(a) - peso(b)).slice(0, 15);
    Object.assign(AL, { modo: 'practica', sec: v, cola: qs, i: 0, resp: null, orden: null, aciertos: 0, dev: { txt: '', ver: false, chk: [] } });
    render(); window.scrollTo(0, 0);
  },
  alElegir(el) {
    const v = +el.dataset.v;
    if (AL.modo === 'practica') {
      if (AL.resp != null) return;
      const q = AL.cola[AL.i]; AL.resp = v; if (v === 0) { AL.aciertos++; addXp(3); }
      alRegistrar(q, v === 0); render();
    } else if (AL.modo === 'sim') { P.alSim.resp[P.alSim.i] = v; save(); render(); }
  },
  alDevVer() { AL.dev.ver = true; render(); },
  alDevClave(el) {
    const i = +el.dataset.i, k = el.dataset.k;
    if (k === 'p') { if (AL.resp != null) return; AL.dev.chk[i] = !AL.dev.chk[i]; }
    else { const S = P.alSim; S.chk = S.chk || {}; const c = S.chk[k] = S.chk[k] || []; c[i] = !c[i]; save(); }
    render();
  },
  alDevListo() {
    const q = AL.cola[AL.i], ok = alDevOk(q, AL.dev.chk);
    AL.resp = ok ? 0 : 1; if (ok) { AL.aciertos++; addXp(5); }
    alRegistrar(q, ok); render();
  },
  alSig() { AL.i++; AL.resp = null; AL.orden = null; AL.dev = { txt: '', ver: false, chk: [] }; render(); window.scrollTo(0, 0); },
  alSimNuevo() {
    if (P.alSim && !P.alSim.fin && P.alSim.ids.some((_, k) => alRespondida(P.alSim, k)) && !confirm('Tienes un simulacro sin terminar. ¿Empezar uno nuevo y descartarlo?')) return;
    P.alSim = alArmarSim(); save(); AL.modo = 'sim'; render(); window.scrollTo(0, 0);
  },
  alSimSeguir() { AL.modo = 'sim'; render(); },
  alSimVer() { AL.modo = 'sim'; render(); window.scrollTo(0, 0); },
  alSimIr(el) { const k = +el.dataset.v; if (k < 0 || k >= P.alSim.ids.length) return; P.alSim.i = k; save(); render(); window.scrollTo(0, 0); },
  alSimTerminar() {
    const S = P.alSim; if (!S || S.fin) return;
    const faltan = S.ids.filter((_, k) => !alRespondida(S, k)).length;
    if (faltan && alRestante() > 0 && !confirm(`Te quedan ${faltan} preguntas sin responder. ¿Terminar igual?`)) return;
    /* las de desarrollo se registran al autoevaluarlas en práctica; aquí solo las de alternativas */
    S.fin = true; S.ids.forEach((id, k) => { const q = alQ(id); if (alTipo(q) !== 'dev') alRegistrar(q, S.resp[k] === 0); }); alParar(); save(); render(); window.scrollTo(0, 0);
  },
  teIr(el) { TE.tema = el.dataset.v; TE.sub = null; location.hash = '#teoria'; }
});
