import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('minimal sidebar assets and server injection contract are present', async () => {
  const [server, sidebarCss, sidebarJs] = await Promise.all([
    readFile(new URL('../server.js', import.meta.url), 'utf8'),
    readFile(new URL('../web/minimal-sidebar.css', import.meta.url), 'utf8'),
    readFile(new URL('../web/minimal-sidebar.js', import.meta.url), 'utf8')
  ]);

  assert.match(sidebarCss, /\.mh-sidebar/);
  assert.match(sidebarCss, /mh-sidebar__rail/);
  assert.match(sidebarCss, /mh-sidebar__panel/);
  assert.match(sidebarCss, /mh-sidebar__search/);
  assert.match(sidebarJs, /mh-sidebar/);
  assert.match(sidebarJs, /localStorage/);
  assert.match(sidebarJs, /Dashboard/);
  assert.match(sidebarJs, /Relatórios/);
  assert.match(server, /minimal-sidebar\.css/);
  assert.match(server, /minimal-sidebar\.js/);
  assert.match(server, /pageName !== '\/login\.html'/);
});
