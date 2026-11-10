/* Módulo "Relojes": laboratorio de Lamport y vector clocks con diagramas aleatorios */
/* ===== RELOJES ===== */
const LAB = { mode: 'lamport', diff: 'normal', sc: null, answers: {}, checked: false, awarded: false, pairs: [], err: null, sel: null, rule: '', fix: '', res: null };
const DIFF = { facil: { n: 8, hints: 3 }, normal: { n: 10, hints: 1 }, examen: { n: 12, hints: 0 } };
function labNew() {
  LAB.sc = computeAll(genScenario(3, DIFF[LAB.diff].n));
  LAB.answers = {}; LAB.checked = false; LAB.awarded = false; LAB.sel = null; LAB.rule = ''; LAB.fix = ''; LAB.res = null;
  if (LAB.mode === 'clasificar') { LAB.pairs = genPairs(LAB.sc, 6); LAB.pairs.forEach(p => p.pick = ''); }
  if (LAB.mode === 'error') { LAB.err = null; while (!LAB.err) { LAB.sc = computeAll(genScenario(3, DIFF[LAB.diff].n)); LAB.err = genError(LAB.sc); } }
}
function givenSet() { const s = new Set(), h = DIFF[LAB.diff].hints; for (let p = 0; p < h; p++) { const e = LAB.sc.evs.find(x => x.p === p); if (e) s.add(e.id); } return s; }
function svgDiagram(sc, o) {
  const step = o.step || 58, left = 56, top = 36, lane = 76, r = 13;
  const W = left + sc.evs.length * step + 14, H = top + (sc.nProc - 1) * lane + 40;
  const X = i => left + i * step + step / 2 - 6, Y = p => top + p * lane;
  let s = `<svg class="diag" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Diagrama espacio-tiempo"><defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="arrow-head"/></marker></defs>`;
  for (let p = 0; p < sc.nProc; p++) s += `<line class="lane" x1="${left - 12}" x2="${W - 6}" y1="${Y(p)}" y2="${Y(p)}"/><text class="lbl" x="12" y="${Y(p) + 4}">P${p + 1}</text>`;
  sc.evs.forEach(e => {
    if (e.type !== 'send' || e.recvId === undefined) return;
    const rc = sc.evs[e.recvId], x1 = X(e.id), y1 = Y(e.p), x2 = X(rc.id), y2 = Y(rc.p), d = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / d, uy = (y2 - y1) / d;
    s += `<line class="msg" x1="${x1 + ux * r}" y1="${y1 + uy * r}" x2="${x2 - ux * (r + 2)}" y2="${y2 - uy * (r + 2)}" marker-end="url(#arr)"/>`;
  });
  sc.evs.forEach(e => {
    const cls = (o.cls && o.cls[e.id]) || '', lab = o.label ? o.label(e) : null;
    s += `<g class="ev ${cls} ${o.click ? 'click' : ''}" transform="translate(${X(e.id)},${Y(e.p)})" ${o.click ? `data-act="evclick" data-ev="${e.id}" tabindex="0" role="button" aria-label="Evento ${e.letter}"` : ''}><circle r="${r}"/><text>${e.letter}</text>${lab !== null && lab !== undefined ? `<text class="val ${o.vec ? 'v' : ''} ${(o.badIds && o.badIds.includes(e.id)) ? 'bad' : ''}" y="-21">${esc(lab)}</text>` : ''}</g>`;
  });
  return s + '</svg>';
}
const parseNums = s => (String(s).match(/-?\d+/g) || []).map(Number);
VIEWS.relojes = () => {
  if (!LAB.sc) labNew();
  const sc = LAB.sc, vec = LAB.mode === 'vector', m = LAB.mode;
  let diagram = '', body = '';
  if (m === 'lamport' || m === 'vector') {
    const gv = givenSet(), cls = {};
    sc.evs.forEach(e => { if (gv.has(e.id)) cls[e.id] = 'given'; else if (LAB.res) cls[e.id] = LAB.res[e.id] ? 'ok' : 'bad'; });
    diagram = svgDiagram(sc, { step: vec ? 70 : 58, vec, cls, label: e => gv.has(e.id) ? (vec ? fmtV(e.V) : e.L) : null });
    body = `<div class="answers">${sc.evs.map(e => {
      const g = gv.has(e.id), st = g ? 'given' : LAB.res ? (LAB.res[e.id] ? 'ok' : 'bad') : '';
      const val = g ? (vec ? fmtV(e.V) : e.L) : (LAB.answers[e.id] ?? '');
      return `<label class="ans ${st}"><span class="evl">${e.letter}<small>P${e.p + 1} · ${{ local: 'interno', send: 'envío', recv: 'recep.' }[e.type]}</small></span>
      <input type="text" inputmode="${vec ? 'text' : 'numeric'}" autocomplete="off" data-ans="${e.id}" value="${esc(val)}" placeholder="${vec ? '1,0,0' : 'C'}" ${g || LAB.checked ? 'disabled' : ''} aria-label="Reloj del evento ${e.letter}">
      ${LAB.res && !LAB.res[e.id] && !g ? `<span class="fix">→ ${vec ? fmtV(e.V) : e.L}</span>` : ''}</label>`;
    }).join('')}</div>
    <div class="row"><button class="btn primary" data-act="labCheck" ${LAB.checked ? 'disabled' : ''}>Corregir</button><button class="btn" data-act="labNew">Nuevo diagrama</button></div>
    ${LAB.checked ? `<div class="card"><h3>Resolución paso a paso</h3><ol class="steps">${(vec ? stepsVector(sc) : stepsLamport(sc)).map(x => `<li>${x}</li>`).join('')}</ol></div>` : ''}`;
  } else if (m === 'clasificar') {
    diagram = svgDiagram(sc, { label: e => e.L });
    body = `<p class="muted">Los números son los timestamps de Lamport. <b>Ojo:</b> no los uses para decidir; una causalidad se demuestra con un camino de flechas y líneas de proceso.</p>
    <div class="stack" style="gap:10px">${LAB.pairs.map((p, i) => {
      const a = sc.evs[p.x].letter, b = sc.evs[p.y].letter, st = LAB.checked ? (p.pick === p.rel ? 'ok' : 'bad') : '';
      let ex = '';
      if (LAB.checked) {
        const rel = p.rel; ex = rel === 'c' ? `Sin camino entre ${a} y ${b} en ningún sentido: <b>concurrentes</b> (L=${sc.evs[p.x].L} y ${sc.evs[p.y].L} no lo deciden).`
          : `Camino: <b>${(rel === 'a' ? findPath(sc, p.x, p.y) : findPath(sc, p.y, p.x)).map(id => sc.evs[id].letter).join(' → ')}</b>. Por tanto ${rel === 'a' ? a + ' ocurre antes que ' + b : b + ' ocurre antes que ' + a}.`;
      }
      return `<div class="pairrow ${st}"><span class="pr">${a}, ${b}</span>${[['a', `${a} → ${b}  (antes)`], ['d', `${a} ← ${b}  (después)`], ['c', `${a} ∥ ${b}  (concurrentes)`]].map(([v, t]) => `<button class="opt ${p.pick === v ? 'on' : ''}" data-act="pairPick" data-i="${i}" data-v="${v}" ${LAB.checked ? 'disabled' : ''}>${t}</button>`).join('')}
      ${ex ? `<div class="small" style="flex-basis:100%">${ex}</div>` : ''}</div>`;
    }).join('')}</div>
    <div class="row"><button class="btn primary" data-act="labCheck" ${LAB.checked ? 'disabled' : ''}>Corregir</button><button class="btn" data-act="labNew">Nuevo diagrama</button></div>`;
  } else {
    const er = LAB.err, cls = {}; if (LAB.sel !== null) cls[LAB.sel] = 'sel'; if (LAB.checked) { cls[er.ev] = 'bad'; }
    diagram = svgDiagram(sc, { click: !LAB.checked, cls, badIds: LAB.checked ? [er.ev] : [], label: e => e.id === er.ev ? er.wrong : e.L });
    const rs = { seq: 'Regla 2: evento interno o envío → C ← C + 1', recv: 'Regla 4: recepción → C ← max(C, T) + 1' };
    body = `<p class="muted">Exactamente un timestamp está mal. <b>1)</b> Toca el evento. <b>2)</b> Di qué regla se viola. <b>3)</b> Escribe el valor correcto.</p>
    <div class="callout">Evento elegido: <b>${LAB.sel === null ? '—' : sc.evs[LAB.sel].letter}</b></div>
    <div class="row">${['seq', 'recv'].map(k => `<button class="opt ${LAB.rule === k ? 'on' : ''}" data-act="rulePick" data-v="${k}" ${LAB.checked ? 'disabled' : ''}>${rs[k]}</button>`).join('')}</div>
    <div class="row"><label for="fix">Timestamp correcto:</label><input type="text" id="fix" inputmode="numeric" style="width:90px" value="${esc(LAB.fix)}" data-fix ${LAB.checked ? 'disabled' : ''}></div>
    <div class="row"><button class="btn primary" data-act="labCheck" ${LAB.checked ? 'disabled' : ''}>Corregir</button><button class="btn" data-act="labNew">Nuevo diagrama</button></div>
    ${LAB.checked ? `<div class="card">${LAB.res.html}</div>` : ''}`;
  }
  return `<div class="stack"><div><h1>Laboratorio de relojes</h1><p class="muted">Diagramas nuevos cada vez. Calcula en papel, escribe tus respuestas y compara.</p></div>
  <div class="row"><div class="seg" role="group" aria-label="Ejercicio">${[['lamport', 'Lamport'], ['vector', 'Vector'], ['clasificar', 'Clasificar pares'], ['error', 'Encontrar el error']].map(([k, n]) => `<button class="${m === k ? 'on' : ''}" data-act="labMode" data-v="${k}">${n}</button>`).join('')}</div>
  <div class="seg" role="group" aria-label="Dificultad">${[['facil', 'Fácil'], ['normal', 'Normal'], ['examen', 'Examen']].map(([k, n]) => `<button class="${LAB.diff === k ? 'on' : ''}" data-act="labDiff" data-v="${k}">${n}</button>`).join('')}</div></div>
  <div class="diag-wrap">${diagram}</div>${body}</div>`;
};


