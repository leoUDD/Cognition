/* Módulo "Drills": preguntas rápidas generadas (quórum, CAP, consistencia, Raft) */
/* ===== DRILLS ===== */
const DR = { kind: 'quorum', q: null, done: false, streak: 0 };
const DRK = [['quorum', 'Quórum'], ['particion', 'Particiones'], ['modelo', 'Modelo de consistencia'], ['cap', 'CP o AP'], ['voto', 'Voto en Raft'], ['log', 'Reparar log']];
function drNew() {
  DR.done = false; DR.ans = {}; const k = DR.kind;
  DR.q = k === 'quorum' ? genQuorumDrill() : k === 'particion' ? genPartitionDrill() : k === 'modelo' ? pick(MODEL_BANK) : k === 'cap' ? pick(CAP_BANK) : k === 'voto' ? genVoteDrill() : genLogDrill();
}
const topicOfDrill = { quorum: 'fallos', particion: 'fallos', modelo: 'consistencia', cap: 'cap', voto: 'raft', log: 'raft' };
function drResult(ok, html, xp) { DR.done = true; DR.ok = ok; DR.html = html; DR.streak = ok ? DR.streak + 1 : 0; record(topicOfDrill[DR.kind], ok); if (ok) addXp(xp || 8); else renderHeader(); }
VIEWS.drills = () => {
  if (!DR.q) drNew();
  const k = DR.kind, q = DR.q; let body = '';
  const optBtn = (v, t) => `<button class="opt ${DR.ans.v === v ? 'on' : ''}" data-act="drPick" data-v="${v}" ${DR.done ? 'disabled' : ''}>${t}</button>`;
  if (k === 'quorum') body = `<p>Un clúster tiene <b>N = ${q.N}</b> nodos.</p><div class="row"><label>Quórum (mayoría):<input type="number" id="d1" style="width:80px;margin-left:6px" value="${DR.ans.a ?? ''}" ${DR.done ? 'disabled' : ''}></label><label>Fallos que tolera:<input type="number" id="d2" style="width:80px;margin-left:6px" value="${DR.ans.b ?? ''}" ${DR.done ? 'disabled' : ''}></label></div>`;
  if (k === 'particion') body = `<p>Un clúster de <b>${q.N}</b> nodos se parte en dos grupos: <b>A = ${q.a}</b> nodos y <b>B = ${q.b}</b> nodos, sin comunicación entre ellos. ¿Quién puede seguir operando?</p><div class="row">${optBtn('A', 'Solo A')}${optBtn('B', 'Solo B')}${optBtn('N', 'Ninguno')}</div>`;
  if (k === 'modelo') body = `<p>Sistema: <b>${esc(q[0])}</b></p><p class="muted">¿Qué modelo de consistencia conviene?</p><div class="row">${optBtn('fuerte', 'Fuerte')}${optBtn('causal', 'Causal')}${optBtn('eventual', 'Eventual')}</div>`;
  if (k === 'cap') body = `<p>Sistema o comportamiento: <b>${esc(q[0])}</b></p><p class="muted">Ante una partición, ¿prioriza consistencia (CP) o disponibilidad (AP)?</p><div class="row">${optBtn('CP', 'CP')}${optBtn('AP', 'AP')}</div>`;
  if (k === 'voto') body = `<p>Un nodo recibe un <code>RequestVote</code>. ¿Concede el voto?</p><table class="t"><tr><th>Nodo ${q.node.id} (receptor)</th><th>RequestVote del candidato ${q.args.cand}</th></tr>
    <tr><td>current_term = ${q.node.term}<br>voted_for = ${q.node.voted === -1 ? 'nadie' : q.node.voted}<br>último log: term ${q.node.lastTerm}, índice ${q.node.lastIdx}</td><td>term = ${q.args.term}<br>candidate_id = ${q.args.cand}<br>último log: term ${q.args.lastTerm}, índice ${q.args.lastIdx}</td></tr></table>
    <div class="row" style="margin-top:10px">${optBtn('si', 'Concede el voto')}${optBtn('no', 'Rechaza')}</div>`;
  if (k === 'log') {
    const row = (arr, name) => `<div class="row"><b style="min-width:70px">${name}</b><div class="logrow">${arr.map((t, i) => `<span class="logbox"><small>${i + 1}</small>${t}</span>`).join('')}</div></div>`;
    body = `<p>Cada caja muestra el <b>term</b> de la entrada (el número pequeño es el índice, desde 1). El líder quiere reparar al follower.</p>${row(q.L, 'Líder')}${row(q.F, 'Follower')}
    <div class="row" style="margin-top:10px"><label>Último índice que coincide:<input type="number" id="d1" style="width:70px;margin-left:6px" value="${DR.ans.a ?? ''}" ${DR.done ? 'disabled' : ''}></label>
    <label>Entradas del follower que se borran:<input type="number" id="d2" style="width:70px;margin-left:6px" value="${DR.ans.b ?? ''}" ${DR.done ? 'disabled' : ''}></label>
    <label>Entradas que el líder debe enviar:<input type="number" id="d3" style="width:70px;margin-left:6px" value="${DR.ans.c ?? ''}" ${DR.done ? 'disabled' : ''}></label></div>`;
  }
  const needsCheck = ['quorum', 'log'].includes(k) || !DR.done && ['particion', 'modelo', 'cap', 'voto'].includes(k);
  return `<div class="stack"><div><h1>Drills rápidos</h1><p class="muted">Preguntas generadas al azar. Responde antes de mirar la explicación. Racha de aciertos: <b>${DR.streak}</b></p></div>
  <div class="row">${DRK.map(([id, n]) => `<button class="opt ${k === id ? 'on' : ''}" data-act="drKind" data-v="${id}">${n}</button>`).join('')}</div>
  <div class="card stack">${body}${DR.done ? `<div class="callout ${DR.ok ? '' : 'warn'}"><b>${DR.ok ? 'Correcto.' : 'No exactamente.'}</b> ${DR.html}</div>` : ''}
  <div class="row">${!DR.done ? '<button class="btn primary" data-act="drCheck">Comprobar</button>' : ''}<button class="btn" data-act="drNext">${DR.done ? 'Siguiente' : 'Saltar'}</button></div></div></div>`;
};


