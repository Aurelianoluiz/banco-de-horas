import test from 'node:test';
import assert from 'node:assert/strict';
import { balanceMinutes, calculatePoint, expectedMinutes, workedMinutes } from '../rules/jornada.js';

test('calcula jornada padrão de 8 horas', () => {
  assert.equal(workedMinutes({ entrada: '08:00', saida: '17:00', intervalo: '01:00' }), 480);
});

test('tolerância zera pequeno saldo', () => {
  assert.equal(balanceMinutes({ data: '2026-08-18', entrada: '08:00', saida: '16:50', intervalo: '01:00' }, { cargaSegQui: '08:00', tolerancia: '00:15' }), 0);
});

test('crédito acima da tolerância é preservado', () => {
  assert.equal(balanceMinutes({ data: '2026-08-18', entrada: '08:00', saida: '17:20', intervalo: '01:00' }, { cargaSegQui: '08:00', tolerancia: '00:15' }), 20);
});

test('sexta-feira usa carga específica', () => {
  assert.equal(expectedMinutes('2026-08-21', { cargaSegQui: '09:00', cargaSexta: '08:00' }), 480);
});

test('sábado usa carga de sábado e domingo não gera jornada', () => {
  assert.equal(expectedMinutes('2026-08-22', { cargaSabado: '04:00' }), 240);
  assert.equal(expectedMinutes('2026-08-23', { cargaSabado: '04:00' }), 0);
});

test('calcula o ponto com resultado detalhado', () => {
  assert.deepEqual(calculatePoint({ data: '2026-08-18', entrada: '08:00', saida: '17:20', intervalo: '01:00' }, { cargaSegQui: '08:00', tolerancia: '00:15' }), {
    trabalhado: 500,
    previsto: 480,
    saldo: 20,
    classificacao: 'credito',
  });
});
