import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePoint } from '../rules/jornada.js';
import { nightMinutes } from '../rules/compensacao.js';

const config = { cargaSegQui: '09:00', cargaSexta: '08:00', tolerancia: '00:15' };

test('caso XLS 02/01: 08h40 trabalhadas gera débito de 20 min', () => {
  const result = calculatePoint({ data: '2012-01-02', entrada: '07:20', saida: '17:00', intervalo: '01:00' }, config);
  assert.equal(result.trabalhado, 520);
  assert.equal(result.previsto, 540);
  assert.equal(result.saldo, -20);
});

test('caso XLS 04/01: 11h trabalhadas gera crédito de 2h', () => {
  const result = calculatePoint({ data: '2012-01-04', entrada: '07:00', saida: '19:00', intervalo: '01:00' }, config);
  assert.equal(result.trabalhado, 660);
  assert.equal(result.previsto, 540);
  assert.equal(result.saldo, 120);
});

test('caso XLS 05/01: identifica adicional noturno de 01h15', () => {
  assert.equal(nightMinutes({ entrada: '13:00', saida: '23:15' }), 75);
});

test('caso XLS 25/01: identifica 01h de adicional noturno', () => {
  assert.equal(nightMinutes({ entrada: '13:00', saida: '23:00' }), 60);
});
