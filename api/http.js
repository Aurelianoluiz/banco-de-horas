const json = (data, status = 200) => ({ status, headers: { 'content-type': 'application/json; charset=utf-8' }, body: JSON.stringify(data) });
const binary = (data, contentType, status = 200, filename = null) => ({ status, headers: { 'content-type': contentType, ...(filename ? { 'content-disposition': `attachment; filename="${filename.replace(/"/g, '')}"` } : {}) }, body: Buffer.isBuffer(data) ? data : Buffer.from(data) });
const route = (method, pattern, handler, auth = null) => ({ method, pattern, handler, auth });
const crudRoutes = (base, service, module) => [
  route('GET', new RegExp(`^/api/${base}$`), async ({ url }) => json(await service.listar(Object.fromEntries(url.searchParams))), [module, 'read']),
  route('GET', new RegExp(`^/api/${base}/([^/]+)$`), async ({ params }) => { const item = await service.obter(params[1]); return item ? json(item) : json({ error: 'Registro não encontrado' }, 404); }, [module, 'read']),
  route('POST', new RegExp(`^/api/${base}$`), async ({ body, identity }) => json(await service.criar(body, identity?.sub), 201), [module, 'create']),
  route('PATCH', new RegExp(`^/api/${base}/([^/]+)$`), async ({ params, body }) => { const item = await service.atualizar(params[1], body); return item ? json(item) : json({ error: 'Registro não encontrado' }, 404); }, [module, 'update']),
  route('DELETE', new RegExp(`^/api/${base}/([^/]+)$`), async ({ params, identity }) => (await service.excluir(params[1], identity?.sub)) ? json({ ok: true }) : json({ error: 'Registro não encontrado' }, 404), [module, 'delete'])
];

