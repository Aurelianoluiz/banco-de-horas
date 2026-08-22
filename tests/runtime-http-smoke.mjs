import assert from 'node:assert/strict';

const baseUrl = (process.env.BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');

const requiredAssets = [
  '/',
  '/web/minimal-sidebar.css',
  '/web/minimal-sidebar.js',
  '/web/minimal-theme.css',
  '/web/responsive.css'
];

const fetchText = async (path) => {
  const response = await fetch(`${baseUrl}${path}`, { redirect: 'manual' });
  const body = await response.text();
  assert.ok(response.status >= 200 && response.status < 300, `${path} retornou HTTP ${response.status}`);
  return { response, body };
};

const main = async () => {
  const root = await fetchText('/');
  assert.match(root.body, /app-shell|Dashboard/i, 'a entrada principal nao parece ser o shell do Banco de Horas');

  for (const asset of requiredAssets.slice(1)) {
    await fetchText(asset);
  }

  assert.match(root.body, /minimal-sidebar/i, 'o shell nao referencia o Sidebar minimalista');
  assert.match(root.body, /minimal-theme/i, 'o shell nao referencia o Design System');

  console.log(JSON.stringify({ ok: true, baseUrl, assets: requiredAssets }, null, 2));
};

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
