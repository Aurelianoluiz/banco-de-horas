import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const requiredFiles = [
  'app-shell.html',
  'server.js',
  'package.json',
  '.env.example',
  'docker-compose.homologacao.yml',
  'docker-compose.production.yml',
  'Dockerfile',
  'database/schema.sql',
  'database/seed-homologacao.js',
  'database/backup.sh',
  'database/restore.sh',
  'docs/LOCAL.md',
  'docs/HOMOLOGACAO.md',
  'docs/PRODUCAO.md',
  'docs/RELEASE-1.0.0.md',
  'web/minimal-sidebar.css',
  'web/minimal-sidebar.js',
  'web/minimal-theme.css',
  'tests/runtime-http-smoke.mjs',
  'tests/minimal-sidebar-contract.test.js'
];

const run = (command, args) => new Promise((resolve, reject) => {
  const child = spawn(command, args, { stdio: 'inherit', shell: false });
  child.once('error', reject);
  child.once('exit', (code) => code === 0 ? resolve() : reject(new Error(`${command} terminou com codigo ${code}`)));
});

const main = async () => {
  for (const file of requiredFiles) {
    await access(new URL(`../${file}`, import.meta.url));
  }

  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(pkg.version, '1.0.0');
  assert.equal(pkg.private, true);
  assert.match(await readFile(new URL('../docker-compose.production.yml', import.meta.url), 'utf8'), /127\.0\.0\.1:3000:3000/);
  assert.doesNotMatch(await readFile(new URL('../docker-compose.production.yml', import.meta.url), 'utf8'), /5432:5432/);

  await run(process.execPath, ['--check', 'server.js']);
  await run(process.execPath, ['--check', 'web/minimal-sidebar.js']);
  await run(process.execPath, ['--check', 'tests/runtime-http-smoke.mjs']);

  console.log(JSON.stringify({ ok: true, version: pkg.version, requiredFiles: requiredFiles.length }, null, 2));
};

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
