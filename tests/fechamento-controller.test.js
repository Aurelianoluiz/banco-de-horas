import test from 'node:test';
import assert from 'node:assert/strict';
import { api } from '../web/api-client.js';
import { fechamentoController } from '../web/fechamento-controller.js';

test('fechamento consulta resumo e preserva resultado', async () => {
  const originalRelatorio = api.relatorio;
  api.relatorio = async () => ({ creditos: 120, debitos: 30 });
  const state = await fechamentoController.carregarResumo('c1', '2026-08');
  assert.equal(state.resumo.creditos, 120);
  assert.equal(state.resumo.debitos, 30);
  api.relatorio = originalRelatorio;
});

test('fechamento envia saldo anterior ao backend', async () => {
  const originalFechar = api.fechar;
  let args;
  api.fechar = async (...values) => { args = values; return { id: 'f1', saldoFinal: 90 }; };
  const result = await fechamentoController.fechar('c1', '2026-08', 10);
  assert.deepEqual(args, ['2026-08', 'c1', 10]);
  assert.equal(result.id, 'f1');
  api.fechar = originalFechar;
});
