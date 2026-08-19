const json = (data, status = 200) => ({ status, headers: { 'content-type': 'application/json; charset=utf-8' }, body: JSON.stringify(data) });
const route = (method, pattern, handler, auth = null) => ({ method, pattern, handler, auth });

export const createApi = ({ colaboradores, apontamentos, bancoHoras, fechamentos, auth }) => {
  const routes = [
    route('POST', /^\/api\/login$/, async ({ body }) => {
      const result = auth.login(body);
      return result ? json(result) : json({ error: 'Credenciais inválidas' }, 401);
    }),
    route('GET', /^\/api\/colaboradores$/, async ({ url }) => json(colaboradores.listar(Object.fromEntries(url.searchParams))), ['colaboradores', 'read']),
    route('GET', /^\/api\/colaboradores\/([^/]+)$/, async ({ params }) => {
      const item = colaboradores.obter(params[1]);
      return item ? json(item) : json({ error: 'Colaborador não encontrado' }, 404);
    }, ['colaboradores', 'read']),
    route('POST', /^\/api\/colaboradores$/, async ({ body }) => json(colaboradores.criar(body), 201), ['colaboradores', 'create']),
    route('GET', /^\/api\/apontamentos$/, async ({ url }) => json(apontamentos.listar(Object.fromEntries(url.searchParams))), ['apontamentos', 'read']),
    route('POST', /^\/api\/apontamentos$/, async ({ body }) => json(apontamentos.criar(body), 201), ['apontamentos', 'create']),
    route('GET', /^\/api\/banco-horas\/([^/]+)\/([^/]+)$/, async ({ params }) => json(bancoHoras.resumo(params[1], params[2], 0)), ['bancoHoras', 'read']),
    route('POST', /^\/api\/fechamentos$/, async ({ body }) => json(fechamentos.fechar(body), 201), ['fechamentos', 'approve'])
  ];

  return async ({ method = 'GET', url: rawUrl = '/', body = {}, token = null } = {}) => {
    const url = new URL(rawUrl, 'http://localhost');
    const match = routes.find((item) => item.method === method && item.pattern.test(url.pathname));
    if (!match) return json({ error: 'Rota não encontrada' }, 404);
    const params = match.pattern.exec(url.pathname);
    try {
      const identity = match.auth ? auth.authenticate(token) : null;
      if (match.auth && !identity) return json({ error: 'Não autenticado' }, 401);
      if (match.auth && !auth.authorize(identity, match.auth[0], match.auth[1])) return json({ error: 'Acesso negado' }, 403);
      return await match.handler({ url, body, params, identity });
    } catch (error) {
      return json({ error: error.message }, error instanceof TypeError ? 400 : 422);
    }
  };
};
