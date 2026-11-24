/* ===== Alternativas: banco de preguntas de selección múltiple y simulacro =====
   Contenido en cursos/<id>/preguntas.js:
   examen = { titulo, preguntas: 60, minutos: 120, exigencia: 0.6, meta?: 0.7, secciones: [{ id, titulo, peso }] }
   preguntas.push({ id, sec, q, code?, ops: [correcta, distractor, ...], exp })   ← la primera opción es la correcta; se barajan al mostrar */
const AL = { modo: null, sec: null, cola: [], i: 0, resp: null, orden: null, iv: null };
const alCfg = () => CUR.examen || null;
const alBanco = () => CUR.preguntas || [];
const alStats = () => (P.preg = P.preg || {});
const alMezcla = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = b[i]; b[i] = b[j]; b[j] = t; } return b; };
const alNota = p => { const e = alCfg().exigencia || 0.6; const n = p < e ? 1 + 3 * p / e : 4 + 3 * (p - e) / (1 - e); return Math.round(n * 10) / 10; };
const alLetra = i => 'ABCDEFG'[i];
function alSecStats(sec) {
  const st = alStats(), qs = alBanco().filter(q => q.sec === sec);
  let vistas = 0, ok = 0; qs.forEach(q => { const s = st[q.id]; if (s) { vistas++; if (s.u) ok++; } });
  return { total: qs.length, vistas, ok };
}
const alFalladas = () => alBanco().filter(q => { const s = alStats()[q.id]; return s && !s.u; });

/* orden de opciones fijo por pregunta mientras está en pantalla */
function alOrden(q) { return alMezcla(q.ops.map((_, i) => i)); }

function alPreguntaHtml(q, orden, elegida, revelar, num, total) {
  const sec = (alCfg().secciones.find(s => s.id === q.sec) || {}).titulo || '';
  return `<div class="card stack al-q"><div class="row spread"><span class="eyebrow">${esc(sec)}</span><span class="muted small">Pregunta ${num} de ${total}</span></div>
  <div class="al-enun glos">${q.q}</div>${q.code ? `<pre class="code">${highlight(q.code, CUR.lenguaje)}</pre>` : ''}
  <div class="al-ops">${orden.map((oi, k) => {
    let cls = elegida === oi ? 'on' : '';
    if (revelar) cls = oi === 0 ? 'ok' : elegida === oi ? 'mal' : '';
    return `<button class="al-op ${cls}" data-act="alElegir" data-v="${oi}" ${revelar ? 'disabled' : ''}><b>${alLetra(k)}</b><span>${q.ops[oi]}</span></button>`;
  }).join('')}</div>
  ${revelar ? `<div class="callout ${elegida === 0 ? '' : 'warn'} glos"><b>${elegida === 0 ? 'Correcto.' : elegida == null ? 'Sin responder.' : 'Incorrecto.'}</b> La respuesta es <b>${alLetra(orden.indexOf(0))}</b>. ${q.exp}</div>` : ''}</div>`;
}

function alInicio() {
  const cfg = alCfg(), fall = alFalladas().length, sim = P.alSim;
  const meta = cfg.meta ? Math.ceil(cfg.meta * cfg.preguntas) : null;
  return `<div class="stack"><div><h1>${esc(cfg.titulo)}</h1>
  <p class="muted" style="max-width:66ch">${cfg.preguntas} preguntas de selección múltiple en ${cfg.minutos} minutos. Practica por sección (ves la explicación al responder) o rinde un simulacro con la misma cantidad de preguntas por tema que el temario.${meta ? ` Meta: <b>${meta} de ${cfg.preguntas}</b> correctas (${Math.round(cfg.meta * 100)} %, nota ≈ ${alNota(cfg.meta).toFixed(1)} con exigencia ${Math.round((cfg.exigencia || 0.6) * 100)} %).` : ''}</p></div>
  <div class="grid g2">
    <div class="card stack"><span class="eyebrow">Simulacro</span><h3 style="margin:0">${cfg.preguntas} preguntas · ${cfg.minutos} min</h3>
      <p class="muted small" style="margin:0">Como el examen: sin explicaciones hasta el final. Al terminar ves tu nota estimada, el resultado por tema y cada pregunta que fallaste.</p>
      <div class="row">${sim && !sim.fin ? '<button class="btn primary" data-act="alSimSeguir">Continuar simulacro</button><button class="btn" data-act="alSimNuevo">Empezar otro</button>' : '<button class="btn primary" data-act="alSimNuevo">Empezar simulacro</button>'}${sim && sim.fin ? '<button class="btn" data-act="alSimVer">Ver el último resultado</button>' : ''}</div></div>
    <div class="card stack"><span class="eyebrow">Repaso</span><h3 style="margin:0">Preguntas falladas</h3>
      <p class="muted small" style="margin:0">Las que respondiste mal la última vez, en práctica o en simulacro. Salen de la lista cuando las aciertas.</p>
      <div class="row"><button class="btn ${fall ? 'primary' : ''}" data-act="alPracticar" data-v="__fall" ${fall ? '' : 'disabled'}>Repasar ${fall} falladas</button><button class="btn" data-act="alPracticar" data-v="__todo">Práctica mezclada</button></div></div>
  </div>
  <h2 style="margin-bottom:0">Por sección</h2>
  <div class="grid g2">${cfg.secciones.map(s => {
    const st = alSecStats(s.id), pct = st.vistas ? Math.round(100 * st.ok / st.vistas) : null;
    return `<div class="card stack al-sec"><div class="row spread"><span class="eyebrow">~${s.peso} en el examen</span>${pct != null ? `<span class="chip ${pct >= 70 ? 'good' : 'warn'}">${pct} % de acierto</span>` : ''}</div>
      <h3 style="margin:0">${esc(s.titulo)}</h3><p class="muted small" style="margin:0">${st.total} preguntas en el banco · ${st.vistas} respondidas</p>
      <div class="bar" aria-hidden="true"><i style="width:${st.total ? Math.round(100 * st.vistas / st.total) : 0}%"></i></div>
      <div class="row"><button class="btn sm primary" data-act="alPracticar" data-v="${s.id}">Practicar</button>${s.teoria ? `<button class="btn sm" data-act="teIr" data-v="${s.teoria}">Leer la teoría</button>` : ''}</div></div>`;
  }).join('')}</div></div>`;
}

