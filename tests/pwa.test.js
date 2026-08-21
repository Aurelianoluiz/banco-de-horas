import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('manifest define scope, start_url e icone', async () => {
  const manifest = JSON.parse(await readFile(new URL('../manifest.webmanifest', import.meta.url), 'utf8'));
  assert.equal(manifest.start_url, '/');
  assert.equal(manifest.scope, '/');
  assert.ok(Array.isArray(manifest.icons));
  assert.ok(manifest.icons.length > 0);
});

test('service worker não intercepta API', async () => {
  const sw = await readFile(new URL('../service-worker.js', import.meta.url), 'utf8');
  assert.match(sw, /url\.pathname\.startsWith\('\/api\/'\)/);
  assert.match(sw, /self\.addEventListener\('fetch'/);
});
