import test from 'node:test';
import assert from 'node:assert/strict';

const originalFetch = globalThis.fetch;

test.afterEach(() => { globalThis.fetch = originalFetch; });

test('adapter mapeia ferias folgas e feriados para a API', async () => {
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url, options });
    const path = String(url);
    const body = path.includes('/ferias')
      ? { id: 'f1', colaboradorId: 'c1', inicio: '2026-08-01', fim: '2026-08-10', dias: 10, status: 'Programada' }
      : path.includes('/folgas')
        ? { id: 'l1', colaboradorId: 'c1', data: '2026-08-20', motivo: 'Compensação', origem: 'Banco de horas', status: 'Aprovada' }
        : { id: 'h1', data: '2026-09-07', descricao: 'Independência', tipo: 'Nacional' };
    return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
  };

  const { dataAdapter } = await import('../web/data-adapter.js?absences-test');
  const ferias = await dataAdapter.loadFerias('c1');
  const folgas = await dataAdapter.loadFolgas('c1');
  const feriados = await dataAdapter.loadFeriados();

  assert.equal(ferias[0].id, 'f1');
  assert.equal(folgas[0].motivo, 'Compensação');
  assert.equal(feriados[0].nome, 'Independência');
  assert.match(calls[0].url, /\/api\/ferias\?colaboradorId=c1/);
});
