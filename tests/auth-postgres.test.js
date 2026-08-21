import test from 'node:test';
import assert from 'node:assert/strict';
import { createPostgresAuth } from '../api/auth-postgres.js';

test('autenticacao PostgreSQL valida usuario ativo e perfil', async () => {
  const auth = createPostgresAuth({
    tokenSecret: '12345678901234567890123456789012',
    repository: {
      async query(sql, values) {
        assert.match(sql, /senha_hash/);
        assert.equal(values[0], 'admin@example.com');
        return { rows: [{ id: '00000000-0000-0000-0000-000000000001', nome: 'Admin', senha_hash: 'pbkdf2$120000$00112233445566778899aabbccddeeff$70fd2c4f5d7f3ebc6b6c49f8fdd0a7f5f7c4eaf2eaf26fce18f9f40a56c52c5d', perfil: 'ADMIN', ativo: true }] };
      }
    }
  });

  const result = await auth.login({ email: 'admin@example.com', senha: 'senha-incorreta' });
  assert.equal(result, null);
});

test('token gerado por login pode ser autenticado quando credencial válida', async () => {
  const password = 'SenhaForte123!';
  const { hashPassword } = createPostgresAuth({
    tokenSecret: '12345678901234567890123456789012',
    repository: { query: async () => ({ rows: [] }) }
  });
  const encoded = hashPassword(password, '00112233445566778899aabbccddeeff');
  const auth = createPostgresAuth({
    tokenSecret: '12345678901234567890123456789012',
    repository: { query: async () => ({ rows: [{ id: '00000000-0000-0000-0000-000000000002', nome: 'Gestor', senha_hash: encoded, perfil: 'GESTOR', ativo: true }] }) }
  });
  const result = await auth.login({ email: 'gestor@example.com', senha: password });
  assert.equal(result.user.role, 'gestor');
  const identity = await auth.authenticate(result.token);
  assert.equal(identity.sub, result.user.id);
  assert.equal(await auth.authorize(identity, 'relatorios', 'read'), true);
  assert.equal(await auth.authorize(identity, 'relatorios', 'delete'), false);
});
