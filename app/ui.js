/* ===== Estado y persistencia (ligera, por navegador) ===== */
const KEY = 'cognition-v2', OLD_KEYS = ['cuaderno-redes-v1'];
const DAILY = 40;
const TITULOS_BASE = ['Aprendiz', 'Practicante', 'Competente', 'Avanzado', 'Experto', 'Maestro'];
/* Estado global (XP, racha) + progreso separado por ramo en S.cursos[id] */
function defaults() { return { v: 2, xp: 0, streak: 0, lastDay: '', dayXp: 0, dayKey: '', updatedAt: 0, curso: null, cursos: {} }; }
function cursoVacio() { return { cards: {}, papel: {}, topics: {}, exams: {} }; }
/* Acepta el formato antiguo (v1, un solo ramo) y lo migra al ramo "redes" */
function normalizar(datos) {
  const x = Object.assign(defaults(), datos || {});
  if (datos && (!datos.v || datos.v < 2)) {
    const viejo = { cards: x.cards || {}, papel: x.papel || {}, topics: x.topics || {}, exams: x.exams || {} };
    if (viejo.exams.control || viejo.exams.certamen) viejo.exams = { control: viejo.exams.control || '', certamen: viejo.exams.certamen || '' };
    x.cursos = { redes: viejo }; x.curso = 'redes'; x.v = 2;
    ['cards', 'papel', 'topics', 'exams'].forEach(k => delete x[k]);
  }
  return x;
}
let S = defaults();
try {
  let r = localStorage.getItem(KEY);
  if (!r) for (const k of OLD_KEYS) { r = localStorage.getItem(k); if (r) break; }
  if (r) S = normalizar(JSON.parse(r));
} catch (e) { }
/* Curso activo: estas variables cambian al cambiar de ramo */
let CUR, P, TOPICS, TNAME, GROUPS, EXERCISES, CARDS, TITLES;
function activarCurso(id) {
  CUR = CURSOS.find(c => c.id === id) || CURSOS[0];
  S.curso = CUR.id;
  if (!S.cursos[CUR.id]) S.cursos[CUR.id] = cursoVacio();
  P = S.cursos[CUR.id];
  TOPICS = CUR.temas || []; TNAME = Object.fromEntries(TOPICS.map(t => [t.id, t.n]));
  GROUPS = (CUR.grupos || [{ id: 'general', nombre: 'Ejercicios', sub: '' }]).map(g => [g.id, g.nombre, g.sub || '']);
  EXERCISES = CUR.ejercicios || []; CARDS = CUR.tarjetas || []; TITLES = CUR.titulos || TITULOS_BASE;
  if (typeof prepararGlosario === 'function') prepararGlosario();
}
const langOf = ex => ex.lang || CUR.lenguaje || 'c';
function saveLocal() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }
function save() { S.updatedAt = Date.now(); saveLocal(); if (typeof syncSchedule === 'function') syncSchedule(); }
const $ = (s, r = document) => r.querySelector(s);
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const addDays = (k, n) => { const d = new Date(k + 'T12:00:00'); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const daysTo = k => Math.round((new Date(k + 'T12:00:00') - new Date(today() + 'T12:00:00')) / 864e5);
const lvlOf = xp => 1 + Math.floor(Math.sqrt(xp / 40));
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('on'), 1600); }
function addXp(n) {
  n = Math.round(n); if (n <= 0) return;
  const t = today();
  if (S.dayKey !== t) { S.dayKey = t; S.dayXp = 0; }
  if (S.lastDay !== t) { S.streak = S.lastDay === addDays(t, -1) ? S.streak + 1 : 1; S.lastDay = t; }
  S.xp += n; S.dayXp += n; save(); toast('+' + n + ' XP'); renderHeader();
}
function record(topic, ok) { P.topics[topic] = (P.topics[topic] || []).concat(ok ? 1 : 0).slice(-15); save(); }
function mastery(t) { const a = P.topics[t]; return a && a.length ? a.reduce((x, y) => x + y, 0) / a.length : null; }

