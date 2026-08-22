import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('minimal sidebar and visual system contract are present in SQL and LOCAL modes', async () => {
  const [server, localServer, sidebarCss, sidebarJs, themeCss] = await Promise.all([
    readFile(new URL('../server.js', import.meta.url), 'utf8'),
    readFile(new URL('../scripts/server-local.ps1', import.meta.url), 'utf8'),
    readFile(new URL('../web/minimal-sidebar.css', import.meta.url), 'utf8'),
    readFile(new URL('../web/minimal-sidebar.js', import.meta.url), 'utf8'),
    readFile(new URL('../web/minimal-theme.css', import.meta.url), 'utf8')
  ]);

  assert.match(sidebarCss, /\.mh-sidebar/);
  assert.match(sidebarCss, /mh-sidebar__rail/);
  assert.match(sidebarCss, /mh-sidebar__panel/);
  assert.match(sidebarCss, /mh-sidebar__search/);
  assert.match(sidebarJs, /mh-sidebar/);
  assert.match(sidebarJs, /localStorage/);
  assert.match(sidebarJs, /Dashboard/);
  assert.match(sidebarJs, /Relatórios/);
  assert.match(themeCss, /body\.mh-layout/);
  assert.match(themeCss, /\.card/);
  assert.match(themeCss, /\.primary/);
  assert.match(server, /minimal-sidebar\.css/);
  assert.match(server, /minimal-sidebar\.js/);
  assert.match(server, /minimal-theme\.css/);
  assert.match(server, /pageName !== '\/login\.html'/);
  assert.match(localServer, /minimal-sidebar\.css/);
  assert.match(localServer, /minimal-sidebar\.js/);
  assert.match(localServer, /minimal-theme\.css/);
});
