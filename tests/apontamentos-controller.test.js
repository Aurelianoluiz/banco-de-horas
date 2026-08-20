import test from 'node:test';
import assert from 'node:assert/strict';
import { apontamentosController } from '../web/apontamentos-controller.js';

const original = {
  loadApontamentos: (async () => []),
  saveApontamento: (async (payload, id) => ({ id: id || 'p-1', ...payload })),
  removeApontamento: (async () => undefined)
};

test('controller mantém estado após salvar e excluir', async () => {
  const adapter = await import('../web/data-adapter.js');
  Object.assign(adapter.dataAdapter, original);

  await apontamentosController.load();
  const saved = await apontamentosController.save({ cid: 'c-1', date: '2026-08-20', in: '08:00', out: '17:00', brk: '01:00' });
  assert.equal(saved.id, 'p-1');
  assert.equal(apontamentosController.getState().rows.length, 1);

  await apontamentosController.remove('p-1');
  assert.equal(apontamentosController.getState().rows.length, 0);
});
