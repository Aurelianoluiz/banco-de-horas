import test from 'node:test';
import assert from 'node:assert/strict';
import { withTransaction } from '../api/repository-transaction.js';

test('withTransaction faz commit e libera conexão', async () => {
  const events = [];
  const client = {
    query: async (sql) => { events.push(sql); return { rows: [] }; },
    release: () => events.push('release')
  };
  const repository = { pool: { connect: async () => client } };
  Object.setPrototypeOf(repository, Object.getPrototypeOf(Object.create(null)));
  const fake = await withTransaction({
    ...repository,
    constructor: { name: 'Fake' }
  }, async (tx) => {
    assert.ok(tx);
    return 42;
  });
  assert.equal(fake, 42);
  assert.deepEqual(events, ['BEGIN', 'COMMIT', 'release']);
});

test('withTransaction faz rollback em erro', async () => {
  const events = [];
  const client = {
    query: async (sql) => { events.push(sql); return { rows: [] }; },
    release: () => events.push('release')
  };
  const repository = { pool: { connect: async () => client } };
  await assert.rejects(() => withTransaction({ pool: repository.pool }, async () => { throw new Error('falha'); }), /falha/);
  assert.deepEqual(events, ['BEGIN', 'ROLLBACK', 'release']);
});
