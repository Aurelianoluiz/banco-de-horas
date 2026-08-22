import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { createApplication } from './api/application.js';

const port = Number(process.env.PORT || 3000);
const root = resolve(process.cwd());
const MAX_BODY_BYTES = 1024 * 1024;
const LOGIN_WINDOW_MS = 60_000;
const LOGIN_LIMIT = 10;
const loginBuckets = new Map();
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon'
};
const securityHeaders = {
  'x-content-type-options': 'nosniff', 'x-frame-options': 'DENY',
  'referrer-policy': 'strict-origin-when-cross-origin', 'permissions-policy': 'camera=(), microphone=(), geolocation=()'
};
const clientAddress = (req) => String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
const rateLimitKey = (ip, email) => `${ip}|${String(email || '').trim().toLowerCase()}`;
const checkLoginRateLimit = (ip, email) => {
  const now = Date.now(); const key = rateLimitKey(ip, email); const current = loginBuckets.get(key);
  if (!current || now - current.startedAt >= LOGIN_WINDOW_MS) { loginBuckets.set(key, { startedAt: now, count: 1 }); return true; }
  if (current.count >= LOGIN_LIMIT) return false;
  current.count += 1; return true;
};
const cleanupLoginBuckets = () => { const cutoff = Date.now() - LOGIN_WINDOW_MS; for (const [key, item] of loginBuckets) if (item.startedAt < cutoff) loginBuckets.delete(key); };
const staticFile = async (pathname) => {
  const decoded = decodeURIComponent(pathname === '/' ? '/app-shell.html' : pathname);
  const candidate = resolve(join(root, decoded));
  if (candidate !== root && !candidate.startsWith(`${root}/`) && !candidate.startsWith(`${root}\\`)) return null;
  try {
    const body = await readFile(candidate); const type = MIME[extname(candidate).toLowerCase()] || 'application/octet-stream';
    if (type.startsWith('text/html')) {
      const pageName = decoded.toLowerCase();
      const bootstrap = '<link rel="manifest" href="/manifest.webmanifest"><meta name="theme-color" content="#2563eb"><link rel="stylesheet" href="/web/responsive.css">' +
        (pageName !== '/login.html' ? '<link rel="stylesheet" href="/web/minimal-sidebar.css"><link rel="stylesheet" href="/web/minimal-theme.css"><script src="/web/minimal-sidebar.js" defer></script>' : '') +
        '<script type="module" src="/web/auth-guard.js"></script><script type="module" src="/web/pwa.js"></script>';
      const indexCompat = pageName === '/index.html' ? '<script src="/web/index-compat.js"></script>' : '';
      return { body: Buffer.from(body.toString('utf8').replace(/<\\/head>/i, `${bootstrap}${indexCompat}</head>`)), type };
    }
    return { body, type };
  } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
};
const { api, pool } = createApplication();
const readBody = async (req) => {
  const declared = Number(req.headers['content-length'] || 0); if (declared > MAX_BODY_BYTES) throw Object.assign(new Error('Payload muito grande'), { statusCode: 413 });
  const chunks = []; let size = 0;
  for await (const chunk of req) { size += chunk.length; if (size > MAX_BODY_BYTES) throw Object.assign(new Error('Payload muito grande'), { statusCode: 413 }); chunks.push(chunk); }
  return Buffer.concat(chunks).toString('utf8');
};
const server = createServer(async (req, res) => {
  const startedAt = process.hrtime.bigint();
  const send = (status, headers, body) => {
    const elapsedMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    res.writeHead(status, { ...securityHeaders, ...headers, 'x-response-time-ms': elapsedMs.toFixed(2), 'server-timing': `app;dur=${elapsedMs.toFixed(2)}` });
    res.end(body);
  };
  try {
    const pathname = new URL(req.url || '/', 'http://localhost').pathname;
    if (pathname === '/health') {
      try {
        await pool.query('SELECT 1');
        send(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }, JSON.stringify({ status: 'ok', database: 'ok' }));
      } catch (error) {
        console.error('health database check failed', error);
        send(503, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }, JSON.stringify({ status: 'degraded', database: 'down' }));
      }
      return;
    }
    if (pathname.startsWith('/api/')) {
      const raw = await readBody(req); let body = {};
      if (raw) { try { body = JSON.parse(raw); } catch { send(400, { 'content-type': 'application/json; charset=utf-8' }, JSON.stringify({ error: 'JSON inválido' })); return; } }
      if (req.method === 'POST' && pathname === '/api/login') {
        const ip = clientAddress(req); if (!checkLoginRateLimit(ip, body.email)) { send(429, { 'content-type': 'application/json; charset=utf-8' }, JSON.stringify({ error: 'Muitas tentativas. Tente novamente mais tarde.' })); return; }
      }
      const auth = String(req.headers.authorization || ''); const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
      const result = await api({ method: req.method, url: req.url, body, token }); send(result.status || 200, result.headers || {}, result.body); return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') { send(405, { allow: 'GET, HEAD' }, ''); return; }
    const asset = await staticFile(pathname);
    if (!asset) { send(404, { 'content-type': 'text/plain; charset=utf-8' }, 'Not found'); return; }
    send(200, { 'content-type': asset.type, 'cache-control': asset.type.startsWith('text/html') ? 'no-store' : 'public, max-age=3600' }, asset.body);
  } catch (error) {
    console.error(error);
    send(error.statusCode || 500, { 'content-type': 'application/json; charset=utf-8' }, JSON.stringify({ error: error.message || 'Erro interno' }));
  } finally {
    if (loginBuckets.size > 1000) cleanupLoginBuckets();
  }
});
server.listen(port, '0.0.0.0', () => console.log(`Banco de Horas ouvindo em http://127.0.0.1:${port}/`));