Object.assign(ACT, {
  labMode(el) { LAB.mode = el.dataset.v; labNew(); render(); },
  labDiff(el) { LAB.diff = el.dataset.v; labNew(); render(); },
  labNew() { labNew(); render(); },
  evclick(el) { if (LAB.checked) return; LAB.sel = +el.dataset.ev; render(); },
  pairPick(el) { LAB.pairs[+el.dataset.i].pick = el.dataset.v; render(); },
  rulePick(el) { LAB.rule = el.dataset.v; render(); },
  labCheck() {
    const sc = LAB.sc, m = LAB.mode; let ok = 0, tot = 0;
    if (m === 'lamport' || m === 'vector') {
      const gv = givenSet(); LAB.res = {};
      sc.evs.forEach(e => {
        if (gv.has(e.id)) return; tot++;
        const a = LAB.answers[e.id] ?? '';
        const good = m === 'lamport' ? (a.trim() !== '' && parseInt(a, 10) === e.L && /^\s*\d+\s*$/.test(a)) : (() => { const v = parseNums(a); return v.length === 3 && v.every((x, i) => x === e.V[i]); })();
        LAB.res[e.id] = good; if (good) ok++;
      });
      LAB.checked = true;
      if (!LAB.awarded) { LAB.awarded = true; sc.evs.filter(e => !gv.has(e.id)).forEach(e => record(m, LAB.res[e.id])); addXp(ok * 4 + (ok === tot ? 20 : 0)); }
    } else if (m === 'clasificar') {
      LAB.pairs.forEach(p => { tot++; if (p.pick === p.rel) ok++; });
      LAB.checked = true;
      if (!LAB.awarded) { LAB.awarded = true; LAB.pairs.forEach(p => record('lamport', p.pick === p.rel)); addXp(ok * 6 + (ok === tot ? 15 : 0)); }
    } else {
      const er = LAB.err, e = sc.evs[er.ev], a = LAB.sel === er.ev, b = LAB.rule === er.rule, c = parseInt(LAB.fix, 10) === er.correct;
      const why = e.type === 'recv' ? `Era una recepción de <b>${sc.evs[e.from].letter}</b> con T=${e.T}: max(${e.preL}, ${e.T}) + 1 = <b>${er.correct}</b>.` : `Era un evento ${e.type === 'send' ? 'de envío' : 'interno'}: ${e.preL} + 1 = <b>${er.correct}</b>.`;
      LAB.res = { html: `<h3>${a && b && c ? 'Perfecto' : 'Resultado'}</h3><ul class="clean"><li>Evento con error: <b>${e.letter}</b> (marcaste ${LAB.sel === null ? 'ninguno' : sc.evs[LAB.sel].letter}) ${a ? '✓' : '✗'}</li><li>Regla violada: ${er.rule === 'recv' ? 'Regla 4 (recepción)' : 'Regla 2 (interno/envío)'} ${b ? '✓' : '✗'}</li><li>Valor correcto: ${er.correct} ${c ? '✓' : '✗'}</li></ul><p>${why} Estaba escrito ${er.wrong}.</p>` };
      LAB.checked = true;
      if (!LAB.awarded) { LAB.awarded = true; record('lamport', a && b && c); addXp((a ? 10 : 0) + (b ? 8 : 0) + (c ? 12 : 0)); }
    }
    render();
  }
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.ans !== undefined) LAB.answers[t.dataset.ans] = t.value;
  if (t.hasAttribute && t.hasAttribute('data-fix')) LAB.fix = t.value;
});
document.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('g[data-act="evclick"]')) { e.preventDefault(); ACT.evclick(e.target); } });
MODULOS.relojes = { nombre: 'Relojes', hoy: { titulo: 'Un diagrama nuevo', texto: 'Calcula Lamport o vectores a mano y compruébalo.', boton: 'Ir al laboratorio' } };
