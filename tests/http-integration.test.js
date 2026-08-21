import test from 'node:test';
import assert from 'node:assert/strict';
import { createApi } from '../api/http.js';

const auth = {
  async login() { return { token: 't', user: { id: 'u1', role: 'ADMIN' } }; },
  async authenticate(token) { return token === 't' ? { sub: 'u1', role: 'ADMIN' } : null; },
  async authorize() { return true; }
};

const service = () => ({
  async listar() { return [{ id: '1' }]; },
  async obter(id) { return id === '1' ? { id: '1' } : null; },
  async criar(body) { return { id: '2', ...body }; },
  async atualizar(id, body) { return id === '1' ? { id, ...body } : null; },
  async excluir(id) { return id === '1'; }
});

test('API exige autenticacao em rota protegida', async () => {
  const api = createApi({ colaboradores: service(), apontamentos: service(), bancoHoras: { resumo: async () => ({}) }, fechamentos: { fechar: async () => ({}) }, ferias: service(), folgas: service(), feriados: service(), relatorios: {}, exportacao: {}, exportacaoPdf: {}, auth });
  const response = await api({ method: 'GET', url: '/api/colaboradores' });
  assert.equal(response.status, 401);
});

test('API executa CRUD protegido com token valido', async () => {
  const api = createApi({ colaboradores: service(), apontamentos: service(), bancoHoras: { resumo: async () => ({}) }, fechamentos: { fechar: async (body) => body }, ferias: service(), folgas: service(), feriados: service(), relatorios: {}, exportacao: {}, exportacaoPdf: {}, auth });
  const response = await api({ method: 'POST', url: '/api/colaboradores', token: 't', body: { nome: 'Ana' } });
  assert.equal(response.status, 201);
  assert.deepEqual(JSON.parse(response.body), { id: '2', nome: 'Ana' });
});

test('fechamento recebe identidade autenticada', async () => {
  let received;
  const api = createApi({ colaboradores: service(), apontamentos: service(), bancoHoras: { resumo: async () => ({}) }, fechamentos: { fechar: async (body) => { received = body; return body; } }, ferias: service(), folgas: service(), feriados: service(), relatorios: {}, exportacao: {}, exportacaoPdf: {}, auth });
  const response = await api({ method: 'POST', url: '/api/fechamentos', token: 't', body: { colaboradorId: 'c1', competencia: '2026-08' } });
  assert.equal(response.status, 201);
  assert.equal(received.usuarioId, 'u1');
});
