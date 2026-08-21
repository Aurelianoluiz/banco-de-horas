import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const root = process.cwd();
const requiredFiles = [
  'scripts/start-local.bat',
  'scripts/start-local.ps1',
  'scripts/server-local.ps1',
  'scripts/stop-local.ps1',
  'scripts/diagnostico-docker.ps1',
  'docs/LOCAL.md',
  'web/index-compat.js'
];

for (const file of requiredFiles) {
  test(`arquivo local presente: ${file}`, () => {
    assert.equal(existsSync(`${root}/${file}`), true);
  });
}

test('launcher possui modos SQL e LOCAL', () => {
  const content = readFileSync(`${root}/scripts/start-local.ps1`, 'utf8');
  assert.match(content, /SQL - PostgreSQL \+ application/);
  assert.match(content, /LOCAL - no SQL\/Docker/);
});

test('servidor LOCAL usa TcpListener e loopback', () => {
  const content = readFileSync(`${root}/scripts/server-local.ps1`, 'utf8');
  assert.match(content, /TcpListener/);
  assert.match(content, /IPAddress::Loopback/);
  assert.doesNotMatch(content, /HttpListener/);
});

test('servidor LOCAL usa shell oficial e compatibilidade do index', () => {
  const content = readFileSync(`${root}/scripts/server-local.ps1`, 'utf8');
  assert.match(content, /app-shell\.html/);
  assert.match(content, /index-compat\.js/);
});
