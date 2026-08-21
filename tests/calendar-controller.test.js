import test from 'node:test';
import assert from 'node:assert/strict';
import { dataAdapter } from '../web/data-adapter.js';
import { calendarController } from '../web/calendar-controller.js';

test('calendario consolida apontamento, feriado, folga e ferias', async () => {
  const originals = {
    apontamentos: dataAdapter.loadApontamentos,
    ferias: dataAdapter.loadFerias,
    folgas: dataAdapter.loadFolgas,
    feriados: dataAdapter.loadFeriados
  };
  dataAdapter.loadApontamentos = async () => [{ data: '2026-08-18', entrada: '08:00', saida: '17:00' }];
  dataAdapter.loadFerias = async () => [{ id: 'f1', inicio: '2026-08-20', fim: '2026-08-22' }];
  dataAdapter.loadFolgas = async () => [{ data: '2026-08-25', motivo: 'Compensação' }];
  dataAdapter.loadFeriados = async () => [{ data: '2026-08-21', descricao: 'Feriado local' }];

  try {
    const state = await calendarController.load({ year: 2026, month: 8 });
    assert.equal(state.events.length, 6);
    assert.equal(calendarController.eventsForDate('2026-08-21')[0].type, 'feriado');
    assert.equal(calendarController.eventsForDate('2026-08-20')[0].type, 'ferias');
    assert.equal(calendarController.eventsForDate('2026-08-25')[0].type, 'folga');
    assert.equal(calendarController.eventsForDate('2026-08-18')[0].type, 'apontamento');
  } finally {
    dataAdapter.loadApontamentos = originals.apontamentos;
    dataAdapter.loadFerias = originals.ferias;
    dataAdapter.loadFolgas = originals.folgas;
    dataAdapter.loadFeriados = originals.feriados;
  }
});