function alPractica() {
  const q = AL.cola[AL.i];
  if (!q) return `<div class="stack"><div class="row"><button class="btn sm" data-act="alSalir">← Alternativas</button></div><div class="card"><h2>¡Terminaste esta tanda!</h2><p>Respondiste ${AL.cola.length} preguntas: <b>${AL.aciertos}</b> correctas.</p><div class="row"><button class="btn primary" data-act="alPracticar" data-v="${AL.sec}">Otra tanda</button><button class="btn" data-act="alSalir">Volver</button></div></div></div>`;
  if (!AL.orden) AL.orden = alOrden(q);
  const revelar = AL.resp != null;
  return `<div class="stack al-wrap"><div class="row spread"><button class="btn sm" data-act="alSalir">← Alternativas</button><span class="muted small">Aciertos en esta tanda: <b>${AL.aciertos}</b> de ${AL.i + (revelar ? 1 : 0)}</span></div>
  ${alPreguntaHtml(q, AL.orden, AL.resp, revelar, AL.i + 1, AL.cola.length)}
  ${revelar ? `<div class="row"><button class="btn primary" data-act="alSig">Siguiente →</button></div>` : '<p class="muted small">Elige una alternativa: verás al tiro si es correcta y por qué.</p>'}</div>`;
}

/* ---- simulacro ---- */
function alArmarSim() {
  const cfg = alCfg(), banco = alBanco(), usadas = new Set(), ids = [];
  cfg.secciones.forEach(s => { alMezcla(banco.filter(q => q.sec === s.id)).slice(0, s.peso).forEach(q => { ids.push(q.id); usadas.add(q.id); }); });
  alMezcla(banco.filter(q => !usadas.has(q.id))).slice(0, Math.max(0, cfg.preguntas - ids.length)).forEach(q => ids.push(q.id));
  const lista = alMezcla(ids).slice(0, cfg.preguntas);
  return { ids: lista, ord: lista.map(id => alOrden(alBanco().find(q => q.id === id))), resp: {}, t0: Date.now(), i: 0, fin: false };
}
const alQ = id => alBanco().find(q => q.id === id);
const alRestante = () => alCfg().minutos * 60000 - (Date.now() - P.alSim.t0);
function alTick() { const el = $('#al-reloj'); if (!el || !P.alSim || P.alSim.fin) { alParar(); return; } const r = alRestante(); el.textContent = r > 0 ? fmtT(r) : '00:00'; el.classList.toggle('over', r < 10 * 60000); if (r <= 0) ACT.alSimTerminar(); }
function alParar() { if (AL.iv) { clearInterval(AL.iv); AL.iv = null; } }

