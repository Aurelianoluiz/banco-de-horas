import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeApontamentoRows, timeToMinutes } from '../importadores/apontamento-xls.js';

function rows() {
  const r = Array.from({ length: 56 }, () => []);
  r[2][2] = 'Funcionário teste';
  r[2][18] = new Date('2012-01-01');
  r[4][7] = 0;
  r[4][13] = 220;
  r[4][18] = new Date('2012-01-31');
  r[6][13] = '09:00';
  r[8][8] = '00:00';
  r[8][13] = '08:00';
  r[8][19] = '00:15';
  r[12][2] = 'Data';
  r[12][5] = 'Ocorr.';
  r[12][7] = 'Entrada';
  r[12][8] = 'Saída';
  r[12][9] = 'Entrada';
  r[12][10] = 'Saída';
  r[12][11] = 'HORAS TOTAIS';
  r[12][13] = 'Hs Extras Total';
  r[12][14] = 'Faltas e Atrasos';
  r[14][2] = new Date('2012-01-02');
  r[14][5] = 'Normal';
  r[14][7] = '07:20';
  r[14][8] = '12:00';
  r[14][9] = '13:00';
  r[14][10] = '17:00';
  r[14][11] = '08:40';
  r[15][2] = new Date('2012-01-03');
  r[15][5] = 'Normal';
  r[15][7] = '07:00';
  r[15][8] = '12:00';
  r[15][9] = '13:00';
  r[15][10] = '17:00';
  r[15][11] = '09:00';
  return r;
}

test('converte horários da planilha para minutos', () => {
  assert.equal(timeToMinutes('09:00'), 540);
  assert.equal(timeToMinutes('00:15'), 15);
});

test('extrai parâmetros, período e apontamentos', () => {
  const result = analyzeApontamentoRows(rows());
  assert.equal(result.diagnostics.valid, true);
  assert.equal(result.metadata.name, 'Funcionário teste');
  assert.equal(result.metadata.monthlyMinutes, 220 * 60);
  assert.equal(result.metadata.segQui, 540);
  assert.equal(result.metadata.sexta, 480);
  assert.equal(result.metadata.tolerancia, 15);
  assert.equal(result.records.length, 2);
  assert.equal(result.records[0].horasTotais, 520);
});

test('detecta aba/dados inválidos sem lançar exceção', () => {
  const result = analyzeApontamentoRows([[]]);
  assert.equal(result.diagnostics.valid, false);
  assert.ok(result.diagnostics.errors.some((e) => e.code === 'PERIODO_INVALIDO'));
});
