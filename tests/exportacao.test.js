import test from 'node:test';
import assert from 'node:assert/strict';
import xlsx from 'node-xlsx';
import { ExportacaoService, toMatrix, safeSheetName } from '../api/services/exportacao.js';

test('exportacao gera workbook XLSX valido', async () => {
  const service = new ExportacaoService({
    espelhoPonto: async () => [{ id: '1', data: '2026-08-21', saldo: 30 }]
  });
  const buffer = await service.xlsx('espelhoPonto', { competencia: '2026-08' });
  assert.ok(Buffer.isBuffer(buffer));
  const sheets = xlsx.parse(buffer);
  assert.equal(sheets.length, 1);
  assert.deepEqual(sheets[0].data[0], ['id', 'data', 'saldo']);
  assert.deepEqual(sheets[0].data[1], ['1', '2026-08-21', 30]);
});

test('helpers da exportacao normalizam matriz e nome de planilha', () => {
  assert.deepEqual(toMatrix([{ a: 1, b: 2 }, { a: 3, b: null }]), [['a', 'b'], [1, 2], [3, '']]);
  assert.equal(safeSheetName('a/b*c:d[e]?'), 'a b c d e ');
});
