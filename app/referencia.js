/* ===== Referencia del lenguaje (pestaña + panel lateral dentro de los ejercicios) ===== */
const RF = { q: '', panelQ: '' };
function refFiltrar(q) {
  q = normTxt(q).trim();
  return (CUR.referencia || []).filter(r => !q || normTxt([r.titulo, r.cuando, r.texto, r.codigo].join(' ')).includes(q));
}
function refEntrada(r, compacta) {
  return `<article class="ref ${compacta ? 'compacta' : ''}" id="ref-${r.id}"><h3>${esc(r.titulo)}</h3>
  ${r.cuando ? `<div class="ref-cuando"><span class="eyebrow">Cuándo usarlo</span> ${esc(r.cuando)}</div>` : ''}
  ${r.texto ? `<p class="glos">${r.texto}</p>` : ''}
  ${r.codigo ? `<pre class="code">${highlight(r.codigo, CUR.lenguaje)}</pre>` : ''}</article>`;
}
function refListado(q, compacta) {
  const lista = refFiltrar(q);
  if (!lista.length) return '<p class="muted">Sin resultados.</p>';
  const grupos = [...new Set(lista.map(r => r.grupo || 'General'))];
  return grupos.map(g => `<section class="stack" style="gap:12px"><h2 class="ref-g">${esc(g)}</h2>${lista.filter(r => (r.grupo || 'General') === g).map(r => refEntrada(r, compacta)).join('')}</section>`).join('');
}
VIEWS.referencia = () => {
  const todos = CUR.referencia || [];
  return `<div class="stack"><div><h1>${esc(CUR.referenciaNombre || 'Referencia')}</h1>
  <p class="muted" style="max-width:62ch">Lo que necesitas recordar para escribir los ejercicios: la sintaxis básica y los <b>patrones</b> que se repiten en el curso. Para empezar un ejercicio, identifica qué patrón usa y parte desde su esqueleto. Dentro de cada ejercicio también puedes abrir esto con el botón <b>${esc(CUR.referenciaNombre || 'Referencia')}</b>.</p></div>
  <div class="chips">${todos.map(r => `<a class="chipbtn" href="#ref-${r.id}" data-act="refIr" data-id="${r.id}">${esc(r.titulo)}</a>`).join('')}</div>
  <input type="text" id="refq" placeholder="Buscar: printf, struct, socket, strcmp…" value="${esc(RF.q)}" autocomplete="off" aria-label="Buscar en la referencia" style="max-width:420px">
  ${refListado(RF.q, false)}</div>`;
};
/* Panel lateral: vive fuera de #view para no perder lo que escribes en el editor */
function refPanel(abrir) {
  let p = $('#refpanel');
  if (!p) {
    p = document.createElement('aside'); p.id = 'refpanel'; p.setAttribute('aria-label', 'Referencia');
    document.body.appendChild(p);
  }
  if (abrir === false) { p.classList.remove('on'); return; }
  p.innerHTML = `<div class="rp-h"><b>${esc(CUR.referenciaNombre || 'Referencia')}</b><button class="btn sm" data-act="refCerrar" aria-label="Cerrar">Cerrar ✕</button></div>
   <input type="text" id="refpq" placeholder="Buscar: for, punteros, servidor…" value="${esc(RF.panelQ)}" autocomplete="off" aria-label="Buscar">
   <div class="rp-body" id="rpbody">${refListado(RF.panelQ, true)}</div>`;
  p.classList.add('on');
  if (typeof enlazarGlosario === 'function') enlazarGlosario(p);
}
Object.assign(ACT, {
  refAbrir(el) {
    const id = el && el.dataset && el.dataset.id;
    if (id) RF.panelQ = '';
    refPanel(true);
    if (id) { const t = document.querySelector('#refpanel #ref-' + id); if (t) { t.classList.add('destacada'); if (t.scrollIntoView) t.scrollIntoView({ block: 'start' }); } }
    else { const i = $('#refpq'); if (i) i.focus(); }
  },
  refCerrar() { refPanel(false); },
  refIr(el, e) { if (e) e.preventDefault(); const t = document.getElementById('ref-' + el.dataset.id); if (t && t.scrollIntoView) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
});
document.addEventListener('input', e => {
  if (e.target.id === 'refq') { RF.q = e.target.value; const pos = e.target.selectionStart; render(); const i = $('#refq'); if (i) { i.focus(); i.setSelectionRange(pos, pos); } }
  if (e.target.id === 'refpq') { RF.panelQ = e.target.value; const b = $('#rpbody'); if (b) { b.innerHTML = refListado(RF.panelQ, true); enlazarGlosario(b.parentElement); } }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') refPanel(false); });
