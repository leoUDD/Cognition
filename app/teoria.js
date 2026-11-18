/* ===== Teoría: temas → subtemas → explicación =====
   Contenido en cursos/<id>/teoria.js:
   teoria.push({ id, titulo, resumen, intro?, sub: [{ id, titulo, resumen, comparacion?, idea?, texto?, pasos?, tabla?, ejemplo?, codigo?, ojo?, recuerda?, ejercicios? }] }) */
const TE = { tema: null, sub: null };
const teTemas = () => CUR.teoria || [];
const teTema = id => teTemas().find(t => t.id === id);
function teLeidos(t) { const v = P.teoria || {}; return t.sub.filter(s => v[t.id + '/' + s.id]).length; }

function teTabla(tb) {
  return `<div class="te-tabla"><table class="t"><thead><tr>${tb.cols.map(c => `<th>${c}</th>`).join('')}</tr></thead>
  <tbody>${tb.filas.map(f => `<tr>${f.map((c, i) => i === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

function teInicio() {
  const temas = teTemas();
  return `<div class="stack"><div><h1>Teoría</h1>
  <p class="muted" style="max-width:62ch">Cada tema del ramo explicado por partes. Elige un tema, después un subtema, y lee la explicación: la idea en una frase, cómo funciona, un ejemplo y los errores típicos. Los subtemas marcados <span class="chip">Comparación</span> ponen lado a lado lo que se suele confundir.</p></div>
  <div class="grid g2 te-lista">${temas.map(t => {
    const n = teLeidos(t);
    return `<button class="card te-card" data-act="teTema" data-id="${t.id}">
      <span class="eyebrow">${esc(t.unidad || '')}</span>
      <h3>${esc(t.titulo)}</h3>
      <p class="muted small">${t.resumen}</p>
      <div class="row spread small"><span class="muted">${t.sub.length} subtemas</span>${n ? `<span class="chip ${n === t.sub.length ? 'good' : ''}">${n}/${t.sub.length} leídos</span>` : ''}</div>
      <div class="bar" aria-hidden="true"><i style="width:${Math.round(100 * n / t.sub.length)}%"></i></div></button>`;
  }).join('')}</div></div>`;
}

function teTemaVista(t) {
  const v = P.teoria || {};
  return `<div class="stack"><div class="row"><button class="btn sm" data-act="teVolver">← Teoría</button></div>
  <div><span class="eyebrow">${esc(t.unidad || '')}</span><h1>${esc(t.titulo)}</h1>${t.intro ? `<p class="glos" style="max-width:68ch">${t.intro}</p>` : ''}</div>
  <div class="grid g3 te-lista">${t.sub.map((s, i) => `<button class="card te-card te-sub ${s.comparacion ? 'te-comp' : ''}" data-act="teSub" data-id="${s.id}">
      <div class="row spread"><span class="eyebrow">${i + 1}</span>${s.comparacion ? '<span class="chip">Comparación</span>' : ''}${v[t.id + '/' + s.id] ? '<span class="chip good" title="Ya lo leíste">✓ leído</span>' : ''}</div>
      <h3>${esc(s.titulo)}</h3><p class="muted small">${s.resumen}</p></button>`).join('')}</div></div>`;
}

function teSubVista(t, s) {
  const i = t.sub.indexOf(s), ant = t.sub[i - 1], sig = t.sub[i + 1];
  const ejs = (s.ejercicios || []).map(id => EXERCISES.find(e => e.id === id)).filter(Boolean);
  return `<div class="stack te-art"><div class="row"><button class="btn sm" data-act="teVolver">← Teoría</button><button class="btn sm" data-act="teTema" data-id="${t.id}">← ${esc(t.titulo)}</button></div>
  <div><span class="eyebrow">${esc(t.titulo)} · ${i + 1} de ${t.sub.length}</span><h1>${esc(s.titulo)}</h1></div>
  ${s.idea ? `<div class="callout glos"><span class="eyebrow">La idea en una frase</span><div>${s.idea}</div></div>` : ''}
  ${s.texto ? `<div class="te-texto glos">${s.texto}</div>` : ''}
  ${s.pasos ? `<section><h2>Paso a paso</h2><ol class="te-pasos glos">${s.pasos.map(p => `<li>${p}</li>`).join('')}</ol></section>` : ''}
  ${s.tabla ? `<section class="glos te-tsec">${s.tabla.titulo ? `<h2>${s.tabla.titulo}</h2>` : ''}${teTabla(s.tabla)}</section>` : ''}
  ${s.ejemplo ? `<section class="card te-ej glos"><span class="eyebrow">Ejemplo</span><div>${s.ejemplo}</div></section>` : ''}
  ${s.codigo ? `<section><h2>En C</h2><pre class="code">${highlight(s.codigo, CUR.lenguaje)}</pre></section>` : ''}
  ${s.ojo ? `<section class="callout warn glos"><span class="eyebrow">Ojo: errores y confusiones típicas</span><ul>${s.ojo.map(o => `<li>${o}</li>`).join('')}</ul></section>` : ''}
  ${s.recuerda ? `<section class="callout glos"><span class="eyebrow">Para el certamen</span><div>${s.recuerda}</div></section>` : ''}
  ${ejs.length ? `<div><span class="eyebrow">Practícalo</span><div class="chips">${ejs.map(e => `<button class="chipbtn" data-act="openEx" data-id="${e.id}">${esc(e.n)} · ${esc(e.title)}</button>`).join('')}</div></div>` : ''}
  <div class="row spread te-nav">${ant ? `<button class="btn" data-act="teSub" data-id="${ant.id}">← ${esc(ant.titulo)}</button>` : '<span></span>'}
  ${sig ? `<button class="btn primary" data-act="teSub" data-id="${sig.id}">${esc(sig.titulo)} →</button>` : `<button class="btn" data-act="teTema" data-id="${t.id}">Volver a ${esc(t.titulo)}</button>`}</div></div>`;
}

VIEWS.teoria = () => {
  const t = TE.tema && teTema(TE.tema);
  if (!t) return teInicio();
  const s = TE.sub && t.sub.find(x => x.id === TE.sub);
  return s ? teSubVista(t, s) : teTemaVista(t);
};

Object.assign(ACT, {
  teVolver() { TE.tema = null; TE.sub = null; render(); window.scrollTo(0, 0); },
  teTema(el) { TE.tema = el.dataset.id; TE.sub = null; render(); window.scrollTo(0, 0); },
  teSub(el) {
    TE.sub = el.dataset.id;
    P.teoria = P.teoria || {}; const k = TE.tema + '/' + TE.sub;
    if (!P.teoria[k]) { P.teoria[k] = 1; save(); }
    render(); window.scrollTo(0, 0);
  }
});
