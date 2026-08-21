import test from 'node:test';
import assert from 'node:assert/strict';
import { MemoryRepository } from '../api/repository.js';

test('MemoryRepository aplica filtros por igualdade e aliases de CRUD', async () => {
  const repo = new MemoryRepository({
    atestados: [
      { id: '1', colaboradorId: 'c1', status: 'Pendente' },
      { id: '2', colaboradorId: 'c2', status: 'Aprovado' }
    ]
  });
  assert.equal(repo.list('atestados', { colaboradorId: 'c1' }).length, 1);
  assert.equal(repo.findById('atestados', '1').id, '1');
  assert.equal(repo.delete('atestados', '1'), true);
  assert.equal(repo.findById('atestados', '1'), null);
});

test('MemoryRepository persiste configuracao pela chave', async () => {
  const repo = new MemoryRepository();
  const saved = repo.upsertConfiguracao('toleranciaMin', 15, 'u1');
  assert.equal(saved.chave, 'toleranciaMin');
  assert.equal(repo.findOne('configuracoes', { chave: 'toleranciaMin' }).valor, 15);
  const updated = repo.upsertConfiguracao('toleranciaMin', 20, 'u2');
  assert.equal(updated.valor, 20);
  assert.equal(repo.list('configuracoes').length, 1);
});
