import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

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
  const safePath = pathname === '/' ? '/index.html' : pathname;
  const decoded = decodeURIComponent(safePath);
  const candidate = resolve(join(root, decoded));
  if (candidate !== root && !candidate.startsWith(`${root}/`) && !candidate.startsWith(`${root}\\`)) return null;
  try {
    const body = await readFile(candidate);
    return { body, type: MIME[extname(candidate).toLowerCase()] || 'application/octet-stream' };
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
};

const server = createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url || '/', 'http://localhost').pathname;
    if (pathname === '/health') {
      res.writeHead(200, { ...securityHeaders, 'content-type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ status: 'ok', service: 'banco-de-horas-web' }));
      return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { ...securityHeaders, allow: 'GET, HEAD' });
      res.end();
      return;
    }
    const asset = await staticFile(pathname);
    if (!asset) {
      res.writeHead(404, { ...securityHeaders, 'content-type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { ...securityHeaders, 'content-type': asset.type, 'cache-control': asset.type.includes('javascript') || asset.type.includes('text/css') ? 'no-cache' : 'public, max-age=3600' });
    if (req.method === 'HEAD') { res.end(); return; }
    res.end(asset.body);
  } catch (error) {
    console.error(error);
    res.writeHead(500, { ...securityHeaders, 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'Erro interno do servidor' }));
  }
});

server.listen(port, '0.0.0.0', () => console.log(`Banco de Horas ouvindo na porta ${port}`));
