import test from 'node:test';
import assert from 'node:assert/strict';

const makeStorage = () => { const values = new Map(); return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: (key) => values.delete(key) }; };

test('authSession grava, consulta e limpa a sessao', async () => {
  const previous = globalThis.sessionStorage;
  globalThis.sessionStorage = makeStorage();
  const { authSession } = await import(`../web/auth-session.js?${Date.now()}`);
  authSession.set({ token: 'token-1', user: { id: 'u1', nome: 'Admin', role: 'admin' } });
  assert.equal(authSession.token, 'token-1');
  assert.equal(authSession.user.id, 'u1');
  assert.equal(authSession.isAuthenticated(), true);
  authSession.clear();
  assert.equal(authSession.isAuthenticated(), false);
  globalThis.sessionStorage = previous;
});
