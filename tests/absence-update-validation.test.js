import test from 'node:test';
import assert from 'node:assert/strict';
import { createFeriasService } from '../api/services/ausencias.js';
import { AtestadosService } from '../api/services/atestados.js';

const repository = (records) => ({
  list: async () => records,
  get: async (_table, id) => records.find((item) => item.id === id) || null,
  findById: async (_table, id) => records.find((item) => item.id === id) || null,
  update: async (_table, id, patch) => ({ ...records.find((item) => item.id === id), ...patch })
});

test('férias rejeita update que inverte o período', async () => {
  const service = createFeriasService(repository([{ id: 'f1', colaboradorId: 'c1', inicio: '2026-08-24', fim: '2026-08-25', status: 'Programada', dias: 2 }]));
  await assert.rejects(() => service.atualizar('f1', { fim: '2026-08-23' }), /Período de férias inválido/);
});

test('atestado rejeita update que inverte o período', async () => {
  const service = new AtestadosService(repository([{ id: 'a1', colaboradorId: 'c1', inicio: '2026-08-27', fim: '2026-08-27', status: 'Pendente' }]));
  await assert.rejects(() => service.atualizar('a1', { fim: '2026-08-26' }), /Período de atestado inválido/);
});
