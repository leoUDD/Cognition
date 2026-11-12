/* ===== Guía paso a paso, glosario y conceptos ===== */
/* ---------- Glosario: marcar términos en los textos ---------- */
let GLOS_RE = null, GLOS_MAP = {};
function prepararGlosario() {
  GLOS_MAP = {}; const formas = [];
  (CUR.glosario || []).forEach(g => [g.t].concat(g.alias || []).forEach(f => { if (f && f.length > 1) { GLOS_MAP[f.toLowerCase()] = g.id; formas.push(f); } }));
  if (!formas.length) { GLOS_RE = null; return; }
  formas.sort((a, b) => b.length - a.length);
  const escRe = x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  GLOS_RE = new RegExp('(?<![\\p{L}\\p{N}_])(' + formas.map(escRe).join('|') + ')(?![\\p{L}\\p{N}_])', 'giu');
}
const glosId = txt => GLOS_MAP[txt.toLowerCase()];
const glosTerm = id => (CUR.glosario || []).find(g => g.id === id);
/* Marca la primera aparición de cada término dentro de cada elemento .glos */
function enlazarGlosario(root) {
  if (!GLOS_RE || !root) return;
  root.querySelectorAll('.glos').forEach(cont => {
    const vistos = new Set(), walker = document.createTreeWalker(cont, NodeFilter.SHOW_TEXT, {
      acceptNode: n => n.parentElement.closest('pre, button, a, input, textarea, .term, .nog') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
    const nodos = []; while (walker.nextNode()) nodos.push(walker.currentNode);
    nodos.forEach(n => {
      const txt = n.nodeValue; GLOS_RE.lastIndex = 0; let m, last = 0, frag = null;
      while ((m = GLOS_RE.exec(txt))) {
        const id = glosId(m[1]); if (!id || vistos.has(id)) continue;
        vistos.add(id); frag = frag || document.createDocumentFragment();
        frag.appendChild(document.createTextNode(txt.slice(last, m.index)));
        const b = document.createElement('button'); b.className = 'term'; b.dataset.act = 'glos'; b.dataset.id = id; b.type = 'button'; b.textContent = m[1];
        b.title = 'Ver qué es'; frag.appendChild(b); last = m.index + m[1].length;
      }
      if (frag) { frag.appendChild(document.createTextNode(txt.slice(last))); n.parentNode.replaceChild(frag, n); }
    });
  });
}
/* Conceptos que aparecen en un ejercicio (enunciado, pistas, explicación, preguntas) */
function conceptosDe(ex) {
  if (!GLOS_RE) return [];
  const txt = [ex.statement, ...(ex.hints || []), ...(ex.think || []), ...(ex.qs || []).flatMap(q => [q.q, q.a]),
    ...(ex.files || []).flatMap(f => parseCode(f.code).filter(i => i.blk).flatMap(i => [i.blk.desc, i.blk.pregunta, ...i.blk.pasos]))]
    .join(' ').replace(/<[^>]+>/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  const ids = []; GLOS_RE.lastIndex = 0; let m;
  while ((m = GLOS_RE.exec(txt))) { const id = glosId(m[1]); if (id && !ids.includes(id)) ids.push(id); }
  return ids;
}
function conceptosHtml(ex) {
  const ids = conceptosDe(ex); if (!ids.length) return '';
  return `<details class="card conceptos" ${EJ.verConceptos ? 'open' : ''}><summary><b>Conceptos que usa este ejercicio</b> <span class="muted small">(${ids.length}) · tócalos para repasarlos antes de empezar</span></summary>
  <div class="chips">${ids.map(id => `<button class="chipbtn" data-act="glos" data-id="${id}">${esc(glosTerm(id).t)}</button>`).join('')}</div></details>`;
}
function patronesHtml(ex) {
  const refs = (ex.patrones || []).map(id => (CUR.referencia || []).find(r => r.id === id)).filter(Boolean);
  if (!refs.length) return '';
  return `<div class="card patrones"><b>Patrones que usa</b> <span class="muted small">· parte desde su esqueleto</span>
  <div class="chips">${refs.map(r => `<button class="chipbtn pat" data-act="refAbrir" data-id="${r.id}">${esc(r.titulo)}</button>`).join('')}</div></div>`;
}
function glosFicha(g, conBotones) {
  return `<div class="gf"><div class="gf-t">${esc(g.t)}</div><div class="gf-d">${g.def}</div>
  ${g.ej ? `<pre class="code gf-ej">${highlight(g.ej, CUR.lenguaje)}</pre>` : ''}
  ${conBotones && g.ver && g.ver.length ? `<div class="row small">Relacionado: ${g.ver.map(v => `<button class="chipbtn" data-act="glos" data-id="${v}">${esc(glosTerm(v).t)}</button>`).join('')}</div>` : ''}</div>`;
}
function abrirPop(id, ancla) {
  const g = glosTerm(id); if (!g) return;
  let p = $('#glospop'); if (!p) { p = document.createElement('div'); p.id = 'glospop'; p.setAttribute('role', 'dialog'); document.body.appendChild(p); }
  p.innerHTML = `<button class="gp-x" data-act="glosClose" aria-label="Cerrar">×</button>${glosFicha(g, true)}<a class="small" href="#glosario" data-act="glosClose">Abrir el glosario completo</a>`;
  p.classList.add('on');
  const r = ancla.getBoundingClientRect(), w = Math.min(380, window.innerWidth - 24);
  p.style.width = w + 'px';
  p.style.left = Math.max(12, Math.min(r.left + window.scrollX, window.scrollX + window.innerWidth - w - 12)) + 'px';
  p.style.top = (r.bottom + window.scrollY + 6) + 'px';
}
function cerrarPop() { const p = $('#glospop'); if (p) p.classList.remove('on'); }
document.addEventListener('click', e => { if (!e.target.closest('#glospop') && !e.target.closest('[data-act="glos"]')) cerrarPop(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarPop(); });
const GL = { q: '' };
VIEWS.glosario = () => {
  const q = GL.q.trim().toLowerCase();
  const lista = (CUR.glosario || []).filter(g => !q || [g.t, ...(g.alias || []), g.def.replace(/<[^>]+>/g, '')].join(' ').toLowerCase().includes(q))
    .sort((a, b) => a.t.localeCompare(b.t, 'es', { sensitivity: 'base' }));
  return `<div class="stack"><div><h1>Glosario</h1><p class="muted">Los conceptos del ramo explicados corto. En los ejercicios, los términos subrayados abren su definición.</p></div>
  <input type="text" id="glosq" placeholder="Buscar: fork, quórum, happens-before…" value="${esc(GL.q)}" autocomplete="off" aria-label="Buscar en el glosario" style="max-width:420px">
  <div class="grid g2 glos-list">${lista.map(g => `<div class="card" id="g-${g.id}">${glosFicha(g, true)}</div>`).join('') || '<p class="muted">Sin resultados.</p>'}</div></div>`;
};
document.addEventListener('input', e => {
  if (e.target.id === 'glosq') { GL.q = e.target.value; const pos = e.target.selectionStart; render(); const i = $('#glosq'); if (i) { i.focus(); i.setSelectionRange(pos, pos); } }
});

/* ---------- Guía paso a paso ---------- */
function bloquesDe(ex) {
  const out = [];
  (ex.files || []).forEach((f, fi) => parseCode(f.code).forEach((it, bi) => { if (it.blk) out.push({ key: fi + ':' + bi, file: f.name, ...it.blk }); }));
  return out;
}
/* Cada "Siguiente línea" revela una línea con su explicación; las llaves de cierre ("}") se muestran junto con la anterior */
function gruposDeLineas(lines) {
  const g = [];
  lines.filter(l => l.t.trim()).forEach(l => {
    if (/^[}\]);,]+$/.test(l.t.trim()) && g.length) g[g.length - 1].push(l); else g.push([l]);
  });
  return g;
}
/* En la guía la explicación va en su propia línea, justo arriba del código y con su misma sangría (cabe en columnas angostas) */
function comentarioArriba(t, expl, co, cc) {
  return expl ? t.match(/^\s*/)[0] + co + expl + cc + '\n' + t : t;
}
function guiaHtml(ex) {
  if (!EJ.guiaAbierta) return `<div class="row"><button class="btn" data-act="guiaAbrir">No sé por dónde empezar: guíame paso a paso</button></div>`;
  const bl = bloquesDe(ex), G = EJ.guia;
  const metodo = `<details class="small"><summary><b>Paso 0 · Antes de escribir código</b> (sirve para cualquier ejercicio)</summary>
   <ol class="clean">
    <li><b>Lee el enunciado buscando 3 cosas:</b> qué recibe el programa (argumentos, mensajes, lecturas), qué debe producir (respuestas, salida, archivo) y qué reglas lo conectan.</li>
    <li><b>Si hay un protocolo, haz una tabla</b> en tu hoja: mensaje que llega → qué respondes. Casi todo el código sale de esa tabla.</li>
    <li><b>Mira los TODO como piezas sueltas.</b> No intentes resolver todo a la vez: cada TODO tiene una sola responsabilidad (abajo están en orden).</li>
    <li><b>Escribe primero en español</b>, como comentarios: "recibir", "si es X, responder Y". Recién después tradúcelo a C, línea por línea.</li>
    <li><b>Reconoce el patrón:</b> casi todo es una variación de servidor TCP (socket → bind → listen → accept → fork), cliente TCP (socket → connect → send/recv), pipe + fork, o las reglas de Lamport. Mira "Patrones que usa" y abre su esqueleto: tu código parte de ahí. Si un concepto no te suena, revísalo en "Conceptos que usa este ejercicio".</li>
   </ol></details>`;
  return `<section class="card stack guia" style="gap:10px"><div class="row spread"><h3 style="margin:0">Guía paso a paso</h3><button class="btn sm" data-act="guiaCerrar">Ocultar guía</button></div>
  <p class="small muted" style="margin:0">Ve TODO por TODO. Primero responde la pregunta en tu cabeza o en la hoja; abre los pasos solo si sigues en blanco, y las líneas de código como último recurso (cada línea revelada resta un poco de XP).</p>
  ${metodo}
  ${bl.map((b, i) => {
    const st = G[b.key] || { pasos: false, lineas: 0 }, grupos = gruposDeLineas(b.lines), total = grupos.length;
    const [co, cc] = CMT[langOf(ex)] || ['// ', ''];
    const visibles = grupos.slice(0, st.lineas).flat();
    return `<div class="gpaso glos"><div class="gp-h"><span class="gp-n">${i + 1}</span><div><b>TODO ${esc(b.label)}</b>${bl.some(x => x.file !== b.file) ? ` <span class="muted small">· ${esc(b.file)}</span>` : ''}<div class="small">${esc(b.desc)}</div></div></div>
     ${b.pregunta ? `<div class="gp-q"><span class="eyebrow">Pregúntate</span><div>${esc(b.pregunta)}</div></div>` : ''}
     ${st.pasos ? `<div class="gp-s"><span class="eyebrow">Pasos</span><ol class="clean">${b.pasos.map(p => `<li>${esc(p)}</li>`).join('')}</ol></div>` : ''}
     ${visibles.length ? `<pre class="code gp-code">${highlight(visibles.map(l => comentarioArriba(l.t.replace(/^ {4}/, ''), l.expl, co, cc)).join('\n'), langOf(ex))}</pre>` : ''}
     <div class="row">${!st.pasos && b.pasos.length ? `<button class="btn sm" data-act="guiaPasos" data-k="${b.key}">Ver los pasos</button>` : ''}
     ${st.lineas < total ? `<button class="btn sm" data-act="guiaLinea" data-k="${b.key}">${st.lineas ? 'Siguiente línea' : 'Mostrar la primera línea de código'} (${st.lineas}/${total})</button>` : `<span class="small muted">Bloque completo. Ahora escríbelo tú sin mirar.</span>`}</div></div>`;
  }).join('')}</section>`;
}
function penalizacionGuia() {
  const G = EJ.guia || {}; let p = 0;
  Object.entries(G).forEach(([k, v]) => { if (v.pasos) p += .5; p += (v.lineas || 0) * .25; });
  return p;
}
Object.assign(ACT, {
  glos(el) { abrirPop(el.dataset.id, el); },
  glosClose() { cerrarPop(); },
  guiaAbrir() { EJ.guiaAbierta = true; EJ.verConceptos = true; render(); },
  guiaCerrar() { EJ.guiaAbierta = false; render(); },
  guiaPasos(el) { const k = el.dataset.k; EJ.guia[k] = Object.assign({ pasos: false, lineas: 0 }, EJ.guia[k], { pasos: true }); render(); },
  guiaLinea(el) { const k = el.dataset.k; const s = Object.assign({ pasos: false, lineas: 0 }, EJ.guia[k]); s.lineas++; EJ.guia[k] = s; render(); }
});
