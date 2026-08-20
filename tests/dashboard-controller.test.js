import test from 'node:test';
import assert from 'node:assert/strict';

const load = async () => {
  const adapter = await import('../web/data-adapter.js');
  const controller = await import('../web/dashboard-controller.js');
  return { adapter, controller: controller.dashboardController };
};

test('dashboard soma saldo e horas do banco', async () => {
  const { adapter, controller } = await load();
  const originalCol = adapter.dataAdapter.loadColaboradores;
  const originalBanco = adapter.dataAdapter.loadBancoHoras;
  adapter.dataAdapter.loadColaboradores = async () => [{ id: '1' }, { id: '2' }];
  adapter.dataAdapter.loadBancoHoras = async (id) => id === '1'
    ? { saldoAtual: '01:30', creditos: '02:00', debitos: '-00:30', horasTrabalhadas: '08:00' }
    : { saldoAtual: '-00:30', creditos: '00:30', debitos: '-01:00', horasTrabalhadas: '07:30' };

  const state = await controller.load({ competencia: '2026-08' });
  assert.equal(state.cards.saldoAtual, 60);
  assert.equal(state.cards.horasPositivas, 150);
  assert.equal(state.cards.horasNegativas, 90);
  assert.equal(state.cards.horasTrabalhadas, 930);

  adapter.dataAdapter.loadColaboradores = originalCol;
  adapter.dataAdapter.loadBancoHoras = originalBanco;
});