Object.assign(ACT, {
drKind(el) { DR.kind = el.dataset.v; drNew(); render(); },
  drPick(el) { DR.ans.v = el.dataset.v; render(); },
  drNext() { drNew(); render(); },
  drCheck() {
    const k = DR.kind, q = DR.q, g = id => { const e = document.getElementById(id); return e ? parseInt(e.value, 10) : NaN; };
    if (k === 'quorum') { DR.ans.a = g('d1'); DR.ans.b = g('d2'); const ok = DR.ans.a === q.q && DR.ans.b === q.f; drResult(ok, `Quórum = ⌊${q.N}/2⌋ + 1 = <b>${q.q}</b>. Tolera ${q.N} − ${q.q} = <b>${q.f}</b> fallos.${q.N % 2 === 0 ? ' Con N par se tolera lo mismo que con N−1: por eso se prefieren impares.' : ''}`, 10); }
    else if (k === 'particion') { if (!DR.ans.v) return toast('Elige una opción'); const ok = DR.ans.v === q.ans; drResult(ok, `Quórum para N=${q.N} es ${q.q}. A tiene ${q.a} y B tiene ${q.b}: ${q.ans === 'N' ? '<b>ninguno</b> alcanza mayoría.' : 'solo <b>' + q.ans + '</b> la alcanza.'}`); }
    else if (k === 'modelo' || k === 'cap') { if (!DR.ans.v) return toast('Elige una opción'); drResult(DR.ans.v === q[1], `Respuesta: <b>${q[1]}</b>. ${esc(q[2])}`); }
    else if (k === 'voto') { if (!DR.ans.v) return toast('Elige una opción'); drResult((DR.ans.v === 'si') === q.res.grant, q.res.why, 12); }
    else { DR.ans.a = g('d1'); DR.ans.b = g('d2'); DR.ans.c = g('d3'); const ok = DR.ans.a === q.k && DR.ans.b === q.del && DR.ans.c === q.send; drResult(ok, `El líder retrocede <code>prev_log_index</code> hasta la última entrada con igual índice y term: índice <b>${q.k}</b>. El follower borra lo que sigue (<b>${q.del}</b>) y el líder envía las entradas ${q.k + 1}…${q.L.length} (<b>${q.send}</b>).`, 14); }
    render();
  }
});
MODULOS.drills = { nombre: 'Drills' };