/* ===== Cabecera y navegación ===== */
const VIEWS = {};
const MODULOS = {};   /* los módulos de cada ramo se registran aquí */
let cur = 'hoy';
function cardsDueCount() {
  const t = today(); let due = 0, nw = 0;
  CARDS.forEach(c => { const s = P.cards[c.id]; if (!s) nw++; else if (s.due <= t) due++; });
  return due + Math.min(10, nw);
}
function renderHeader() {
  const lv = lvlOf(S.xp), lo = 40 * (lv - 1) ** 2, hi = 40 * lv ** 2, pct = Math.round(100 * (S.xp - lo) / (hi - lo));
  const t = today(); const dayXp = S.dayKey === t ? S.dayXp : 0;
  const streakOn = S.lastDay === t || S.lastDay === addDays(t, -1);
  $('#top').innerHTML = `<div class="top-in"><div class="brand">Cognition<small>${CURSOS.length > 1 ? `<select id="cursosel" data-chg="curso" aria-label="Ramo">${CURSOS.map(c => `<option value="${c.id}" ${c.id === CUR.id ? 'selected' : ''}>${esc(c.nombre)}</option>`).join('')}</select>` : esc(CUR.nombre)}</small></div>
  <div class="stats"><div class="lvl"><b>Nivel ${lv}</b>${TITLES[Math.min(5, lv - 1)]}</div>
  <div><div class="xpbar" title="${S.xp} XP"><i style="width:${pct}%"></i></div><div class="small muted">${S.xp} XP · hoy ${dayXp}/${DAILY}</div></div>
  <span class="streak" title="Días seguidos estudiando">${streakOn ? S.streak : 0} d seguidos</span><span id="syncchip" class="syncchip ${SY.status === 'ok' ? 'ok' : SY.status === 'offline' || SY.status === 'noserver' ? 'err' : ''}" title="Estado de sincronización">${SYNC_LABEL[SY.status]}</span></div></div>
  <nav class="tabs" aria-label="Secciones">${tabsCurso()
      .map(([k, n]) => `<a href="#${k}" class="${cur === k ? 'on' : ''}">${n}${k === 'tarjetas' && cardsDueCount() ? `<span class="badge">${cardsDueCount()}</span>` : ''}</a>`).join('')}</nav>`;
}
function tabsCurso() {
  const t = [['hoy', 'Hoy']];
  if (EXERCISES.length) t.push(['ejercicios', 'Ejercicios']);
  (CUR.modulos || []).forEach(m => { if (MODULOS[m]) t.push([m, MODULOS[m].nombre]); });
  if (CARDS.length) t.push(['tarjetas', 'Tarjetas']);
  if ((CUR.glosario || []).length) t.push(['glosario', 'Glosario']);
  return t;
}
function render() { renderHeader(); $('#view').innerHTML = VIEWS[cur](); if (typeof enlazarGlosario === 'function') enlazarGlosario($('#view')); }
function route() { let h = (location.hash || '#hoy').slice(1); if (h === 'papel') h = 'ejercicios'; const next = tabsCurso().some(x => x[0] === h) && VIEWS[h] ? h : 'hoy'; if (next !== cur) { stopTimer(); window.scrollTo(0, 0); } cur = next; render(); }

