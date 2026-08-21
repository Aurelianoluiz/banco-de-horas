import test from 'node:test';
import assert from 'node:assert/strict';
import { renderColaboradores } from '../web/colaboradores-view.js';

test('view de colaboradores renderiza dados e escapa html', () => {
  const html = renderColaboradores({ rows: [{ nome: '<Ana>', salario: 3000, seg: '09:00', sex: '08:00', tol: '00:15', active: true }] });
  assert.match(html, /&lt;Ana&gt;/);
  assert.match(html, /09:00/);
  assert.match(html, /Ativo/);
});

test('view de colaboradores trata vazio e erro', () => {
  assert.match(renderColaboradores({ rows: [] }), /Nenhum colaborador/);
  assert.match(renderColaboradores({ error: new Error('falhou') }), /falhou/);
});
