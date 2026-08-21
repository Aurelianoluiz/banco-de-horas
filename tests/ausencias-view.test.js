import test from 'node:test';
import assert from 'node:assert/strict';
import { renderFerias, renderFolgas, renderFeriados } from '../web/ausencias-view.js';

test('views de ausencias renderizam dados e escapam html', () => {
  assert.match(renderFerias([{ colaboradorId: 'c1', inicio: '2026-08-01', fim: '2026-08-10', dias: 10, status: 'Programada' }]), /2026-08-01/);
  assert.match(renderFolgas([{ colaboradorId: 'c1', data: '2026-08-15', motivo: '<script>', origem: 'Outro', status: 'Solicitada' }]), /&lt;script&gt;/);
  assert.match(renderFeriados([{ data: '2026-09-07', descricao: 'Independência', tipo: 'Nacional' }]), /Independ/);
});