/* ===== HOY ===== */
function suggestEx() {
  const t = today();
  const due = EXERCISES.filter(e => P.papel[e.id] && P.papel[e.id].due <= t);
  if (due.length) return { ex: due[0], why: 'Toca repasarlo hoy' };
  const fresh = EXERCISES.filter(e => !P.papel[e.id]);
  if (!fresh.length) return { ex: EXERCISES[rnd(EXERCISES.length)], why: 'Ya hiciste todos: repite uno sin ayudas' };
  const pri = g => { const i = GROUPS.findIndex(x => x[0] === g); return i < 0 ? 99 : i; };
  fresh.sort((a, b) => (pri(a.group) - pri(b.group)) || (a.lvl - b.lvl));
  const g = GROUPS.find(x => x[0] === fresh[0].group);
  return { ex: fresh[0], why: 'Siguiente de ' + (g ? g[1] : 'la lista') };
}
VIEWS.hoy = () => {
  const t = today(), dayXp = S.dayKey === t ? S.dayXp : 0, n = cardsDueCount(), sg = EXERCISES.length ? suggestEx() : null;
  const exam = (key, label) => {
    const v = P.exams[key], d = v ? daysTo(v) : null;
    return `<div class="row spread"><label for="ex-${key}"><b>${esc(label)}</b></label><div class="row"><input type="date" id="ex-${key}" value="${v || ''}" data-chg="exam" data-key="${key}">
    ${d === null ? '<span class="muted small">pon la fecha</span>' : d < 0 ? '<span class="chip">ya pasó</span>' : `<span class="chip ${d <= 3 ? 'bad' : d <= 7 ? 'warn' : ''}">${d === 0 ? 'es hoy' : 'faltan ' + d + ' d'}</span>`}</div></div>`;
  };
  const pasos = [];
  if (CARDS.length) pasos.push(`<div class="card"><span class="eyebrow">Tarjetas</span><div class="big">${n}</div><div class="muted">por repasar hoy</div><a class="btn primary" href="#tarjetas" style="text-align:center;text-decoration:none">Repasar teoría</a></div>`);
  if (sg) pasos.push(`<div class="card"><span class="eyebrow">Ejercicio</span><h3 style="margin:.2em 0">${esc(sg.ex.n)} · ${esc(sg.ex.title)}</h3><div class="muted small">${esc(sg.why)}</div><button class="btn primary" data-act="openEx" data-id="${sg.ex.id}">Hacer este ejercicio</button></div>`);
  (CUR.modulos || []).forEach(m => { const h = MODULOS[m] && MODULOS[m].hoy; if (h) pasos.push(`<div class="card"><span class="eyebrow">${esc(MODULOS[m].nombre)}</span><h3 style="margin:.2em 0">${esc(h.titulo)}</h3><div class="muted small">${esc(h.texto)}</div><a class="btn primary" href="#${m}" style="text-align:center;text-decoration:none">${esc(h.boton)}</a></div>`); });
  const examenes = CUR.examenes || [];
  return `<div class="stack">
  <section class="hero"><div class="eyebrow">${esc(CUR.nombre)}</div><h1>${CUR.lema || 'A estudiar'}</h1>
  ${CUR.intro ? `<p class="muted" style="max-width:62ch">${CUR.intro}</p>` : ''}</section>
  ${pasos.length ? `<div class="grid g3 plan">${pasos.map((p, i) => p.replace('<span class="eyebrow">', `<span class="eyebrow">${i + 1} · `)).join('')}</div>` : '<div class="callout">Este ramo aún no tiene ejercicios ni tarjetas. Revisa docs/NUEVO-CURSO.md.</div>'}
  <div class="grid g2">
   <section class="card"><h2>Meta de hoy</h2><div class="bar"><i style="width:${Math.min(100, 100 * dayXp / DAILY)}%"></i></div><p class="muted small">${dayXp} de ${DAILY} XP. Con ${DAILY} XP al día mantienes la racha (es la misma para todos tus ramos).</p>
   ${examenes.length ? `<h3 style="margin-top:1em">Mis evaluaciones</h3><div class="stack" style="gap:8px">${examenes.map(e => exam(e.key, e.label)).join('')}</div>` : ''}</section>
   <section class="card"><h2>Mapa de dominio</h2>${TOPICS.map(tp => {
    const m = mastery(tp.id), p = m === null ? 0 : Math.round(m * 100);
    return `<div class="dom"><span class="small">${esc(tp.n)}</span><div class="bar"><i class="${m === null ? '' : p >= 75 ? 'hi' : p >= 45 ? 'mid' : 'lo'}" style="width:${p}%"></i></div><span class="small muted">${m === null ? 'sin datos' : p + '%'}</span></div>`;
  }).join('')}<p class="muted small">Se calcula con tus últimos 15 intentos por tema.</p></section>
  </div>
  ${syncCard()}
  <section class="card"><h2>Método (no te lo saltes)</h2><ol class="clean"><li><b>Intenta primero.</b> Escribe en una hoja, sin mirar. Fallar aquí es parte del aprendizaje.</li><li><b>Corrige con la rúbrica</b>, como lo haría tu profesor.</li><li><b>Baja las ayudas:</b> líneas ocultas → solo los TODO → sin esqueleto (da más XP).</li><li><b>Vuelve mañana.</b> Lo que fallaste regresa solo.</li></ol></section></div>`;
};

