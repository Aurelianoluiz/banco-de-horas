import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { createApplication } from './api/application.js';

const port = Number(process.env.PORT || 3000);
const root = resolve(process.cwd());
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};
const securityHeaders = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()'
};
const staticFile = async (pathname) => {
  const decoded = decodeURIComponent(pathname === '/' ? '/index.html' : pathname);
  const candidate = resolve(join(root, decoded));
  if (candidate !== root && !candidate.startsWith(`${root}/`) && !candidate.startsWith(`${root}\\`)) return null;
  try {
    const body = await readFile(candidate);
    const type = MIME[extname(candidate).toLowerCase()] || 'application/octet-stream';
    if (type.startsWith('text/html')) {
      const bootstrap = '<link rel="manifest" href="/manifest.webmanifest"><meta name="theme-color" content="#2563eb"><link rel="stylesheet" href="/web/responsive.css"><script type="module" src="/web/auth-guard.js"></script><script type="module" src="/web/pwa.js"></script>';
      return { body: Buffer.from(body.toString('utf8').replace(/<\/head>/i, `${bootstrap}</head>`)), type };
    }
    return { body, type };
  } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
};

const { api, pool } = createApplication();

const server = createServer(async (req, res) => {
  try {
    if (req.url?.startsWith('/api/')) {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const raw = Buffer.concat(chunks).toString('utf8');
      let body = {};
      if (raw) {
        try { body = JSON.parse(raw); }
        catch { res.writeHead(400, { ...securityHeaders, 'content-type': 'application/json; charset=utf-8' }); res.end(JSON.stringify({ error: 'JSON inválido' })); return; }
      }
      const auth = String(req.headers.authorization || '');
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
      const result = await api({ method: req.method, url: req.url, body, token });
      res.writeHead(result.status || 200, { ...securityHeaders, ...(result.headers || {}) });
      res.end(result.body);
      return;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { ...securityHeaders, allow: 'GET, HEAD' }); res.end(); return;
    }
    const asset = await staticFile(new URL(req.url || '/', 'http://localhost').pathname);
    if (!asset) { res.writeHead(404, { ...securityHeaders, 'content-type': 'text/plain; charset=utf-8' }); res.end('Not Found'); return; }
    res.writeHead(200, { ...securityHeaders, 'content-type': asset.type, 'cache-control': asset.type.includes('javascript') || asset.type.includes('text/css') ? 'no-cache' : 'public, max-age=3600' });
    if (req.method === 'HEAD') { res.end(); return; }
    res.end(asset.body);
  } catch (error) {
    console.error(error);
    res.writeHead(500, { ...securityHeaders, 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'Erro interno do servidor' }));
  }
});

const shutdown = async (signal) => {
  server.close(async () => {
    await pool.end();
    process.exit(signal === 'SIGINT' ? 130 : 143);
  });
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
server.listen(port, '0.0.0.0', () => console.log(`Banco de Horas ouvindo na porta ${port}`));
