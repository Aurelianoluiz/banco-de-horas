const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000';
const users = {
  admin: ['admin.homologacao@bancodehoras.local', process.env.SEED_ADMIN_PASSWORD],
  gestor: ['gestor.homologacao@bancodehoras.local', process.env.SEED_GESTOR_PASSWORD],
  colaborador: ['colaborador.homologacao@bancodehoras.local', process.env.SEED_COLABORADOR_PASSWORD]
};

const login = async (email, senha) => {
  const response = await fetch(`${baseUrl}/api/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, senha }) });
  if (!response.ok) throw new Error(`Login falhou: ${email} (${response.status})`);
  return (await response.json()).token;
};
const request = async (token, path, init = {}) => fetch(`${baseUrl}${path}`, { ...init, headers: { authorization: `Bearer ${token}`, ...(init.headers || {}) } });
const expectStatus = async (response, expected, label) => {
  if (response.status !== expected) throw new Error(`${label}: esperado ${expected}, recebido ${response.status}`);
};

const main = async () => {
  const tokens = {};
  for (const [role, [email, senha]] of Object.entries(users)) tokens[role] = await login(email, senha);

  await expectStatus(await request(tokens.admin, '/api/configuracoes'), 200, 'admin configurações');
  await expectStatus(await request(tokens.admin, '/api/auditoria'), 200, 'admin auditoria');
  await expectStatus(await request(tokens.gestor, '/api/configuracoes'), 200, 'gestor leitura configurações');
  await expectStatus(await request(tokens.gestor, '/api/auditoria'), 403, 'gestor auditoria');
  await expectStatus(await request(tokens.gestor, '/api/fechamentos', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ colaboradorId: process.env.HOMOLOG_COLLABORATOR_ID, competencia: '2026-09', saldoAnterior: 0 }) }), 403, 'gestor fechamento');
  await expectStatus(await request(tokens.colaborador, '/api/auditoria'), 403, 'colaborador auditoria');
  await expectStatus(await request(tokens.colaborador, '/api/configuracoes'), 403, 'colaborador configurações');
  await expectStatus(await request(tokens.colaborador, '/api/colaboradores'), 403, 'colaborador colaboradores');

  console.log(JSON.stringify({ ok: true, matrix: 'admin/gestor/colaborador' }));
};

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