/* ===== EJERCICIOS ===== */
const EJ = { sel: null, mode: 'medio', hints: 0, revealed: false, ticks: {}, saved: false, run: false, t0: 0, acc: 0, iv: null, ans: {}, res: null, file: 0, solFile: 0 };
const MODES = { alto: 'Líneas clave ocultas', medio: 'Solo los TODO', ninguno: 'Sin esqueleto' };
const MMULT = { alto: .6, medio: 1, ninguno: 1.5 };
const exPts = ex => ex.rubric ? ex.rubric.reduce((a, r) => a + r.pts, 0) : (ex.fields || []).length;
const curEx = () => EXERCISES.find(e => e.id === EJ.sel);
function stopTimer() { if (EJ.iv) { clearInterval(EJ.iv); EJ.iv = null; } if (EJ.run) { EJ.acc += Date.now() - EJ.t0; EJ.run = false; } }
const fmtT = ms => { const s = Math.floor(ms / 1000); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
const elapsed = () => EJ.acc + (EJ.run ? Date.now() - EJ.t0 : 0);
function tick() { const el = $('#timer'); if (!el) { stopTimer(); return; } el.textContent = fmtT(elapsed()); el.classList.toggle('over', elapsed() > curEx().min * 60000); }
const norm = v => String(v ?? '').trim().toLowerCase().replace(/\s+/g, '');
function earned() {
  const ex = curEx(), max = exPts(ex);
  let got;
  if (ex.rubric) got = ex.rubric.reduce((a, r, i) => a + (EJ.ticks[i] ? r.pts : 0), 0);
  else got = EJ.res ? EJ.res.ok : 0;
  const pct = max ? Math.round(100 * got / max) : 0;
  const base = ex.rubric ? (10 + ex.lvl * 6) * (ex.files ? MMULT[EJ.mode] : 1) : (8 + ex.lvl * 4);
  return { got, max, pct, xp: Math.round(base * pct / 100 * Math.max(.3, 1 - .15 * (EJ.hints + (typeof penalizacionGuia === 'function' ? penalizacionGuia() : 0)))) };
}
function fieldsHtml(ex) {
  const done = !!EJ.res;
  return `<div class="card stack" style="gap:10px"><h3 style="margin:0">Tus respuestas</h3><div class="answers">${ex.fields.map(f => {
    const v = EJ.ans[f.k] ?? '', ok = done ? EJ.res.map[f.k] : null, st = done ? (ok ? 'ok' : 'bad') : '';
    const fix = done && !ok ? `<span class="fix">→ ${esc(f.ans[0])}</span>` : '';
    if (f.type === 'opt') return `<div class="ans ${st}" style="flex-wrap:wrap"><span class="evl" style="min-width:auto">${esc(f.label)}</span><div class="fldopt">${f.opts.map(o => `<button class="opt ${v === o ? 'on' : ''}" data-act="fldPick" data-k="${esc(f.k)}" data-v="${esc(o)}" ${done ? 'disabled' : ''}>${esc(o)}</button>`).join('')}</div>${fix}</div>`;
    return `<label class="ans ${st}"><span class="evl" style="min-width:auto;font-size:.85rem">${esc(f.label)}</span><input type="text" data-fld="${esc(f.k)}" value="${esc(v)}" autocomplete="off" ${done ? 'disabled' : ''}>${fix}</label>`;
  }).join('')}</div>
  ${done ? `<div class="row"><span class="score">${EJ.res.ok}/${ex.fields.length}</span><span class="muted">+${earned().xp} XP · guardado</span></div>` : `<div class="row"><button class="btn primary" data-act="fldCheck">Comprobar</button><span class="muted small">Resuélvelo primero en tu hoja.</span></div>`}</div>`;
}
VIEWS.ejercicios = () => {
  const t = today();
  if (!EJ.sel) {
    return `<div class="stack"><div><h1>Ejercicios</h1><p class="muted" style="max-width:62ch">${CUR.textoEjercicios || 'Intenta primero en papel; la solución aparece solo cuando la pides.'}</p></div>
    ${GROUPS.map(([g, name, sub]) => { const list = EXERCISES.filter(e => e.group === g); const done = list.filter(e => P.papel[e.id]).length;
      return `<section class="grp"><h2>${name} <small>${sub} · ${done}/${list.length} hechos</small></h2><div class="grid g2 ex-list">${list.map(e => {
        const s = P.papel[e.id], due = s && s.due <= t;
        return `<button class="card" data-act="openEx" data-id="${e.id}"><div class="row spread"><b>${esc(e.n)} · ${esc(e.title)}</b><span class="chip ${due ? 'warn' : s ? 'good' : ''}">${due ? 'repasar hoy' : s ? s.best + '%' : 'nuevo'}</span></div>
        <span class="muted small">${TNAME[e.topic] || ''} · ${'●'.repeat(e.lvl)}${'○'.repeat(3 - e.lvl)} · ~${e.min} min${e.files ? ' · código ' + (LANG_NAME[langOf(e)] || langOf(e)) : ' · teoría'}</span></button>`; }).join('')}</div></section>`; }).join('')}</div>`;
  }
  const ex = curEx(), R = earned(), files = ex.files || [], f = files[EJ.file] || null;
  const canReveal = !ex.fields || ex.rubric;
  return `<div class="stack"><div class="row spread"><button class="btn sm" data-act="exBack">← Ejercicios</button><span class="chip">${TNAME[ex.topic] || ''}</span></div>
  <div><div class="eyebrow">${esc(GROUPS.find(g => g[0] === ex.group)[1])} · ${esc(ex.n)}</div><h1>${esc(ex.title)}</h1><div class="muted small">${exPts(ex)} ${ex.rubric ? 'pts' : 'respuestas'} · tiempo sugerido ${ex.min} min</div></div>
  <div class="card glos"><h3>Enunciado</h3>${ex.statement}</div>
  ${conceptosHtml(ex)}
  ${ex.diagram ? `<div class="diag-wrap">${staticDiagram(ex.diagram)}</div>` : ''}
  ${ex.files && !EJ.revealed ? guiaHtml(ex) : ''}
  ${files.length ? `<div class="row"><span class="eyebrow">Dónde</span><div class="seg" role="group"><button class="${LUGAR === 'papel' ? 'on' : ''}" data-act="lugar" data-v="papel">En papel</button><button class="${LUGAR === 'pantalla' ? 'on' : ''}" data-act="lugar" data-v="pantalla">En pantalla + compilar</button></div><span class="muted small">${LUGAR === 'papel' ? 'como en la evaluación' : 'para comprobar que funciona'}</span></div>` : ''}
  ${files.length ? `<div class="row"><span class="eyebrow">Ayuda</span><div class="seg" role="group">${Object.entries(MODES).map(([k, n]) => `<button class="${EJ.mode === k ? 'on' : ''}" data-act="exMode" data-v="${k}">${n}</button>`).join('')}</div><span class="muted small">menos ayuda = más XP</span></div>
   ${LUGAR === 'pantalla' ? editorHtml(ex) : `${files.length > 1 ? `<div class="tabsf">${files.map((x, i) => `<button class="opt ${EJ.file === i ? 'on' : ''}" data-act="exFile" data-i="${i}">${esc(x.name)}</button>`).join('')}</div>` : ''}
   ${EJ.mode === 'ninguno' ? `<div class="callout">Escribe en tu hoja ${files.length > 1 ? 'los archivos ' + files.map(x => '<code>' + esc(x.name) + '</code>').join(', ') : '<code>' + esc(f.name) + '</code>'} desde cero, con los <code>#include</code>. Es lo más cercano a programar sin esqueleto.</div>`
     : `<pre class="code">${highlight(renderCode(f.code, EJ.mode, langOf(ex)), langOf(ex))}</pre><div class="muted small">${countTodos(f.code)} bloques TODO${EJ.mode === 'alto' ? ' · ' + countKeys(f.code) + ' líneas ocultas' : ''}</div>`}`}` : ''}
  ${ex.fields ? fieldsHtml(ex) : ''}
  <div class="card row spread"><div><div class="eyebrow">Cronómetro</div><div class="timer" id="timer">${fmtT(elapsed())}</div></div>
   <div class="row"><button class="btn" data-act="exTimer">${EJ.run ? 'Pausar' : 'Iniciar'}</button><button class="btn" data-act="exHint" ${EJ.hints >= (ex.hints || []).length || EJ.revealed ? 'disabled' : ''}>Pista (${EJ.hints}/${(ex.hints || []).length})</button></div></div>
  ${EJ.hints ? `<div class="callout warn glos"><ol class="clean" style="margin:0">${ex.hints.slice(0, EJ.hints).map(h => `<li>${esc(h)}</li>`).join('')}</ol></div>` : ''}
  ${!EJ.revealed ? (canReveal ? `<div class="callout"><b>Antes de seguir:</b> escribe tu solución en una hoja. Si miras primero, solo estás leyendo, no practicando.</div><div><button class="btn primary" data-act="exReveal">Ya escribí mi solución: ver y corregir</button></div>` : '') : solutionHtml(ex, R)}</div>`;
};
const LANG_NAME = { c: 'C', cpp: 'C++', java: 'Java', js: 'JavaScript', python: 'Python', sql: 'SQL' };
function comandoPara(ex, f) {
  const tpl = (ex.comandos && ex.comandos[f.name]) || CUR.comando;
  if (!tpl) return '';
  return tpl.replace(/\{archivo\}/g, f.name).replace(/\{base\}/g, f.name.replace(/\.[^.]+$/, ''));
}
function solutionHtml(ex, R) {
  const files = ex.files || [], sf = files[EJ.solFile];
  return `<div class="card glos"><h3>Cómo pensarlo</h3><ul class="clean">${ex.think.map(x => `<li>${x}</li>`).join('')}</ul></div>
  ${ex.solDiagram ? `<div><div class="eyebrow" style="margin-bottom:6px">Diagrama de la solución</div><div class="diag-wrap">${staticDiagram(ex.solDiagram)}</div></div>` : ''}
  ${files.length ? `<div><div class="eyebrow" style="margin-bottom:6px">Solución de referencia${CUR.solucionesProbadas ? ' (probada)' : ''}</div>${files.length > 1 ? `<div class="tabsf">${files.map((x, i) => `<button class="opt ${EJ.solFile === i ? 'on' : ''}" data-act="exSolFile" data-i="${i}">${esc(x.name)}</button>`).join('')}</div>` : ''}
   <pre class="code">${highlight(renderCode(sf.code, 'sol', langOf(ex)), langOf(ex))}</pre><div class="row" style="margin-top:6px"><button class="btn sm" data-act="exCopy">Copiar ${esc(sf.name)}</button>${comandoPara(ex, sf) ? `<span class="muted small">Para ejecutar: <code>${esc(comandoPara(ex, sf))}</code></span>` : ''}</div></div>` : ''}
  ${ex.out ? `<div><div class="eyebrow" style="margin-bottom:6px">Salida de ejemplo</div><pre class="code">${esc(ex.out)}</pre></div>` : ''}
  ${ex.qs ? `<div class="card glos"><h3>Preguntas del enunciado</h3>${ex.qs.map(q => `<div class="qa"><div class="qq">${q.q}</div><div>${q.a}</div></div>`).join('')}</div>` : ''}
  ${ex.errors ? `<div class="card glos"><h3>Errores típicos</h3><ul class="clean">${ex.errors.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
  ${ex.rubric ? `<div class="card rubric"><h3>Corrígete como el profesor</h3><p class="muted small">Marca solo lo que tu hoja tenía bien. Sé estricto.</p>
   ${ex.rubric.map((r, i) => `<label><input type="checkbox" data-act="exTick" data-i="${i}" ${EJ.ticks[i] ? 'checked' : ''} ${EJ.saved ? 'disabled' : ''}><span>${esc(r.t)}</span><span class="pts">${r.pts} pt</span></label>`).join('')}
   <div class="row spread" style="margin-top:12px"><div><span class="score">${R.got}/${R.max}</span> <span class="muted">${R.pct}% · +${R.xp} XP</span></div>
   ${EJ.saved ? '<span class="chip good">guardado</span>' : '<button class="btn primary" data-act="exSave">Guardar resultado</button>'}</div></div>` : ''}
  ${EJ.saved || (!ex.rubric && EJ.res) ? `<div class="row"><button class="btn" data-act="exAgain">Repetir este ejercicio</button><button class="btn" data-act="exNext">Siguiente ejercicio →</button></div>` : ''}`;
}
function saveResult(ex, R) {
  const prev = P.papel[ex.id];
  P.papel[ex.id] = { best: Math.max(R.pct, prev ? prev.best : 0), last: R.pct, due: addDays(today(), R.pct >= 85 ? 7 : R.pct >= 60 ? 3 : 1), n: (prev ? prev.n : 0) + 1 };
  record(ex.topic, R.pct >= 70); EJ.saved = true; save(); addXp(R.xp);
}

/* ===== TARJETAS ===== */
const CV = { queue: [], i: 0, shown: false, filter: 'all', on: false, done: 0 };
const INT = [0, 1, 3, 7, 14, 30];
function nextState(id, r) {
  let box = (P.cards[id] || { box: 0 }).box;
  box = r === 'again' ? 0 : r === 'hard' ? Math.max(1, box) : r === 'good' ? Math.min(5, box + 1) : Math.min(5, box + 2);
  return { box, days: r === 'again' ? 0 : r === 'hard' ? 1 : INT[box] };
}
function buildQueue(free) {
  const t = today(), pool = CARDS.filter(c => CV.filter === 'all' || c.t === CV.filter);
  if (free) return shuffle(pool).map(c => c.id).slice(0, 20);
  const due = pool.filter(c => P.cards[c.id] && P.cards[c.id].due <= t).sort((a, b) => P.cards[a.id].due.localeCompare(P.cards[b.id].due));
  const nw = shuffle(pool.filter(c => !P.cards[c.id])).slice(0, 10);
  return shuffle(due.concat(nw)).map(c => c.id).slice(0, 20);
}
const NOTA_TXT = { again: 'Otra vez', hard: 'Difícil', good: 'Bien', easy: 'Fácil' };
const cuandoTxt = d => d === 0 ? 'vuelve en esta sesión' : d === 1 ? 'vuelve mañana' : 'vuelve en ' + d + ' días';
function calificacionHtml(c) {
  const botones = (sug) => `<div class="rate">${['again', 'hard', 'good', 'easy'].map(r => { const ns = nextState(c.id, r); return `<button class="btn ${r === sug ? 'rec' : ''}" data-act="cRate" data-r="${r}">${NOTA_TXT[r]}<small>${ns.days === 0 ? 'hoy' : ns.days + ' d'}</small></button>`; }).join('')}</div>`;
  const cal = CV.cal;
  if (!cal) return `${c.claves ? '<p class="small muted" style="margin:0">Si escribes tu respuesta antes de revelar, se califica sola.</p>' : ''}${botones('')}`;
  const ok = cal.res.filter(x => x.ok).length, ns = nextState(c.id, cal.nota);
  return `<div class="card stack autocal ${cal.nota}" style="gap:8px">
    <div class="row spread"><b>Calificación automática: ${ok} de ${cal.res.length} ideas clave</b><span class="chip ${cal.nota === 'good' ? 'good' : cal.nota === 'hard' ? 'warn' : 'bad'}">${NOTA_TXT[cal.nota]}</span></div>
    <ul class="checks">${cal.res.map(x => `<li class="${x.ok ? 'ok' : 'bad'}"><span class="res ${x.ok ? 'ok' : 'bad'}">${x.ok ? '✓' : '✗'}</span> ${esc(x.label)}${x.ok ? '' : ' <span class="muted small">(no la encontré en tu respuesta)</span>'}</li>`).join('')}</ul>
    <div class="row"><button class="btn primary" data-act="cRate" data-r="${cal.nota}">Continuar · ${NOTA_TXT[cal.nota]} (${cuandoTxt(ns.days)})</button></div>
    <p class="small muted" style="margin:0">La revisión busca las ideas por palabras, así que puede equivocarse si lo dijiste de otra forma. Si no estás de acuerdo, califica tú:</p>
    ${botones(cal.nota)}</div>`;
}
VIEWS.tarjetas = () => {
  const t = today();
  if (!CV.on) {
    const pool = CARDS.filter(c => CV.filter === 'all' || c.t === CV.filter);
    const due = pool.filter(c => P.cards[c.id] && P.cards[c.id].due <= t).length, nw = pool.filter(c => !P.cards[c.id]).length, learned = pool.filter(c => P.cards[c.id] && P.cards[c.id].box >= 3).length;
    return `<div class="stack"><div><h1>Tarjetas de teoría</h1><p class="muted">Primero intenta responder de memoria (en voz alta o en papel). Luego revela y dile honestamente a la app qué tan bien te fue.</p></div>
    <div class="row">${[['all', 'Todo']].concat(TOPICS.map(x => [x.id, x.n])).map(([k, n]) => `<button class="opt ${CV.filter === k ? 'on' : ''}" data-act="cFilter" data-v="${k}">${n}</button>`).join('')}</div>
    <div class="grid g3"><div class="card"><div class="eyebrow">Por repasar</div><div class="score">${due}</div></div><div class="card"><div class="eyebrow">Nuevas</div><div class="score">${nw}</div></div><div class="card"><div class="eyebrow">Dominadas</div><div class="score">${learned}<span class="muted" style="font-size:1rem">/${pool.length}</span></div></div></div>
    <div class="row"><button class="btn primary" data-act="cStart" data-free="0" ${due + nw === 0 ? 'disabled' : ''}>Comenzar repaso</button><button class="btn" data-act="cStart" data-free="1">Repasar al azar (sin calendario)</button></div>
    ${due + nw === 0 ? '<p class="muted">No hay nada pendiente en este tema. Vuelve mañana o usa el repaso al azar.</p>' : ''}</div>`;
  }
  if (CV.i >= CV.queue.length) return `<div class="card stack"><h2>Sesión terminada</h2><p>Repasaste ${CV.done} tarjetas. Las que marcaste "Otra vez" volverán pronto.</p><div class="row"><button class="btn primary" data-act="cEnd">Volver</button></div></div>`;
  const c = CARDS.find(x => x.id === CV.queue[CV.i]);
  return `<div class="stack"><div class="row spread"><button class="btn sm" data-act="cEnd">← Salir</button><span class="muted small">${CV.i + 1} / ${CV.queue.length}</span></div>
  <div class="bar"><i style="width:${100 * CV.i / CV.queue.length}%"></i></div>
  <div class="card fc"><span class="chip">${TNAME[c.t]}</span><div class="q">${c.q}</div>
  ${!CV.shown ? `<label class="small muted" for="myans">Tu respuesta (opcional; también puedes responder en papel)</label><textarea id="myans">${esc(CV.mia || '')}</textarea><button class="btn primary" data-act="cShow">Mostrar respuesta</button>` :
      `<div class="comparar ${CV.mia && CV.mia.trim() ? '' : 'sola'}">${CV.mia && CV.mia.trim() ? `<div class="cmp-col"><div class="eyebrow">Tu respuesta</div><div class="cmp-mia">${esc(CV.mia)}</div></div>` : ''}
       <div class="cmp-col glos"><div class="eyebrow">Respuesta</div><div class="a">${c.a}</div></div></div>
       <p class="small muted" style="margin:0">Compara: ¿dijiste lo esencial (lo que está en negrita)? Si te faltó una idea clave, marca <b>Difícil</b> u <b>Otra vez</b>.</p>`}</div>
  ${CV.shown ? calificacionHtml(c) : ''}</div>`;
};

/* ===== Acciones ===== */
const ACT = {
  openEx(el) { stopTimer(); RUN.ultimo = null; EJ.pruebasOk = false; if (typeof LUGAR !== 'undefined' && LUGAR === 'pantalla' && RUN.estado !== 'ok') { if (vistoRunner()) iniciarRunner(); else pingRunner().then(render); }
    Object.assign(EJ, { guia: {}, guiaAbierta: false, verConceptos: false, sel: el.dataset.id, hints: 0, revealed: false, ticks: {}, saved: false, acc: 0, run: false, ans: {}, res: null, file: 0, solFile: 0 }); if (cur !== 'ejercicios') location.hash = '#ejercicios'; else render(); window.scrollTo(0, 0); },
  exBack() { stopTimer(); EJ.sel = null; render(); window.scrollTo(0, 0); },
  exMode(el) { EJ.mode = el.dataset.v; render(); },
  exFile(el) { EJ.file = +el.dataset.i; render(); },
  exSolFile(el) { EJ.solFile = +el.dataset.i; render(); },
  exTimer() { if (EJ.run) stopTimer(); else { EJ.run = true; EJ.t0 = Date.now(); EJ.iv = setInterval(tick, 500); } render(); },
  exHint() { EJ.hints++; render(); },
  exReveal() { stopTimer(); EJ.revealed = true; render(); },
  exTick(el) { EJ.ticks[el.dataset.i] = el.checked; const R = earned(), sc = $('.rubric .score'); if (sc) { sc.textContent = `${R.got}/${R.max}`; sc.nextElementSibling.textContent = ` ${R.pct}% · +${R.xp} XP`; } },
  exSave() { saveResult(curEx(), earned()); render(); },
  exAgain() { Object.assign(EJ, { guia: {}, guiaAbierta: false, hints: 0, revealed: false, ticks: {}, saved: false, acc: 0, ans: {}, res: null }); render(); window.scrollTo(0, 0); },
  exNext() { const i = EXERCISES.findIndex(e => e.id === EJ.sel), nx = EXERCISES[(i + 1) % EXERCISES.length]; ACT.openEx({ dataset: { id: nx.id } }); },
  async exCopy() { const ex = curEx(), f = ex.files[EJ.solFile]; try { await navigator.clipboard.writeText(renderCode(f.code, 'sol', langOf(ex))); toast('Copiado'); } catch (e) { toast('No se pudo copiar'); } },
  fldPick(el) { EJ.ans[el.dataset.k] = el.dataset.v; render(); },
  fldCheck() {
    const ex = curEx(), map = {}; let ok = 0;
    ex.fields.forEach(f => { map[f.k] = f.ans.some(a => norm(a) === norm(EJ.ans[f.k])); if (map[f.k]) ok++; });
    EJ.res = { map, ok }; stopTimer(); EJ.revealed = true;
    if (!ex.rubric) saveResult(ex, earned());
    render();
  },
  syNew() { syncConnect(newCode(), false); },
  syJoin() { const c = SY.pendingCode; if (!/^[a-z0-9-]{12,64}$/.test(c)) { toast('Código inválido'); return; } SY.confirm = true; render(); },
  syJoinYes() { SY.confirm = false; syncConnect(SY.pendingCode, true); },
  syJoinNo() { SY.confirm = false; render(); },
  async syCopy() { try { await navigator.clipboard.writeText(SY.code); toast('Código copiado'); } catch (e) { toast('Cópialo a mano'); } },
  syNow() { syncPull().then(render); },
  syOff() { syncSetCode(null); setSync('local'); render(); },
  cFilter(el) { CV.filter = el.dataset.v; render(); },
  cStart(el) { CV.queue = buildQueue(el.dataset.free === '1'); CV.i = 0; CV.shown = false; CV.mia = ''; CV.on = true; CV.done = 0; render(); },
  cEnd() { CV.on = false; render(); },
  cShow() {
    const t = $('#myans'); if (t) CV.mia = t.value; CV.shown = true;
    const c = CARDS.find(x => x.id === CV.queue[CV.i]);
    CV.cal = null;
    if (c && c.claves && (CV.mia || '').trim().split(/\s+/).length >= 2) {
      const res = calificarRespuesta(CV.mia, c.claves);
      CV.cal = { res, nota: notaDe(res.filter(x => x.ok).length / res.length) };
    }
    render();
  },
  cRate(el) {
    const id = CV.queue[CV.i], r = el.dataset.r, ns = nextState(id, r), c = CARDS.find(x => x.id === id);
    P.cards[id] = { box: ns.box, due: addDays(today(), ns.days) }; record(c.t, r === 'good' || r === 'easy');
    if (r === 'again' && CV.queue.slice(CV.i + 1).indexOf(id) < 0) CV.queue.push(id);
    CV.done++; CV.i++; CV.shown = false; CV.mia = ''; CV.cal = null; save(); addXp({ again: 0, hard: 2, good: 4, easy: 5 }[r]); render();
  },

};
document.addEventListener('click', e => { const el = e.target.closest('[data-act]'); if (!el || el.tagName === 'INPUT') return; ACT[el.dataset.act] && ACT[el.dataset.act](el, e); });
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.act === 'exTick') ACT.exTick(t);
  if (t.dataset.chg === 'exam') { P.exams[t.dataset.key] = t.value; save(); render(); }
  if (t.dataset.chg === 'curso') cambiarCurso(t.value);
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.fld !== undefined) EJ.ans[t.dataset.fld] = t.value;
  if (t.id === 'myans') CV.mia = t.value;
  if (t.id === 'sycode') SY.pendingCode = t.value.trim().toLowerCase();
});
function cambiarCurso(id) {
  stopTimer(); activarCurso(id); EJ.sel = null; CV.on = false; CV.filter = 'all'; save();
  if (location.hash && location.hash !== '#hoy') location.hash = '#hoy'; else render();
}
window.addEventListener('hashchange', route);
