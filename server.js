import { createServer } from 'node:http';
import { createApplication } from './api/application.js';

const port = Number(process.env.PORT || 3000);
const { api, pool } = createApplication();

const server = createServer(async (req, res) => {
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString('utf8');
    let body = {};
    if (raw) {
      try { body = JSON.parse(raw); }
      catch { res.writeHead(400, { 'content-type': 'application/json' }); res.end(JSON.stringify({ error: 'JSON inválido' })); return; }
    }
    const auth = String(req.headers.authorization || '');
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    const result = await api({ method: req.method, url: req.url, body, token });
    res.writeHead(result.status || 200, result.headers || {});
    res.end(result.body);
  } catch (error) {
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

server.listen(port, '0.0.0.0', () => console.log(`Banco de Horas API ouvindo na porta ${port}`));
