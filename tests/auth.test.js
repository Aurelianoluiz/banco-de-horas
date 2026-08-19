import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuth } from '../api/auth.js';

const auth = createAuth({ tokenSecret: 'test-secret', users: [
  { id: 'u1', nome: 'Admin', email: 'admin@example.com', senha: '123', role: 'admin' },
  { id: 'u2', nome: 'João', email: 'joao@example.com', senha: '123', role: 'colaborador' }
] });

test('login gera identidade e token', () => {
  const result = auth.login({ email: 'admin@example.com', senha: '123' });
  assert.equal(result.user.role, 'admin');
  assert.ok(result.token);
  assert.deepEqual(auth.authenticate(result.token).sub, 'u1');
});

test('senha inválida não autentica', () => {
  assert.equal(auth.login({ email: 'admin@example.com', senha: 'errada' }), null);
});

test('permissões variam conforme o perfil', () => {
  const admin = auth.authenticate(auth.login({ email: 'admin@example.com', senha: '123' }).token);
  const colaborador = auth.authenticate(auth.login({ email: 'joao@example.com', senha: '123' }).token);
  assert.equal(auth.authorize(admin, 'configuracoes', 'delete'), true);
  assert.equal(auth.authorize(colaborador, 'colaboradores', 'delete'), false);
  assert.equal(auth.authorize(colaborador, 'apontamentos', 'create'), true);
});