function alSimulacro() {
  const S = P.alSim; if (!S) return alInicio();
  if (S.fin) return alResultado();
  const q = alQ(S.ids[S.i]), n = S.ids.length, resp = Object.keys(S.resp).length;
  setTimeout(() => { if (!AL.iv) AL.iv = setInterval(alTick, 1000); alTick(); }, 0);
  return `<div class="stack al-wrap"><div class="row spread"><span class="eyebrow">Simulacro · ${resp} de ${n} respondidas</span><span class="al-reloj" id="al-reloj">--:--</span></div>
  ${alPreguntaHtml(q, S.ord[S.i], S.resp[S.i], false, S.i + 1, n)}
  <div class="row spread"><button class="btn" data-act="alSimIr" data-v="${S.i - 1}" ${S.i ? '' : 'disabled'}>← Anterior</button>
  ${S.i < n - 1 ? `<button class="btn primary" data-act="alSimIr" data-v="${S.i + 1}">Siguiente →</button>` : '<button class="btn primary" data-act="alSimTerminar">Terminar y ver resultado</button>'}</div>
  <div class="al-mapa">${S.ids.map((_, k) => `<button class="${k === S.i ? 'act' : ''} ${S.resp[k] != null ? 'resp' : ''}" data-act="alSimIr" data-v="${k}" title="Pregunta ${k + 1}">${k + 1}</button>`).join('')}</div>
  <div class="row"><button class="btn sm" data-act="alSalir">Pausar y salir</button><button class="btn sm" data-act="alSimTerminar">Terminar ahora</button></div></div>`;
}

function alResultado() {
  const S = P.alSim, cfg = alCfg(), n = S.ids.length;
  const ok = S.ids.filter((id, k) => S.resp[k] === 0).length, p = ok / n;
  const porSec = cfg.secciones.map(s => { const ks = S.ids.map((id, k) => k).filter(k => alQ(S.ids[k]).sec === s.id); return { s, n: ks.length, ok: ks.filter(k => S.resp[k] === 0).length }; }).filter(x => x.n);
  const malas = S.ids.map((id, k) => k).filter(k => S.resp[k] !== 0);
  return `<div class="stack al-wrap"><div class="row"><button class="btn sm" data-act="alSalir">← Alternativas</button></div>
  <div class="card stack"><span class="eyebrow">Resultado del simulacro</span><h1 style="margin:0">${ok} de ${n} correctas · ${Math.round(100 * p)} %</h1>
  <p style="margin:0">Nota estimada: <b>${alNota(p).toFixed(1)}</b> (exigencia ${Math.round((cfg.exigencia || 0.6) * 100)} %)${cfg.meta ? ` · Meta: ${Math.ceil(cfg.meta * n)} correctas ${ok >= Math.ceil(cfg.meta * n) ? '<span class="chip good">¡lograda!</span>' : `<span class="chip warn">te faltaron ${Math.ceil(cfg.meta * n) - ok}</span>`}` : ''}</p></div>
  <div class="te-tabla"><table class="t"><thead><tr><th>Sección</th><th>Correctas</th><th>%</th></tr></thead><tbody>${porSec.map(x => `<tr><th scope="row">${esc(x.s.titulo)}</th><td>${x.ok} / ${x.n}</td><td>${Math.round(100 * x.ok / x.n)} %</td></tr>`).join('')}</tbody></table></div>
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

Object.assign(ACT, {
  alSalir() { AL.modo = null; alParar(); render(); window.scrollTo(0, 0); },
  alPracticar(el) {
    const v = el.dataset.v, st = alStats();
    let qs = v === '__fall' ? alFalladas() : v === '__todo' ? alBanco() : alBanco().filter(q => q.sec === v);
    /* primero las nunca vistas y las falladas, luego el resto; tandas de 15 */
    const peso = q => { const s = st[q.id]; return !s ? 0 : !s.u ? 1 : 2; };
    qs = alMezcla(qs).sort((a, b) => peso(a) - peso(b)).slice(0, 15);
    Object.assign(AL, { modo: 'practica', sec: v, cola: qs, i: 0, resp: null, orden: null, aciertos: 0 });
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
  alSig() { AL.i++; AL.resp = null; AL.orden = null; render(); window.scrollTo(0, 0); },
  alSimNuevo() {
    if (P.alSim && !P.alSim.fin && Object.keys(P.alSim.resp).length && !confirm('Tienes un simulacro sin terminar. ¿Empezar uno nuevo y descartarlo?')) return;
    P.alSim = alArmarSim(); save(); AL.modo = 'sim'; render(); window.scrollTo(0, 0);
  },
  alSimSeguir() { AL.modo = 'sim'; render(); },
  alSimVer() { AL.modo = 'sim'; render(); window.scrollTo(0, 0); },
  alSimIr(el) { const k = +el.dataset.v; if (k < 0 || k >= P.alSim.ids.length) return; P.alSim.i = k; save(); render(); window.scrollTo(0, 0); },
  alSimTerminar() {
    const S = P.alSim; if (!S || S.fin) return;
    const faltan = S.ids.length - Object.keys(S.resp).length;
    if (faltan && alRestante() > 0 && !confirm(`Te quedan ${faltan} preguntas sin responder. ¿Terminar igual?`)) return;
    S.fin = true; S.ids.forEach((id, k) => alRegistrar(alQ(id), S.resp[k] === 0)); alParar(); save(); render(); window.scrollTo(0, 0);
  },
  teIr(el) { TE.tema = el.dataset.v; TE.sub = null; location.hash = '#teoria'; }
});
