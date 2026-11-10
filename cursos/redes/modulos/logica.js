/* Lógica de los módulos de Redes (escenarios de relojes y drills). Usa rnd/pick/shuffle/esc del motor. */
const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
/* ---- Escenarios de eventos distribuidos ---- */
function genScenario(nProc, nEv) {
  for (let attempt = 0; attempt < 500; attempt++) {
    const evs = [], pending = [];
    while (evs.length < nEv) {
      const remaining = nEv - evs.length;
      let p, type, msg = null;
      if (pending.length >= remaining) { msg = pending.shift(); p = msg.to; type = 'recv'; }
      else {
        p = rnd(nProc);
        const inbox = pending.filter(m => m.to === p);
        const r = Math.random();
        if (inbox.length && r < 0.5) { msg = inbox[0]; pending.splice(pending.indexOf(msg), 1); type = 'recv'; }
        else if (r < 0.82 && pending.length + 1 <= remaining - 1) type = 'send';
        else type = 'local';
      }
      const ev = { id: evs.length, p, type, letter: LETTERS[evs.length] };
      if (type === 'send') {
        let q = rnd(nProc - 1); if (q >= p) q++;
        const m = { from: p, to: q, send: ev.id };
        ev.to = q; ev.msg = m; pending.push(m);
      }
      if (type === 'recv') { ev.from = msg.send; ev.fromProc = msg.from; msg.recv = ev.id; evs[msg.send].recvId = ev.id; }
      evs.push(ev);
    }
    const counts = Array(nProc).fill(0); evs.forEach(e => counts[e.p]++);
    const msgs = evs.filter(e => e.type === 'send').length;
    if (counts.every(c => c >= 2) && msgs >= 3) return { nProc, evs };
  }
  throw new Error('no scenario');
}

function computeAll(sc) {
  const n = sc.nProc, C = Array(n).fill(0), V = Array.from({ length: n }, () => Array(n).fill(0));
  sc.evs.forEach(e => {
    e.preL = C[e.p]; e.preV = V[e.p].slice();
    if (e.type === 'recv') {
      const src = sc.evs[e.from]; e.T = src.L; e.W = src.V.slice();
      C[e.p] = Math.max(C[e.p], e.T) + 1;
      V[e.p][e.p]++;
      for (let j = 0; j < n; j++) if (j !== e.p) V[e.p][j] = Math.max(V[e.p][j], e.W[j]);
    } else { C[e.p]++; V[e.p][e.p]++; }
    e.L = C[e.p]; e.V = V[e.p].slice();
  });
  /* happened-before: ancestros por evento */
  const last = Array(n).fill(-1);
  sc.evs.forEach(e => {
    const preds = [];
    if (last[e.p] >= 0) preds.push(last[e.p]);
    if (e.type === 'recv') preds.push(e.from);
    e.preds = preds;
    e.anc = new Set();
    preds.forEach(q => { e.anc.add(q); sc.evs[q].anc.forEach(x => e.anc.add(x)); });
    last[e.p] = e.id;
  });
  return sc;
}
/* relación entre x e y: 'a' x→y, 'd' y→x, 'c' concurrentes */
function relation(sc, x, y) {
  if (sc.evs[y].anc.has(x)) return 'a';
  if (sc.evs[x].anc.has(y)) return 'd';
  return 'c';
}
/* camino causal de a a b (lista de ids) */
function findPath(sc, a, b) {
  const prev = { [b]: null }, queue = [b];
  while (queue.length) {
    const cur = queue.shift();
    if (cur === a) { const path = []; let c = a; while (c !== null) { path.push(c); c = prev[c]; } return path; }
    for (const q of sc.evs[cur].preds) if (!(q in prev)) { prev[q] = cur; queue.push(q); }
  }
  return null;
}
function genPairs(sc, k) {
  const all = [];
  for (let i = 0; i < sc.evs.length; i++) for (let j = i + 1; j < sc.evs.length; j++) all.push([i, j]);
  const conc = shuffle(all.filter(([i, j]) => relation(sc, i, j) === 'c'));
  const caus = shuffle(all.filter(([i, j]) => relation(sc, i, j) !== 'c'));
  const chosen = conc.slice(0, Math.ceil(k / 2)).concat(caus.slice(0, k - Math.min(conc.length, Math.ceil(k / 2))));
  return shuffle(chosen).map(([i, j]) => Math.random() < 0.5 ? { x: i, y: j } : { x: j, y: i })
    .map(p => ({ ...p, rel: relation(sc, p.x, p.y) }));
}
/* un único timestamp incorrecto, en un evento del que nada depende */
function genError(sc) {
  const lastOf = {}; sc.evs.forEach(e => lastOf[e.p] = e);
  const cands = Object.values(lastOf).filter(e => e.type !== 'send');
  if (!cands.length) return null;
  const e = pick(cands);
  let wrong; do { wrong = e.L + pick([-2, -1, 1, 2, 3]); } while (wrong < 1 || wrong === e.L);
  return { ev: e.id, wrong, correct: e.L, rule: e.type === 'recv' ? 'recv' : 'seq' };
}
const fmtV = v => '[' + v.join(',') + ']';
function stepsLamport(sc) {
  return sc.evs.map(e => {
    const P = 'P' + (e.p + 1);
    if (e.type === 'local') return `<b>${e.letter}</b> (${P}, interno): ${e.preL} + 1 = <b>${e.L}</b>`;
    if (e.type === 'send') return `<b>${e.letter}</b> (${P}, envía a P${e.to + 1}): ${e.preL} + 1 = <b>${e.L}</b>; el mensaje lleva ts=${e.L}`;
    return `<b>${e.letter}</b> (${P}, recibe de <b>${sc.evs[e.from].letter}</b> con T=${e.T}): max(${e.preL}, ${e.T}) + 1 = <b>${e.L}</b>`;
  });
}
function stepsVector(sc) {
  return sc.evs.map(e => {
    const P = 'P' + (e.p + 1);
    if (e.type === 'local') return `<b>${e.letter}</b> (${P}, interno): ${fmtV(e.preV)} → V[${e.p + 1}]++ = <b>${fmtV(e.V)}</b>`;
    if (e.type === 'send') return `<b>${e.letter}</b> (${P}, envía a P${e.to + 1}): ${fmtV(e.preV)} → V[${e.p + 1}]++ = <b>${fmtV(e.V)}</b>; el mensaje lleva ese vector`;
    return `<b>${e.letter}</b> (${P}, recibe de <b>${sc.evs[e.from].letter}</b> con W=${fmtV(e.W)}): V[${e.p + 1}]++ y máximo componente a componente de ${fmtV(e.preV)} y W = <b>${fmtV(e.V)}</b>`;
  });
}

