import test from 'node:test';
import assert from 'node:assert/strict';
import { createRepository } from '../api/repository.js';
import { PostgresRepository } from '../api/repository-postgres.js';

test('MemoryRepository aplica limit e offset e respeita teto de 500', () => {
  const seed = Array.from({ length: 650 }, (_, index) => ({ id: String(index + 1), nome: `Pessoa ${index + 1}` }));
  const repository = createRepository({ colaboradores: seed });
  assert.equal(repository.list('colaboradores').length, 200);
  assert.equal(repository.list('colaboradores', { limit: 25, offset: 10 })[0].id, '11');
  assert.equal(repository.list('colaboradores', { limit: 9999 }).length, 500);
});

test('PostgresRepository separa filtros de paginação e usa LIMIT/OFFSET parametrizados', async () => {
  const calls = [];
  const repository = new PostgresRepository({
    query: async (text, values) => {
      calls.push({ text, values });
      return { rows: [] };
    }
  });
  await repository.list('colaboradores', { ativo: true, limit: 20, offset: 40 });
  assert.equal(calls.length, 1);
  assert.match(calls[0].text, /WHERE "ativo" = \$1 LIMIT \$2 OFFSET \$3/);
  assert.deepEqual(calls[0].values, [true, 20, 40]);
});
