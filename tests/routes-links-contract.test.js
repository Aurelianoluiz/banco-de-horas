import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('..', import.meta.url);

const read = (path) => readFile(new URL(path, root), 'utf8');

const staticHtmlFiles = [
  'app-shell.html',
  'index.html',
  'login.html',
  'apontamentos.html',
  'banco-horas.html',
  'fechamento.html',
  'ausencias.html',
  'calendario.html',
  'atestados.html',
  'colaboradores.html',
  'ajustes.html',
  'configuracoes.html',
  'relatorios.html',
  'auditoria.html'
];

const expectedApiFragments = [
  'POST',
  '/api/login',
  '/api/colaboradores',
  '/api/apontamentos',
  '/api/ferias',
  '/api/folgas',
  '/api/feriados',
  '/api/atestados',
  '/api/ajustes',
  '/api/configuracoes',
  '/api/banco-horas/',
  '/api/fechamentos',
  '/api/auditoria',
  '/api/relatorios/espelho-ponto',
  '/api/relatorios/banco-horas',
  '/api/relatorios/ferias',
  '/api/relatorios/folgas',
  '/api/relatorios/fechamento',
  '/api/relatorios/atrasos',
  '/api/relatorios/export/',
  '/api/relatorios/pdf/'
];

test('todos os destinos principais do sidebar existem como arquivos HTML', async () => {
  const sidebar = await read('web/minimal-sidebar.js');
  const hrefs = [...sidebar.matchAll(/href:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]).filter((href) => href.endsWith('.html'));
  const expected = new Set(['/','/apontamentos.html','/banco-horas.html','/fechamento.html','/ausencias.html','/calendario.html','/atestados.html','/colaboradores.html','/ajustes.html','/configuracoes.html','/relatorios.html','/auditoria.html']);
  assert.deepEqual(new Set(hrefs), expected);
  for (const href of expected) {
    if (href === '/') continue;
    await read(href.slice(1));
  }
});

test('o shell e todas as páginas HTML referenciadas carregam os assets visuais oficiais', async () => {
  for (const file of staticHtmlFiles) {
    const html = await read(file);
    if (file !== 'login.html') {
      assert.match(html + '\nSERVER_INJECTED', /minimal-sidebar/);
    }
  }
  await read('web/minimal-sidebar.css');
  await read('web/minimal-theme.css');
  await read('web/minimal-sidebar.js');
});

test('o backend mantém os endpoints principais usados pelo frontend', async () => {
  const http = await read('api/http.js');
  for (const fragment of expectedApiFragments) assert.ok(http.includes(fragment), `Endpoint/rota ausente: ${fragment}`);
});

test('cliente HTTP mantém os contratos das rotas centrais', async () => {
  const client = await read('web/api-client.js');
  for (const fragment of [
    "request('login'",
    'banco-horas/',
    "request('fechamentos'",
    "reportPath('', tipo",
    "reportPath('export', tipo",
    "reportPath('pdf', tipo"
  ]) assert.ok(client.includes(fragment), `Contrato do cliente ausente: ${fragment}`);
});
