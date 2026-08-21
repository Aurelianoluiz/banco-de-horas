import test from 'node:test';
import assert from 'node:assert/strict';
import { createApi } from '../api/http.js';

const auth = { authenticate: async () => ({ sub: 'u1', role: 'admin' }), authorize: async () => true };
const colaborador = { listar: async () => [], obter: async () => null, criar: async () => { const error = new Error('Registro já existe'); error.code = '23505'; throw error; } };
const noop = { listar: async () => [], obter: async () => null, criar: async () => null, atualizar: async () => null, excluir: async () => false };

test('API converte duplicidade em 409', async () => {
  const api = createApi({ colaboradores: colaborador, apontamentos: noop, ferias: noop, folgas: noop, feriados: noop, atestados: noop, ajustes: noop, bancoHoras: noop, fechamentos: noop, auditoria: noop, configuracoes: noop, relatorios: noop, exportacao: noop, exportacaoPdf: noop, auth });
  const response = await api({ method: 'POST', url: '/api/colaboradores', token: 'token', body: { nome: 'Duplicado' } });
  assert.equal(response.status, 409);
});
