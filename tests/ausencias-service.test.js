import test from 'node:test';
import assert from 'node:assert/strict';
import { createFeriasService, createFolgasService, createFeriadosService } from '../api/services/ausencias.js';

const repo = () => {
  const rows = new Map(); let seq = 0;
  return {
    async list(table) { return [...(rows.get(table)?.values() || [])]; },
    async get(table, id) { return rows.get(table)?.get(id) || null; },
    async insert(table, data) { const item = { id: String(++seq), ...data }; if (!rows.has(table)) rows.set(table, new Map()); rows.get(table).set(item.id, item); return item; },
    async update(table, id, data) { const old = rows.get(table)?.get(id); if (!old) return null; const item = { ...old, ...data }; rows.get(table).set(id, item); return item; },
    async remove(table, id) { return rows.get(table)?.delete(id) || false; }
  };
};

test('ferias valida periodo e persiste', async () => {
  const service = createFeriasService(repo());
  const item = await service.criar({ colaboradorId: 'c1', inicio: '2026-08-01', fim: '2026-08-30' });
  assert.equal(item.colaboradorId, 'c1');
  await assert.rejects(() => service.criar({ colaboradorId: 'c1', inicio: '2026-08-30', fim: '2026-08-01' }), /Período/);
});

test('folga exige colaborador e data', async () => {
  const service = createFolgasService(repo());
  await assert.rejects(() => service.criar({ data: '2026-08-20' }), /colaboradorId/);
  assert.equal((await service.criar({ colaboradorId: 'c1', data: '2026-08-20', motivo: 'Compensação' })).data, '2026-08-20');
});

test('feriado exige descricao e data', async () => {
  const service = createFeriadosService(repo());
  await assert.rejects(() => service.criar({ data: '2026-01-01' }), /descricao/);
  assert.equal((await service.criar({ descricao: 'Confraternização', data: '2026-01-01' })).descricao, 'Confraternização');
});
