import test from 'node:test';
import assert from 'node:assert/strict';
import { renderRelatorio } from '../web/relatorios-view.js';

const target = () => ({ innerHTML: '' });

test('renderRelatorio mostra resumo', () => {
  const node = target();
  renderRelatorio({ loading: false, error: null, rows: [], resumo: { competencia: '2026-08', quantidade: 2, horasTrabalhadas: 930, horasPrevistas: 960, creditos: 30, debitos: 60, saldo: -30 } }, node);
  assert.match(node.innerHTML, /2026-08/);
  assert.match(node.innerHTML, /00h 30min/);
});

test('renderRelatorio escapa conteudo de tabela', () => {
  const node = target();
  renderRelatorio({ loading: false, error: null, rows: [{ nome: '<script>alert(1)</script>', saldo: 30 }], resumo: null }, node);
  assert.doesNotMatch(node.innerHTML, /<script>alert/);
  assert.match(node.innerHTML, /00h 30min/);
});
