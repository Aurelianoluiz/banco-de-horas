const json = (data, status = 200) => ({ status, headers: { 'content-type': 'application/json; charset=utf-8' }, body: JSON.stringify(data) });

const route = (method, pattern, handler) => ({ method, pattern, handler });

export const createApi = ({ colaboradores, apontamentos, bancoHoras, fechamentos }) => {
  const routes = [
    route('GET', /^\/api\/colaboradores$/, async ({ url }) => json(colaboradores.listar(Object.fromEntries(url.searchParams)) )),
    route('GET', /^\/api\/colaboradores\/([^/]+)$/, async ({ params }) => {
      const item = colaboradores.obter(params[1]);
      return item ? json(item) : json({ error: 'Colaborador não encontrado' }, 404);
    }),
    route('POST', /^\/api\/colaboradores$/, async ({ body }) => json(colaboradores.criar(body), 201)),
    route('GET', /^\/api\/apontamentos$/, async ({ url }) => json(apontamentos.listar(Object.fromEntries(url.searchParams)))),
    route('POST', /^\/api\/apontamentos$/, async ({ body }) => json(apontamentos.criar(body), 201)),
    route('GET', /^\/api\/banco-horas\/([^/]+)\/([^/]+)$/, async ({ params }) => json(bancoHoras.resumo(params[1], params[2], 0))),
    route('POST', /^\/api\/fechamentos$/, async ({ body }) => json(fechamentos.fechar(body), 201))
  ];

  return async ({ method = 'GET', url: rawUrl = '/', body = {} } = {}) => {
    const url = new URL(rawUrl, 'http://localhost');
    const match = routes.find((item) => item.method === method && item.pattern.test(url.pathname));
    if (!match) return json({ error: 'Rota não encontrada' }, 404);
    const params = match.pattern.exec(url.pathname);
    try {
      return await match.handler({ url, body, params });
    } catch (error) {
      return json({ error: error.message }, error instanceof TypeError ? 400 : 422);
    }
  };
};
