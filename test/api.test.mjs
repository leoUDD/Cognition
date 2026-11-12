/* Prueba /api/progress contra un Upstash REST simulado */
import http from 'node:http';
const store = {};
const fake = http.createServer((req, res) => { let b = ''; req.on('data', c => b += c); req.on('end', () => {
  if (req.headers.authorization !== 'Bearer tok') { res.writeHead(401); return res.end('{}'); }
  const [cmd, key, val] = JSON.parse(b); let result = null;
  if (cmd === 'GET') result = store[key] ?? null; if (cmd === 'SET') { store[key] = val; result = 'OK'; }
  res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ result })); }); });
await new Promise(r => fake.listen(18080, r));
const mkRes = () => { const r = { code: 0, body: null, headers: {} }; r.status = c => (r.code = c, r); r.json = j => (r.body = j, r); r.setHeader = (k, v) => r.headers[k] = v; return r; };
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } };
/* sin variables -> 503 */
let h = (await import('../api/progress.js?a')).default;
let r = mkRes(); await h({ method: 'GET', query: { code: 'abcd-efgh-jkmn' } }, r); ok(r.code === 503, '503 sin config');
process.env.KV_REST_API_URL = 'http://127.0.0.1:18080'; process.env.KV_REST_API_TOKEN = 'tok';
h = (await import('../api/progress.js?b')).default;
r = mkRes(); await h({ method: 'GET', query: { code: 'x' } }, r); ok(r.code === 400, 'codigo invalido');
r = mkRes(); await h({ method: 'GET', query: { code: 'abcd-efgh-jkmn' } }, r); ok(r.code === 200 && r.body.data === null, 'vacío');
r = mkRes(); await h({ method: 'PUT', query: { code: 'abcd-efgh-jkmn' }, body: { xp: 42, updatedAt: 1 } }, r); ok(r.code === 200, 'put');
r = mkRes(); await h({ method: 'GET', query: { code: 'ABCD-efgh-jkmn' } }, r); ok(r.body.data && r.body.data.xp === 42, 'get tras put (case-insensitive)');
r = mkRes(); await h({ method: 'PUT', query: { code: 'abcd-efgh-jkmn' }, body: '{"xp":7}' }, r); ok(r.code === 200, 'body string');
r = mkRes(); await h({ method: 'PUT', query: { code: 'abcd-efgh-jkmn' }, body: [1] }, r); ok(r.code === 400, 'array rechazado');
r = mkRes(); await h({ method: 'PUT', query: { code: 'abcd-efgh-jkmn' }, body: { big: 'x'.repeat(950000) } }, r); ok(r.code === 413, 'demasiado grande (> 900 KB)');
r = mkRes(); await h({ method: 'PUT', query: { code: 'abcd-efgh-jkmn' }, body: { updatedAt: 1, big: 'x'.repeat(400000) } }, r); ok(r.code !== 413, 'el progreso con código guardado (400 KB) cabe');
r = mkRes(); await h({ method: 'DELETE', query: { code: 'abcd-efgh-jkmn' } }, r); ok(r.code === 405, '405');
process.env.KV_REST_API_TOKEN = 'mal'; h = (await import('../api/progress.js?c')).default;
r = mkRes(); await h({ method: 'GET', query: { code: 'abcd-efgh-jkmn' } }, r); ok(r.code === 500, 'error de redis -> 500');
console.log(fails ? fails + ' fallos' : 'API OK'); fake.close();
