import test from 'node:test';
import assert from 'node:assert/strict';
import { dataAdapter } from '../web/data-adapter.js';
import { absenceController } from '../web/absence-controller.js';

test('absence controller carrega ferias, folgas e feriados', async () => {
  const originalFerias = dataAdapter.loadFerias;
  const originalFolgas = dataAdapter.loadFolgas;
  const originalFeriados = dataAdapter.loadFeriados;
  dataAdapter.loadFerias = async () => [{ id: 'f1' }];
  dataAdapter.loadFolgas = async () => [{ id: 'l1' }];
  dataAdapter.loadFeriados = async () => [{ id: 'h1' }];
  const state = await absenceController.load({ colaboradorId: 'c1' });
  assert.deepEqual(state.ferias, [{ id: 'f1' }]);
  assert.deepEqual(state.folgas, [{ id: 'l1' }]);
  assert.deepEqual(state.feriados, [{ id: 'h1' }]);
  dataAdapter.loadFerias = originalFerias;
  dataAdapter.loadFolgas = originalFolgas;
  dataAdapter.loadFeriados = originalFeriados;
});
