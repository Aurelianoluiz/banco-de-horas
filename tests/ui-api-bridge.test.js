import assert from 'node:assert/strict';
import test from 'node:test';

const bridgeSource = await import('../web/ui-api-bridge.js');


test('expõe a ponte da UI com operações de apontamentos', () => {
  const bridge = bridgeSource.uiApiBridge;
  assert.equal(typeof bridge.loadApontamentos, 'function');
  assert.equal(typeof bridge.saveApontamento, 'function');
  assert.equal(typeof bridge.removeApontamento, 'function');
});

test('expõe operações de colaboradores e banco de horas', () => {
  const bridge = bridgeSource.uiApiBridge;
  assert.equal(typeof bridge.loadColaboradores, 'function');
  assert.equal(typeof bridge.saveColaborador, 'function');
  assert.equal(typeof bridge.removeColaborador, 'function');
  assert.equal(typeof bridge.loadBancoHoras, 'function');
});
