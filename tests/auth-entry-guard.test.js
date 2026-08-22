import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('servidor LOCAL injeta auth guard em páginas protegidas', async () => {
  const localServer = await readFile(new URL('../scripts/server-local.ps1', import.meta.url), 'utf8');
  assert.match(localServer, /web\/auth-guard\.js/);
  assert.match(localServer, /\$pageName -ne 'login\.html'/);
});

test('auth guard protege a raiz e deixa login público', async () => {
  const guard = await readFile(new URL('../web/auth-guard.js', import.meta.url), 'utf8');
  assert.match(guard, /path === '\/login\.html'/);
  assert.match(guard, /requireAuth\(\{ redirect: '\/login\.html' \}\)/);
});
