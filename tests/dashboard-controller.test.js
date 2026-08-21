import test from 'node:test';
import assert from 'node:assert/strict';

const load = async () => {
  const adapter = await import('../web/data-adapter.js');
  const controller = await import('../web/dashboard-controller.js');
  return { adapter, controller: controller.dashboardController };
};

test('dashboard usa saldoFinal, creditos, debitos e apontamentos reais', async () => {
  const { adapter, controller } = await load();
  const originalCol = adapter.dataAdapter.loadColaboradores;
  const originalBanco = adapter.dataAdapter.loadBancoHoras;
  const originalApont = adapter.dataAdapter.loadApontamentos;
  try {
    adapter.dataAdapter.loadColaboradores = async () => [{ id: '1', active: true }, { id: '2', active: true }];
    adapter.dataAdapter.loadApontamentos = async () => [
      { minutosTrabalhados: 480 },
      { minutosTrabalhados: 450 }
    ];
    adapter.dataAdapter.loadBancoHoras = async (id) => id === '1'
      ? { saldoFinal: 90, creditos: 120, debitos: 30 }
      : { saldoFinal: -30, creditos: 30, debitos: 60 };

    const state = await controller.load({ competencia: '2026-08' });
    assert.equal(state.cards.saldoAtual, 60);
    assert.equal(state.cards.horasPositivas, 150);
    assert.equal(state.cards.horasNegativas, 90);
    assert.equal(state.cards.horasTrabalhadas, 930);
  } finally {
    adapter.dataAdapter.loadColaboradores = originalCol;
    adapter.dataAdapter.loadBancoHoras = originalBanco;
    adapter.dataAdapter.loadApontamentos = originalApont;
  }
});
