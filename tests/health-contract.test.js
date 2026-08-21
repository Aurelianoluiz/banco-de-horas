import test from 'node:test';
import assert from 'node:assert/strict';

const source = await import('node:fs/promises').then(({ readFile }) => readFile('server.js', 'utf8'));

test('server exposes a non-cached health endpoint', () => {
  assert.match(source, /\/health/);
  assert.match(source, /'cache-control': 'no-store'/);
  assert.match(source, /status: 'ok'/);
});
