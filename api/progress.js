/* /api/progress — guarda y entrega el progreso de Cognition por "código de sincronización".
   Almacenamiento: Upstash Redis (integración de Vercel Marketplace). Sin dependencias:
   se usa la API REST de Upstash con fetch. Variables que inyecta Vercel al conectar la base:
   KV_REST_API_URL / KV_REST_API_TOKEN (o UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN). */
const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const CODE_RE = /^[a-z0-9-]{12,64}$/i;
const MAX_BYTES = 900 * 1024;   /* incluye el código que escribes en los ejercicios */
const TTL_SECONDS = 60 * 60 * 24 * 365;   // un año sin uso y se borra

async function redis(command) {
  const r = await fetch(REDIS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  });
  if (!r.ok) throw new Error(`Redis respondió ${r.status}`);
  const json = await r.json();
  if (json.error) throw new Error(json.error);
  return json.result;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!REDIS_URL || !REDIS_TOKEN) return res.status(503).json({ error: 'storage-not-configured' });

  const code = String((req.query && req.query.code) || '');
  if (!CODE_RE.test(code)) return res.status(400).json({ error: 'invalid-code' });
  const key = `cognition:${code.toLowerCase()}`;

  try {
    if (req.method === 'GET') {
      const raw = await redis(['GET', key]);
      return res.status(200).json({ data: raw ? JSON.parse(raw) : null });
    }
    if (req.method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!body || typeof body !== 'object' || Array.isArray(body)) return res.status(400).json({ error: 'invalid-body' });
      const raw = JSON.stringify(body);
      if (raw.length > MAX_BYTES) return res.status(413).json({ error: 'too-large' });
      await redis(['SET', key, raw, 'EX', TTL_SECONDS]);
      return res.status(200).json({ ok: true });
    }
    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'method-not-allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'storage-error' });
  }
}
