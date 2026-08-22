import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('modo LOCAL injeta API bridge no login e auth guard nas páginas protegidas', async () => {
  const [server, bridge, guard, login] = await Promise.all([
    read('scripts/server-local.ps1'),
    read('web/local-api-bridge.js'),
    read('web/auth-guard.js'),
    read('login.html')
  ]);

  assert.match(server, /web\/local-api-bridge\.js/);
  assert.match(server, /web\/auth-guard\.js/);
  assert.match(bridge, /\/api\/login/);
  assert.match(bridge, /method === 'POST'/);
  assert.match(bridge, /Credenciais inválidas/);
  assert.match(guard, /\/login\.html/);
  assert.doesNotMatch(login, /web\/auth-guard\.js/);
});
