(() => {
  const isLocalRuntime = () => location.port === '3000' && /^127\.0\.0\.1$|^localhost$/i.test(location.hostname);
  if (!isLocalRuntime()) return;

  const originalFetch = window.fetch.bind(window);
  const STORE = 'bh.local.runtime.data';
  const TOKEN = 'bh.auth.token';
  const USER = 'bh.auth.user';

  const users = {
    'admin.homologacao@bancodehoras.local': { id: 'local-admin', role: 'admin', nome: 'Administrador Local', senha: 'AdminLocal_2026!' },
    'gestor.homologacao@bancodehoras.local': { id: 'local-gestor', role: 'gestor', nome: 'Gestor Local', senha: 'GestorLocal_2026!' },
    'colaborador.homologacao@bancodehoras.local': { id: 'local-colaborador', role: 'colaborador', nome: 'Colaborador Local', senha: 'ColaboradorLocal_2026!' }
  };

  const load = () => { try { return JSON.parse(localStorage.getItem(STORE) || '{}'); } catch { return {}; } };
  const save = (data) => localStorage.setItem(STORE, JSON.stringify(data));
  const response = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', ...headers } });

  async function localApi(path, options = {}) {
    const method = String(options.method || 'GET').toUpperCase();
    let body = {};
    if (options.body) { try { body = JSON.parse(options.body); } catch {} }

    if (path === '/api/login' && method === 'POST') {
      const email = String(body.email || '').trim().toLowerCase();
      const account = users[email];
      if (!account || account.senha !== String(body.senha || '')) return response({ error: 'Credenciais inválidas' }, 401);
      const token = `local-${account.id}-${Date.now()}`;
      const user = { id: account.id, role: account.role, nome: account.nome, email };
      sessionStorage.setItem(TOKEN, token);
      sessionStorage.setItem(USER, JSON.stringify(user));
      return response({ token, user });
    }

    if (path === '/health' && method === 'GET') return response({ status: 'ok', database: 'local' });

    const token = sessionStorage.getItem(TOKEN);
    if (!token) return response({ error: 'Não autenticado' }, 401);

    if (path === '/api/logout' && method === 'POST') {
      sessionStorage.removeItem(TOKEN); sessionStorage.removeItem(USER);
      return response({ ok: true });
    }

    const data = load();
    if (path === '/api/colaboradores' && method === 'GET') {
      return response(data.colaboradores || [{ id: 'local-colaborador', nome: 'Colaborador Local', ativo: true, usuarioId: 'local-colaborador' }]);
    }
    if (path === '/api/apontamentos' && method === 'GET') return response(data.apontamentos || []);
    if (path === '/api/ferias' && method === 'GET') return response(data.ferias || []);
    if (path === '/api/folgas' && method === 'GET') return response(data.folgas || []);
    if (path === '/api/feriados' && method === 'GET') return response(data.feriados || []);
    if (path === '/api/atestados' && method === 'GET') return response(data.atestados || []);
    if (path === '/api/ajustes' && method === 'GET') return response(data.ajustes || []);
    if (path === '/api/configuracoes' && method === 'GET') return response(data.configuracoes || []);
    if (path.startsWith('/api/relatorios/') && method === 'GET') return response({ linhas: [], total: 0, creditos: 0, debitos: 0, saldo: 0 });
    if (path.startsWith('/api/banco-horas/') && method === 'GET') return response({ colaboradorId: path.split('/')[3], competencia: path.split('/')[4], creditos: 0, debitos: 0, saldo: 0 });

    if (method === 'POST' || method === 'PATCH' || method === 'PUT') return response({ ...body, id: body.id || `local-${Date.now()}` }, 200);
    if (method === 'DELETE') return response({ ok: true });
    return response({ error: 'Rota LOCAL não suportada' }, 404);
  }

  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input?.url || '';
    if (url.startsWith('/api/') || url === '/health') return localApi(url, init);
    return originalFetch(input, init);
  };
})();
