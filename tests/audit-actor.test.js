import test from 'node:test';
import assert from 'node:assert/strict';
import { ColaboradoresService } from '../api/services/colaboradores.js';
import { ApontamentosService } from '../api/services/apontamentos.js';

const makeRepository = () => {
  const data = new Map();
  return {
    get: async (table, id) => data.get(`${table}:${id}`) || null,
    insert: async (table, record) => { data.set(`${table}:${record.id}`, structuredClone(record)); return structuredClone(record); },
    update: async (table, id, changes) => { const current = data.get(`${table}:${id}`); const next = { ...current, ...changes, id }; data.set(`${table}:${id}`, next); return structuredClone(next); },
    remove: async (table, id) => data.delete(`${table}:${id}`)
  };
};

test('colaborador registra usuario autenticado na auditoria', async () => {
  const events = [];
  const service = new ColaboradoresService(makeRepository(), { registrar: async (event) => events.push(event) });
  await service.criar({ nome: 'Teste' }, 'user-123');
  assert.equal(events[0].usuarioId, 'user-123');
});

test('apontamento registra usuário autenticado na auditoria', async () => {
  const repo = makeRepository();
  await repo.insert('colaboradores', { id: 'c1', nome: 'Teste', cargaSegQui: '09:00', cargaSexta: '08:00', tolerancia: '00:15' });
  const events = [];
  const service = new ApontamentosService(repo, {}, { registrar: async (event) => events.push(event) });
  await service.criar({ colaboradorId: 'c1', data: '2026-08-21', entrada: '09:00', saida: '18:00', intervalo: '01:00' }, 'user-123');
  assert.equal(events[0].usuarioId, 'user-123');
});
