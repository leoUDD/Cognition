/* ===== Lógica pura (sin DOM) ===== */
const rnd = n => Math.floor(Math.random() * n);
const pick = a => a[rnd(a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---- Código con bloques //@TODO … //@END y líneas clave //§ ---- */
function parseCode(src) {
  const out = []; let blk = null;
  for (const raw of src.replace(/\r/g, '').split('\n')) {
    const m = raw.match(/^\s*(?:\/\/|#|--)@TODO\s+([^|]+?)\s*\|\s*(.*)$/);
    if (m) { blk = { label: m[1], desc: m[2], lines: [], pasos: [], pregunta: '' }; out.push({ blk }); continue; }
    if (/^\s*(?:\/\/|#|--)@END\s*$/.test(raw)) { blk = null; continue; }
    const g = blk && raw.match(/^\s*(?:\/\/|#|--)([?-])\s?(.*)$/);   /* guía: //? pregunta  //- paso */
    if (g) { if (g[1] === '?') blk.pregunta = g[2]; else blk.pasos.push(g[2]); continue; }
    const key = /(?:\/\/|#|--)§\s*$/.test(raw), t = raw.replace(/\s*(?:\/\/|#|--)§\s*$/, '');
    if (blk) blk.lines.push({ t, key }); else out.push({ t });
  }
  return out;
}
/* mode: 'sol' (completo), 'alto' (oculta líneas clave), 'medio' (oculta el bloque entero) */
const CMT = { python: ['# ', ''], sql: ['-- ', ''] };
function renderCode(src, mode, lang) {
  const [co, cc] = CMT[lang] || ['/* ', ' */'];
  const res = [];
  for (const it of parseCode(src)) {
    if (!it.blk) { res.push(it.t); continue; }
    const b = it.blk, first = b.lines.find(l => l.t.trim()) || { t: '' }, ind = first.t.match(/^\s*/)[0];
    res.push(ind + co + (mode === 'sol' ? '▼ TODO ' : 'TODO ') + b.label + ': ' + b.desc + cc);
    if (mode === 'sol') b.lines.forEach(l => res.push(l.t));
    else if (mode === 'alto') b.lines.forEach(l => res.push(l.key ? l.t.match(/^\s*/)[0] + co + '???' + cc : l.t));
    else res.push('');
  }
  return res.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd();
}
function countTodos(src) { return parseCode(src).filter(i => i.blk).length; }
function countKeys(src) { return parseCode(src).reduce((a, i) => a + (i.blk ? i.blk.lines.filter(l => l.key).length : 0), 0); }

/* ---- Diagrama fijo (ejercicios de la guía) ---- */
function staticDiagram(d) {
  const lane = 72, top = 34, r = 14, left = 50;
  const W = Math.max(...d.evs.map(e => e.x)) + 50, H = top + (d.procs.length - 1) * lane + 34;
  const pos = {}; d.evs.forEach(e => pos[e.k] = { x: e.x, y: top + e.p * lane });
  let s = `<svg class="diag" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Diagrama espacio-tiempo"><defs><marker id="arr2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="arrow-head"/></marker></defs>`;
  d.procs.forEach((p, i) => s += `<line class="lane" x1="${left - 6}" x2="${W - 6}" y1="${top + i * lane}" y2="${top + i * lane}"/><text class="lbl" x="8" y="${top + i * lane + 4}">${esc(p)}</text>`);
  (d.msgs || []).forEach(([a, b, l]) => {
    const A = pos[a], B = pos[b], dd = Math.hypot(B.x - A.x, B.y - A.y), ux = (B.x - A.x) / dd, uy = (B.y - A.y) / dd;
    s += `<line class="msg" x1="${A.x + ux * r}" y1="${A.y + uy * r}" x2="${B.x - ux * (r + 2)}" y2="${B.y - uy * (r + 2)}" marker-end="url(#arr2)"/>`;
    if (l) s += `<text class="mlbl" x="${(A.x + B.x) / 2 + 8}" y="${(A.y + B.y) / 2 - 4}">${esc(l)}</text>`;
  });
  d.evs.forEach(e => {
    const P = pos[e.k], cls = e.cls || (e.v === '?' ? 'ask' : 'given');
    s += `<g class="ev ${cls}" transform="translate(${P.x},${P.y})"><circle r="${r}"/><text>${esc(e.v)}</text><text class="evk" y="-21">${esc(e.k)}</text></g>`;
  });
  return s + '</svg>';
}
/* ---- Calificación de respuestas por ideas clave ---- */
/* Primero se quitan las etiquetas (<br> = espacio, <b>C</b>onsistency = Consistency) y DESPUÉS se decodifican &lt; &gt; */
const normTxt = s => String(s || '').replace(/<br\s*\/?>|<\/(p|li|div)>/gi, ' ').replace(/<[^>]+>/g, '')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
/* claves: [[etiqueta, "alt1|alt2 con varias palabras"], ...]. Devuelve [{label, ok}] */
function calificarRespuesta(texto, claves) {
  const t = ' ' + normTxt(texto).replace(/\s+/g, ' ') + ' ', tokens = t.split(/[^a-z0-9_]+/).filter(Boolean);
  const palabraOk = w => {
    w = normTxt(w);
    if (w.length <= 3 || /[^a-z0-9]/.test(w)) return t.includes(w);          /* corta o con símbolos: tal cual */
    const raiz = w.slice(0, Math.max(4, Math.ceil(w.length * 0.75)));        /* larga: por raíz */
    return tokens.some(k => k.startsWith(raiz));
  };
  return claves.map(([label, alts]) => ({ label, ok: alts.split('|').some(a => a.trim().split(/\s+/).filter(Boolean).every(palabraOk)) }));
}
/* Calificación sugerida a partir de la fracción de ideas cubiertas */
const notaDe = frac => frac >= 0.85 ? 'good' : frac >= 0.5 ? 'hard' : 'again';

/* ---- Resaltado de sintaxis (multi-lenguaje) ---- */
const LANGS = {
  c: { com: /\/\*[\s\S]*?\*\/|\/\/[^\n]*/, pre: /^[ \t]*#\w+/m, kw: 'int char void float double long short bool struct typedef enum const unsigned signed static extern return if else for while do switch case break default sizeof continue goto NULL' },
  cpp: { com: /\/\*[\s\S]*?\*\/|\/\/[^\n]*/, pre: /^[ \t]*#\w+/m, kw: 'int char void float double long bool auto class struct public private protected virtual template typename namespace using const static return if else for while do switch case break default new delete nullptr this true false' },
  java: { com: /\/\*[\s\S]*?\*\/|\/\/[^\n]*/, kw: 'int char void float double long boolean class interface extends implements public private protected static final new return if else for while do switch case break default this null true false import package try catch throw throws' },
  js: { com: /\/\*[\s\S]*?\*\/|\/\/[^\n]*/, kw: 'const let var function return if else for while do switch case break default new class extends this null undefined true false async await import export from of in typeof' },
  python: { com: /#[^\n]*/, kw: 'def return if elif else for while in not and or is None True False class import from as with try except finally raise lambda yield pass break continue global nonlocal print' },
  sql: { com: /--[^\n]*|\/\*[\s\S]*?\*\//, kw: 'select from where group by order having join left right inner outer on as insert into values update set delete create table primary key foreign references not null and or in is distinct count sum avg min max limit union' , ci: true }
};
function highlight(code, lang) {
  const L = LANGS[lang] || LANGS.c;
  const parts = [L.com.source, '"(?:\\\\.|[^"\\\\])*"|\'(?:\\\\.|[^\'\\\\])*\''];
  if (L.pre) parts.push(L.pre.source);
  parts.push('\\b(?:' + L.kw.split(' ').join('|') + ')\\b', '\\b\\d+(?:\\.\\d+)?\\b');
  const re = new RegExp(parts.map(p => '(' + p + ')').join('|'), 'g' + (L.ci ? 'i' : '') + (L.pre ? 'm' : ''));
  let out = '', last = 0, m;
  while ((m = re.exec(code))) {
    if (!m[0]) { re.lastIndex++; continue; }
    out += esc(code.slice(last, m.index));
    const i = m.slice(1).findIndex(x => x !== undefined);
    const cls = L.pre ? ['c', 's', 'p', 'k', 'n'][i] : ['c', 's', 'k', 'n'][i];
    out += `<span class="tk-${cls}">${esc(m[0])}</span>`;
    last = m.index + m[0].length;
  }
  return out + esc(code.slice(last));
}

if (typeof module !== 'undefined') module.exports = { parseCode, renderCode, countTodos, countKeys, staticDiagram, highlight, calificarRespuesta, notaDe };
