import test from 'node:test';
import assert from 'node:assert/strict';
import { renderApontamentos } from '../web/apontamentos-view.js';

test('view renderiza apontamento e escapa html', () => {
  const html = renderApontamentos({
    colaboradores: [{ id: 'c1', nome: '<João>' }],
    rows: [{ data: '2026-08-21', colaboradorId: 'c1', entrada: '09:00', saida: '18:00', minutosTrabalhados: 480, saldo: 0 }]
  });
  assert.match(html, /&lt;João&gt;/);
  assert.match(html, /09:00/);
  assert.match(html, /480/);
  assert.doesNotMatch(html, /<João>/);
});

test('view mostra vazio e erro', () => {
  assert.match(renderApontamentos(), /Nenhum apontamento/);
  assert.match(renderApontamentos({ error: new Error('falhou') }), /falhou/);
});
