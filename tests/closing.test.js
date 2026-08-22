import test from 'node:test';
import assert from 'node:assert/strict';
import { closeMonth, monthlySummary } from '../rules/fechamento.js';

test('consolida créditos e débitos da competência', () => {
  const points = [
    { colaboradorId: 'c1', data: '2026-08-03', saldo: 30 },
    { colaboradorId: 'c1', data: '2026-08-04', saldo: -10 },
    { colaboradorId: 'c1', data: '2026-09-01', saldo: 50 },
    { colaboradorId: 'c2', data: '2026-08-03', saldo: 99 },
  ];

  assert.deepEqual(monthlySummary(points, 'c1', '2026-08'), { creditos: 30, debitos: 10 });
});

test('fecha competência preservando saldo anterior', () => {
  const fechamento = closeMonth({
    colaboradorId: 'c1',
    competencia: '2026-08',
    saldoAnterior: 120,
    points: [
      { colaboradorId: 'c1', data: '2026-08-03', saldo: 30 },
      { colaboradorId: 'c1', data: '2026-08-04', saldo: -10 },
    ],
    fechadoEm: '2026-08-31T18:00:00.000Z',
  });

  assert.deepEqual(fechamento, {
    colaboradorId: 'c1',
    competencia: '2026-08',
    saldoAnterior: 120,
    creditos: 30,
    debitos: 10,
    saldoFinal: 140,
    fechadoEm: '2026-08-31T18:00:00.000Z',
  });
});
