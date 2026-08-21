import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuth, PASSWORD_ITERATIONS } from '../api/auth.js';
import { createApi } from '../api/http.js';

const user = { id: 'user-1', nome: 'Colaborador 1', role: 'colaborador', email: 'c1@test.local', senhaHash: '' };

const buildAuth = () => {
  const authFactory = createAuth({ users: [user], tokenSecret: 'segredo-com-mais-de-32-caracteres-para-testes' });
  user.senhaHash = authFactory.hashPassword('senha');
  return authFactory;
};

test('hash de senha usa 600000 iterações', () => {
  assert.equal(PASSWORD_ITERATIONS, 600000);
  const auth = buildAuth();
  const result = auth.login({ email: user.email, senha: 'senha' });
  assert.ok(result?.token);
});

test('colaborador não pode acessar apontamento de outro colaborador', async () => {
  const auth = buildAuth();
  const repositories = {
    collaborators: [
      { id: 'col-1', usuarioId: 'user-1', nome: 'Colaborador 1' },
      { id: 'col-2', usuarioId: 'user-2', nome: 'Colaborador 2' }
    ],
    apontamentos: [{ id: 'p-2', colaboradorId: 'col-2', data: '2026-08-20' }]
  };
  const colaboradores = { listar: async (filter = {}) => repositories.collaborators.filter((c) => !filter.usuarioId || c.usuarioId === filter.usuarioId), obter: async (id) => repositories.collaborators.find((c) => c.id === id) || null };
  const apontamentos = {
    listar: async (filter = {}) => repositories.apontamentos.filter((p) => !filter.colaboradorId || p.colaboradorId === filter.colaboradorId),
    obter: async (id) => repositories.apontamentos.find((p) => p.id === id) || null,
    criar: async (body) => body,
    atualizar: async (id, body) => ({ id, ...body }),
    excluir: async () => true
  };
  const noop = { listar: async () => [], obter: async () => null, criar: async (body) => body, atualizar: async (id, body) => ({ id, ...body }), excluir: async () => true };
  const api = createApi({ colaboradores, apontamentos, ferias: noop, folgas: noop, feriados: noop, atestados: noop, ajustes: noop, bancoHoras: noop, fechamentos: noop, auditoria: noop, configuracoes: noop, relatorios: noop, exportacao: noop, exportacaoPdf: noop, auth });
  const token = auth.login({ email: user.email, senha: 'senha' }).token;
  const response = await api({ method: 'GET', url: '/api/apontamentos/p-2', token });
  assert.equal(response.status, 403);
});
