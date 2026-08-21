const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000';
const collaboratorId = process.env.HOMOLOG_COLLABORATOR_ID;
const password = process.env.SEED_ADMIN_PASSWORD;

if (!collaboratorId || !password) throw new Error('HOMOLOG_COLLABORATOR_ID e SEED_ADMIN_PASSWORD são obrigatórios');

const login = async () => {
  const response = await fetch(`${baseUrl}/api/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'admin.homologacao@bancodehoras.local', senha: password })
  });
  if (!response.ok) throw new Error(`Login de homologação falhou: ${response.status}`);
  const data = await response.json();
  if (!data.token || data.user?.role !== 'admin') throw new Error('Login não retornou ADMIN');
  return data.token;
};

const request = async (token, path, init = {}) => fetch(`${baseUrl}${path}`, {
  ...init,
  headers: { authorization: `Bearer ${token}`, ...(init.headers || {}) }
});

const jsonRequest = (token, path, method, body) => request(token, path, {
  method,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body)
});

const expect = async (response, status, label) => {
  if (response.status !== status) {
    const body = await response.text();
    throw new Error(`${label}: esperado ${status}, recebido ${response.status}: ${body}`);
  }
};

const main = async () => {
  const token = await login();

  const invalidVacation = await jsonRequest(token, '/api/ferias', 'POST', {
    colaboradorId: collaboratorId, inicio: '2026-09-10', fim: '2026-09-09', dias: 0, status: 'Programada'
  });
  await expect(invalidVacation, 400, 'férias com período inválido');

  const vacation = await jsonRequest(token, '/api/ferias', 'POST', {
    colaboradorId: collaboratorId, inicio: '2026-09-10', fim: '2026-09-12', dias: 3, status: 'Programada'
  });
  await expect(vacation, 201, 'criação de férias');
  const vacationBody = await vacation.json();
  if (!vacationBody.id) throw new Error('férias criada sem id');
  await expect(await jsonRequest(token, `/api/ferias/${vacationBody.id}`, 'PATCH', { fim: '2026-09-08' }), 400, 'update de férias com período inválido');
  await expect(await jsonRequest(token, `/api/ferias/${vacationBody.id}`, 'PATCH', { status: 'Aprovada' }), 200, 'update de férias');
  await expect(await request(token, `/api/ferias/${vacationBody.id}`, { method: 'DELETE' }), 200, 'exclusão de férias');

  const folga = await jsonRequest(token, '/api/folgas', 'POST', {
    colaboradorId: collaboratorId, data: '2026-09-15', motivo: 'Folga de homologação', origem: 'Banco de horas', status: 'Solicitada'
  });
  await expect(folga, 201, 'criação de folga');
  const folgaBody = await folga.json();
  await expect(await jsonRequest(token, `/api/folgas/${folgaBody.id}`, 'PATCH', { status: 'Aprovada' }), 200, 'update de folga');
  await expect(await request(token, `/api/folgas/${folgaBody.id}`, { method: 'DELETE' }), 200, 'exclusão de folga');

  const invalidAtestado = await jsonRequest(token, '/api/atestados', 'POST', {
    colaboradorId: collaboratorId, inicio: '2026-09-20', fim: '2026-09-19', status: 'Pendente'
  });
  await expect(invalidAtestado, 400, 'atestado com período inválido');

  const atestado = await jsonRequest(token, '/api/atestados', 'POST', {
    colaboradorId: collaboratorId, inicio: '2026-09-20', fim: '2026-09-21', motivo: 'Atestado de homologação', status: 'Pendente'
  });
  await expect(atestado, 201, 'criação de atestado');
  const atestadoBody = await atestado.json();
  await expect(await jsonRequest(token, `/api/atestados/${atestadoBody.id}`, 'PATCH', { status: 'Aprovado' }), 200, 'update de atestado');
  await expect(await request(token, `/api/atestados/${atestadoBody.id}`, { method: 'DELETE' }), 200, 'exclusão de atestado');

  const ajuste = await jsonRequest(token, '/api/ajustes', 'POST', {
    colaboradorId: collaboratorId, data: '2026-09-22', minutos: 15, motivo: 'Ajuste de homologação'
  });
  await expect(ajuste, 201, 'criação de ajuste');
  const ajusteBody = await ajuste.json();
  await expect(await request(token, `/api/ajustes/${ajusteBody.id}`, { method: 'DELETE' }), 200, 'exclusão de ajuste');

  const fechamentoPayload = { colaboradorId: collaboratorId, competencia: '2026-09', saldoAnterior: 0 };
  const fechamento = await jsonRequest(token, '/api/fechamentos', 'POST', fechamentoPayload);
  await expect(fechamento, 201, 'primeiro fechamento');
  const duplicate = await jsonRequest(token, '/api/fechamentos', 'POST', fechamentoPayload);
  await expect(duplicate, 409, 'fechamento duplicado');

  console.log(JSON.stringify({ ok: true, scenario: 'crud-and-duplicate-closing' }));
};

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
