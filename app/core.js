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
    else if (mode === 'alto') {
      /* Si una línea clave abre un bloque ("if (...) {"), su "}" también se oculta: así no quedan llaves huérfanas */
      const abiertas = [];
      b.lines.forEach(l => {
        const sangria = l.t.match(/^\s*/)[0];
        if (l.key) {
          res.push(sangria + co + '???' + cc);
          if (/\{\s*$/.test(l.t.replace(/\/\*.*?\*\/\s*$|\/\/.*$/, ''))) abiertas.push(sangria);
        } else if (l.t.trim() === '}' && abiertas.length && abiertas[abiertas.length - 1] === sangria) {
          abiertas.pop();
        } else res.push(l.t);
      });
    }
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

/* ---- Resaltado de sintaxis (multi-lenguaje) ----
   Clases: c comentario · s string · e %d y \n dentro de strings · p preprocesador · k control · t tipo
           f función · m constante (MAYÚSCULAS) · n número · o operadores de punteros (-> & *) */
const LANGS = {
  c: { com: /\/\*[\s\S]*?\*\/|\/\/[^\n]*/, pre: true, heur: true, ptr: true,
       kw: 'return if else for while do switch case break default sizeof continue goto',
       ty: 'int char void float double long short bool struct typedef enum union const unsigned signed static extern volatile register size_t ssize_t pid_t time_t socklen_t fd_set FILE' },
  cpp: { com: /\/\*[\s\S]*?\*\/|\/\/[^\n]*/, pre: true, heur: true, ptr: true,
       kw: 'return if else for while do switch case break default new delete this true false nullptr public private protected virtual template typename namespace using',
       ty: 'int char void float double long bool auto class struct const static unsigned size_t string vector' },
  java: { com: /\/\*[\s\S]*?\*\/|\/\/[^\n]*/, heur: true,
       kw: 'new return if else for while do switch case break default this null true false import package try catch throw throws extends implements public private protected static final',
       ty: 'int char void float double long boolean class interface String' },
  js: { com: /\/\*[\s\S]*?\*\/|\/\/[^\n]*/, heur: true,
       kw: 'return if else for while do switch case break default new this null undefined true false async await import export from of in typeof',
       ty: 'const let var function class extends' },
  python: { com: /#[^\n]*/, heur: true,
       kw: 'def return if elif else for while in not and or is None True False class import from as with try except finally raise lambda yield pass break continue global nonlocal',
       ty: 'int float str bool list dict tuple set bytes' },
  sql: { com: /--[^\n]*|\/\*[\s\S]*?\*\//, ci: true,
       kw: 'select from where group by order having join left right inner outer on as insert into values update set delete create table primary key foreign references not null and or in is distinct limit union',
       ty: 'int integer varchar char text date timestamp boolean serial numeric' }
};
const HL_RE = {};
function hlRegex(lang) {
  if (HL_RE[lang]) return HL_RE[lang];
  const L = LANGS[lang] || LANGS.c, pal = w => '\\b(?:' + w.split(' ').join('|') + ')\\b', alt = [];
  alt.push(['c', L.com.source]);
  alt.push(['s', '"(?:\\\\.|[^"\\\\\\n])*"|\'(?:\\\\.|[^\'\\\\\\n])*\'']);
  if (L.pre) { alt.push(['p', '^[ \\t]*#\\s*\\w+']); alt.push(['s', '(?<=#\\s*include\\s*)<[^>\\n]+>']); }
  alt.push(['k', pal(L.kw)]);
  if (L.ty) alt.push(['t', pal(L.ty) + (L.heur ? '|\\b\\w+_t\\b' : '')]);
  alt.push(['f', '\\b[A-Za-z_]\\w*(?=\\s*\\()']);
  if (L.heur) { alt.push(['m', '\\b[A-Z][A-Z0-9_]+\\b']); alt.push(['t', '\\b[A-Z][a-z]\\w*\\b']); }
  alt.push(['n', '\\b(?:0x[0-9a-fA-F]+|\\d+(?:\\.\\d+)?[fFlLuU]?)\\b']);
  if (L.ptr) alt.push(['o', '->|(?<=^|[(),=\\s!])&(?=[\\w(])|\\*(?=[\\w()])']);  /* & y * pegados a un nombre: punteros */
  const re = new RegExp(alt.map(a => '(' + a[1] + ')').join('|'), 'g' + (L.ci ? 'i' : '') + 'm');
  return (HL_RE[lang] = { re, cls: alt.map(a => a[0]) });
}
/* Dentro de un string: resalta %d, %.2f, %15s… y \n, \0 */
function hlString(raw) {
  return raw.replace(/%%|%[-+ 0#]*\d*(?:\.\d+)?(?:hh|h|ll|l|z)?[diouxXfFeEgGcsp]|\\[nrt0\\'"]|([^%\\]+|[%\\])/g,
    (m, txt) => txt !== undefined ? esc(m) : `<span class="tk-e">${esc(m)}</span>`);
}
function highlight(code, lang) {
  const { re, cls } = hlRegex(lang);
  re.lastIndex = 0;
  let out = '', last = 0, m;
  while ((m = re.exec(code))) {
    if (!m[0]) { re.lastIndex++; continue; }
    out += esc(code.slice(last, m.index));
    const c = cls[m.slice(1).findIndex(x => x !== undefined)];
    out += `<span class="tk-${c}">${c === 's' && /^["']/.test(m[0]) ? hlString(m[0]) : esc(m[0])}</span>`;
    last = m.index + m[0].length;
  }
  return out + esc(code.slice(last));
}

if (typeof module !== 'undefined') module.exports = { parseCode, renderCode, countTodos, countKeys, staticDiagram, highlight, calificarRespuesta, notaDe };