export const createApi = ({ colaboradores, apontamentos, bancoHoras, fechamentos, ferias, folgas, feriados, relatorios, exportacao, exportacaoPdf, auditoria, configuracoes, atestados, ajustes, auth }) => {
  const routes = [
    route('POST', /^\/api\/login$/, async ({ body }) => { const result = await auth.login(body); return result ? json(result) : json({ error: 'Credenciais inválidas' }, 401); }),
    ...crudRoutes('colaboradores', colaboradores, 'colaboradores'),
    ...crudRoutes('apontamentos', apontamentos, 'apontamentos'),
    ...crudRoutes('ferias', ferias, 'ferias'),
    ...crudRoutes('folgas', folgas, 'folgas'),
    ...crudRoutes('feriados', feriados, 'feriados'),
    ...crudRoutes('atestados', atestados, 'atestados'),
    route('GET', /^\/api\/ajustes$/, async ({ url }) => json(await ajustes.listar(Object.fromEntries(url.searchParams))), ['ajustes', 'read']),
    route('GET', /^\/api\/ajustes\/([^/]+)$/, async ({ params }) => { const item = await ajustes.obter(params[1]); return item ? json(item) : json({ error: 'Registro não encontrado' }, 404); }, ['ajustes', 'read']),
    route('POST', /^\/api\/ajustes$/, async ({ body, identity }) => json(await ajustes.criar(body, identity.sub), 201), ['ajustes', 'create']),
    route('DELETE', /^\/api\/ajustes\/([^/]+)$/, async ({ params, identity }) => (await ajustes.excluir(params[1], identity.sub)) ? json({ ok: true }) : json({ error: 'Registro não encontrado' }, 404), ['ajustes', 'delete']),
    route('GET', /^\/api\/configuracoes$/, async () => json(await configuracoes.listar()), ['configuracoes', 'read']),
    route('GET', /^\/api\/configuracoes\/([^/]+)$/, async ({ params }) => { const item = await configuracoes.obter(params[1]); return item ? json(item) : json({ error: 'Configuração não encontrada' }, 404); }, ['configuracoes', 'read']),
    route('PUT', /^\/api\/configuracoes\/([^/]+)$/, async ({ params, body, identity }) => json(await configuracoes.salvar(params[1], body.valor, identity.sub)), ['configuracoes', 'update']),
    route('GET', /^\/api\/banco-horas\/([^/]+)\/([^/]+)$/, async ({ params }) => json(await bancoHoras.resumo(params[1], params[2], 0)), ['bancoHoras', 'read']),
    route('POST', /^\/api\/fechamentos$/, async ({ body, identity }) => json(await fechamentos.fechar({ ...body, usuarioId: identity.sub }), 201), ['fechamentos', 'approve']),
    route('GET', /^\/api\/auditoria$/, async ({ url }) => json(await auditoria.listar(Object.fromEntries(url.searchParams))), ['auditoria', 'read']),
    route('GET', /^\/api\/relatorios\/espelho-ponto$/, async ({ url }) => json(await relatorios.espelhoPonto({ colaboradorId: url.searchParams.get('colaboradorId') || undefined, competencia: url.searchParams.get('competencia') })), ['relatorios', 'read']),
    route('GET', /^\/api\/relatorios\/banco-horas$/, async ({ url }) => json(await relatorios.bancoHoras({ colaboradorId: url.searchParams.get('colaboradorId') || undefined, competencia: url.searchParams.get('competencia') })), ['relatorios', 'read']),
    route('GET', /^\/api\/relatorios\/ferias$/, async ({ url }) => json(await relatorios.ferias({ colaboradorId: url.searchParams.get('colaboradorId') || undefined })), ['relatorios', 'read']),
    route('GET', /^\/api\/relatorios\/folgas$/, async ({ url }) => json(await relatorios.folgas({ colaboradorId: url.searchParams.get('colaboradorId') || undefined })), ['relatorios', 'read']),
    route('GET', /^\/api\/relatorios\/fechamento$/, async ({ url }) => json(await relatorios.fechamento({ colaboradorId: url.searchParams.get('colaboradorId') || undefined, competencia: url.searchParams.get('competencia') })), ['relatorios', 'read']),
    route('GET', /^\/api\/relatorios\/atrasos$/, async ({ url }) => json(await relatorios.atrasos({ colaboradorId: url.searchParams.get('colaboradorId') || undefined, competencia: url.searchParams.get('competencia') })), ['relatorios', 'read']),
    route('GET', /^\/api\/relatorios\/export\/([a-z-]+)$/, async ({ params, url }) => { const tipo = params[1]; const allowed = new Set(['espelho-ponto','banco-horas','ferias','folgas','fechamento','atrasos']); if (!allowed.has(tipo)) return json({ error:'Relatório não suportado para exportação' },400); const p=Object.fromEntries(url.searchParams); const m=tipo==='espelho-ponto'?'espelhoPonto':tipo.replace(/-([a-z])/g,(_,l)=>l.toUpperCase()); const buffer=await exportacao.xlsx(m,p); return binary(buffer,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',200,`relatorio-${tipo}.xlsx`); }, ['relatorios','read']),
    route('GET', /^\/api\/relatorios\/pdf\/([a-z-]+)$/, async ({ params, url }) => { const tipo=params[1]; const allowed=new Set(['espelho-ponto','banco-horas','ferias','folgas','fechamento','atrasos']); if(!allowed.has(tipo)) return json({error:'Relatório não suportado para PDF'},400); const p=Object.fromEntries(url.searchParams); const m=tipo==='espelho-ponto'?'espelhoPonto':tipo.replace(/-([a-z])/g,(_,l)=>l.toUpperCase()); const buffer=await exportacaoPdf.pdf(m,p); return binary(buffer,'application/pdf',200,`relatorio-${tipo}.pdf`); }, ['relatorios','read'])
  ];
  return async ({ method='GET', url:rawUrl='/', body={}, token=null }={}) => {
    const url=new URL(rawUrl,'http://localhost'); const match=routes.find(item=>item.method===method&&item.pattern.test(url.pathname)); if(!match) return json({error:'Rota não encontrada'},404); const params=match.pattern.exec(url.pathname);
    try { const identity=match.auth?await auth.authenticate(token):null; if(match.auth&&!identity) return json({error:'Não autenticado'},401); if(match.auth&&!(await auth.authorize(identity,match.auth[0],match.auth[1]))) return json({error:'Acesso negado'},403); return await match.handler({url,body,params,identity}); } catch(error){ return json({error:error.message},error instanceof TypeError?400:422); }
  };
};
