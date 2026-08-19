import test from 'node:test';
import assert from 'node:assert/strict';
import { XLS_RULES, extraEligible, nightMinutes, summarizeExtra } from '../rules/compensacao.js';

test('preserva os parâmetros explícitos encontrados no XLS', () => {
  assert.equal(XLS_RULES.cargaMensal, '220:00');
  assert.equal(XLS_RULES.cargaSegQui, '09:00');
  assert.equal(XLS_RULES.cargaSexta, '08:00');
  assert.equal(XLS_RULES.tolerancia, '00:15');
  assert.deepEqual(XLS_RULES.faixasHoraExtra, [0.5, 0.8, 1.5]);
});

test('hora extra só é elegível a partir do corte identificado no XLS', () => {
  assert.equal(extraEligible(119), false);
  assert.equal(extraEligible(120), true);
  assert.deepEqual(summarizeExtra(150), { minutos: 150, horario: '02:30', elegivel: true });
});

test('calcula adicional noturno entre 22:00 e 05:00', () => {
  assert.equal(nightMinutes({ entrada: '21:00', saida: '23:30' }), 90);
  assert.equal(nightMinutes({ entrada: '22:00', saida: '05:00' }), 420);
  assert.equal(nightMinutes({ entrada: '21:00', saida: '06:00' }), 420);
});
