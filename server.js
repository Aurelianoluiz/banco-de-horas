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
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};
const staticFile = async (pathname) => {
  const decoded = decodeURIComponent(pathname === '/' ? '/index.html' : pathname);
  const candidate = resolve(join(root, decoded));
  if (candidate !== root && !candidate.startsWith(`${root}/`) && !candidate.startsWith(`${root}\\`)) return null;
  try {
    const body = await readFile(candidate);
    const type = MIME[extname(candidate).toLowerCase()] || 'application/octet-stream';
    if (type.startsWith('text/html')) {
      const guard = '<script type="module" src="/web/auth-guard.js"></script>';
      return { body: Buffer.from(body.toString('utf8').replace(/<\/body>/i, `${guard}</body>`)), type };
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
        catch { res.writeHead(400, { 'content-type': 'application/json; charset=utf-8' }); res.end(JSON.stringify({ error: 'JSON inválido' })); return; }
      }
      const auth = String(req.headers.authorization || '');
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
      const result = await api({ method: req.method, url: req.url, body, token });
      res.writeHead(result.status || 200, result.headers || {});
      res.end(result.body);
      return;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { allow: 'GET, HEAD' }); res.end(); return;
    }
    const asset = await staticFile(new URL(req.url || '/', 'http://localhost').pathname);
    if (!asset) { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); res.end('Not Found'); return; }
    res.writeHead(200, { 'content-type': asset.type, 'cache-control': 'no-cache' });
    if (req.method === 'HEAD') { res.end(); return; }
    res.end(asset.body);
  } catch (error) {
    console.error(error);
    res.writeHead(500, { 'content-type': 'application/json; charset=utf-8' });
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