/* ---- Drills ---- */
const MODEL_BANK = [
  ['Transferencias bancarias entre cuentas', 'fuerte', 'Dinero: todos deben ver el saldo más reciente. Se paga latencia y disponibilidad (2PC).'],
  ['Carrito de compras de una tienda global', 'eventual', 'Mejor mostrar un carrito con extras que perder una venta (filosofía de Amazon/DynamoDB).'],
  ['Hilo de respuestas en un chat: nadie debe ver una respuesta antes del mensaje original', 'causal', 'Hay relación causa-efecto entre mensajes; el orden causal basta y se implementa con vector clocks.'],
  ['Propagación de un cambio de registro DNS', 'eventual', 'Tarda minutos u horas; durante la propagación hay respuestas distintas. Ejemplo clásico de eventual.'],
  ['Inventario de entradas con asientos numerados (no vender dos veces el mismo)', 'fuerte', 'Vender dos veces el mismo asiento es inaceptable: necesita la última escritura siempre.'],
  ['Edición colaborativa de un documento tipo Google Docs', 'causal', 'Las ediciones relacionadas deben respetar su orden; las concurrentes se mezclan (CRDTs).'],
  ['Contador de "me gusta" de una red social', 'eventual', 'Un número levemente desactualizado no daña a nadie; prioriza velocidad y disponibilidad.'],
  ['Historial de mensajes del chat distribuido del curso', 'fuerte', 'Fuente de verdad: todos deben ver el mismo historial; hay servidor único coordinador.'],
  ['Comentarios y respuestas en una red social (la respuesta no puede verse antes de la publicación)', 'causal', 'Causalidad entre publicación y respuesta, sin necesidad de sincronizar todo el sistema.'],
  ['Notificaciones de sistema del chat', 'eventual', 'No afectan el flujo del chat; pueden llegar con retraso.']
];
const CAP_BANK = [
  ['HBase', 'CP', 'Ejemplo CP del curso: prioriza consistencia ante particiones.'],
  ['Cassandra', 'AP', 'Multi-master con consistencia eventual: prioriza disponibilidad.'],
  ['Google Spanner', 'CP', 'Consistencia fuerte global; el lado sin quórum no escribe.'],
  ['Amazon DynamoDB', 'AP', 'Prioriza disponibilidad, reconcilia con vector clocks.'],
  ['MongoDB (configuración por defecto)', 'CP', 'Según el curso, CP por defecto.'],
  ['Riak', 'AP', 'AP: ambos lados aceptan escrituras y se reconcilian después.'],
  ['Un sistema donde el lado minoritario de una partición rechaza las escrituras', 'CP', 'Rechazar escrituras en el lado minoritario sacrifica A para mantener C.'],
  ['Un sistema donde ambos lados de una partición aceptan escrituras y reconcilian al sanar la red', 'AP', 'Sacrifica C temporal para mantener A.']
];
function genQuorumDrill() {
  const N = pick([3, 4, 5, 6, 7, 9]); const q = Math.floor(N / 2) + 1;
  return { N, q, f: N - q };
}
function genPartitionDrill() {
  const N = pick([5, 5, 6, 7, 9]); const a = 1 + rnd(N - 1), b = N - a; const q = Math.floor(N / 2) + 1;
  const ans = a >= q ? 'A' : b >= q ? 'B' : 'N';
  return { N, a, b, q, ans };
}
function raftVote(node, args) {
  let term = node.term, voted = node.voted;
  if (args.term < term) return { grant: false, why: `Rechaza: term del candidato (${args.term}) &lt; term actual (${term}).` };
  const bump = args.term > term;
  if (bump) { term = args.term; voted = -1; }
  if (voted !== -1 && voted !== args.cand) return { grant: false, why: `Rechaza: ya votó por el nodo ${voted} en este term (un voto por term).${bump ? '' : ''}` };
  if (args.lastTerm < node.lastTerm) return { grant: false, why: `Rechaza: el último term del log del candidato (${args.lastTerm}) es menor que el suyo (${node.lastTerm}); log menos actualizado.` };
  if (args.lastTerm === node.lastTerm && args.lastIdx < node.lastIdx) return { grant: false, why: `Rechaza: mismo último term (${node.lastTerm}) pero el log del candidato es más corto (índice ${args.lastIdx} &lt; ${node.lastIdx}).` };
  return { grant: true, why: `Concede: term ${args.term} ≥ ${node.term}${bump ? ' (actualiza su term y borra su voto)' : ''}, no hay voto previo contrario y el log del candidato está al menos tan actualizado.` };
}
function genVoteDrill() {
  const node = { id: 1 + rnd(4), term: 2 + rnd(4), voted: -1, lastTerm: 1 + rnd(3), lastIdx: 3 + rnd(4) };
  const cand = (node.id + 1 + rnd(3)) % 5;
  const args = { term: node.term + pick([0, 1, 1]), cand, lastTerm: node.lastTerm, lastIdx: node.lastIdx + pick([0, 1, 2]) };
  if (Math.random() < 0.5) node.voted = pick([-1, cand]); 
  const bad = Math.random() < 0.65 ? rnd(4) : -1;
  if (bad === 0) args.term = node.term - 1;
  if (bad === 1) { node.voted = (cand + 1 + rnd(3)) % 5; args.term = node.term; }
  if (bad === 2) args.lastTerm = node.lastTerm - 1;
  if (bad === 3) { args.lastTerm = node.lastTerm; args.lastIdx = node.lastIdx - 1; }
  if (args.term < 1) args.term = 1;
  return { node, args, res: raftVote(node, args) };
}
function genLogDrill() {
  const m = 5 + rnd(3), k = 1 + rnd(m - 2);
  const L = []; let t = 1;
  for (let i = 1; i <= m; i++) { if (i === k + 1 || Math.random() < 0.35) t++; L.push(t); }
  const e = 1 + rnd(2), tf = L[k - 1] + rnd(L[k] - L[k - 1]); /* en [L[k], L[k+1]-1] */
  const F = L.slice(0, k); for (let i = 0; i < e; i++) F.push(tf);
  return { L, F, k, del: e, send: m - k };
}
