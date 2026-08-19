import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuth } from '../api/auth.js';
import { createApi } from '../api/http.js';

const secret = '01234567890123456789012345678901';

test('login gera token assinado e rota protegida exige autenticacao', async () => {
  const auth = createAuth({ tokenSecret: secret, users: [{ id: 'u1', nome: 'Ana', email: 'ana@example.com', role: 'colaborador', senhaHash: createAuth({ tokenSecret: secret }).hashPassword('123456') }] });
  const api = createApi({ auth, colaboradores: { listar: () => [] }, apontamentos: {}, bancoHoras: {}, fechamentos: {} });
  const login = await api({ method: 'POST', url: '/api/login', body: { email: 'ana@example.com', senha: '123456' } });
  assert.equal(login.status, 200);
  const token = JSON.parse(login.body).token;
  const protectedResponse = await api({ method: 'GET', url: '/api/colaboradores', token });
  assert.equal(protectedResponse.status, 200);
});

test('rota protegida rejeita token ausente', async () => {
  const auth = createAuth({ tokenSecret: secret });
  const api = createApi({ auth, colaboradores: { listar: () => [] }, apontamentos: {}, bancoHoras: {}, fechamentos: {} });
  const response = await api({ method: 'GET', url: '/api/colaboradores' });
  assert.equal(response.status, 401);
});
