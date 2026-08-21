import test from 'node:test';
import assert from 'node:assert/strict';
import { PostgresRepository } from '../api/repository-postgres.js';
import { withTransaction } from '../api/repository-transaction.js';

test('withTransaction faz commit e libera conexão', async () => {
  const events = [];
  const client = {
    query: async (sql) => { events.push(sql); return { rows: [] }; },
    release: () => events.push('release')
  };
  const repository = new PostgresRepository({ connect: async () => client, query: async () => ({ rows: [] }) });
  const result = await withTransaction(repository, async (tx) => { assert.ok(tx instanceof PostgresRepository); return 42; });
  assert.equal(result, 42);
  assert.deepEqual(events, ['BEGIN', 'COMMIT', 'release']);
});

test('withTransaction faz rollback em erro', async () => {
  const events = [];
  const client = {
    query: async (sql) => { events.push(sql); return { rows: [] }; },
    release: () => events.push('release')
  };
  const repository = new PostgresRepository({ connect: async () => client, query: async () => ({ rows: [] }) });
  await assert.rejects(() => withTransaction(repository, async () => { throw new Error('falha'); }), /falha/);
  assert.deepEqual(events, ['BEGIN', 'ROLLBACK', 'release']);
});
