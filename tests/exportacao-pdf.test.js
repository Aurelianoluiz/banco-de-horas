import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPdf, formatMinutes, ExportacaoPdfService } from '../api/services/exportacao-pdf.js';

test('formatMinutes formata saldo em minutos', () => {
  assert.equal(formatMinutes(90), '01:30');
  assert.equal(formatMinutes(-30), '-00:30');
});

test('buildPdf gera documento PDF', async () => {
  const buffer = await buildPdf({ title: 'Teste', competencia: '2026-08', rows: [{ data: '2026-08-01', saldo: 90 }] });
  assert.equal(buffer.subarray(0, 5).toString(), '%PDF-');
  assert.ok(buffer.length > 500);
});

test('ExportacaoPdfService usa o relatorio existente', async () => {
  const service = new ExportacaoPdfService({ espelhoPonto: async () => [{ data: '2026-08-01', saldo: 0 }] });
  const buffer = await service.pdf('espelhoPonto', { competencia: '2026-08' });
  assert.equal(buffer.subarray(0, 5).toString(), '%PDF-');
});
