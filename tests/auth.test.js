import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuth } from '../api/auth.js';

const secret = 'test-secret-012345678901234567890123';
const auth = createAuth({ tokenSecret: secret });
const users = [
  { id: 'u1', nome: 'Admin', email: 'admin@example.com', senhaHash: auth.hashPassword('123'), role: 'admin' },
  { id: 'u2', nome: 'João', email: 'joao@example.com', senhaHash: auth.hashPassword('123'), role: 'colaborador' }
];
const configuredAuth = createAuth({ tokenSecret: secret, users });

test('login gera identidade e token', () => {
  const result = configuredAuth.login({ email: 'admin@example.com', senha: '123' });
  assert.equal(result.user.role, 'admin');
  assert.ok(result.token);
  assert.deepEqual(configuredAuth.authenticate(result.token).sub, 'u1');
});

test('senha inválida não autentica', () => {
  assert.equal(configuredAuth.login({ email: 'admin@example.com', senha: 'errada' }), null);
});

test('permissões variam conforme o perfil', () => {
  const admin = configuredAuth.authenticate(configuredAuth.login({ email: 'admin@example.com', senha: '123' }).token);
  const colaborador = configuredAuth.authenticate(configuredAuth.login({ email: 'joao@example.com', senha: '123' }).token);
  assert.equal(configuredAuth.authorize(admin, 'configuracoes', 'delete'), true);
  assert.equal(configuredAuth.authorize(colaborador, 'colaboradores', 'delete'), false);
  assert.equal(configuredAuth.authorize(colaborador, 'apontamentos', 'create'), true);
});
