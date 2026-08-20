import test from 'node:test';
import assert from 'node:assert/strict';
import { PostgresRepository } from '../api/repository-postgres.js';

const pool = () => ({
  calls: [],
  async query(text, values) {
    this.calls.push({ text, values });
    return { rows: [{ id: '1', nome: 'Maria', colaborador_id: 'col-1', horas_trabalhadas: 480 }], rowCount: 1 };
  }
});

test('PostgresRepository valida CRUD e usa parâmetros', async () => {
  const fakePool = pool();
  const repo = new PostgresRepository(fakePool);

  await repo.get('colaboradores', '1');
  await repo.list('colaboradores', { where: 'status = $1', values: ['ativo'] });
  await repo.insert('colaboradores', { id: '1', nome: 'Maria' });
  await repo.update('colaboradores', '1', { nome: 'Maria Silva' });
  await repo.remove('colaboradores', '1');

  assert.equal(fakePool.calls.length, 5);
  assert.deepEqual(fakePool.calls[0].values, ['1']);
  assert.deepEqual(fakePool.calls[1].values, ['ativo']);
  assert.deepEqual(fakePool.calls[2].values, ['1', 'Maria']);
  assert.deepEqual(fakePool.calls[3].values, ['1', 'Maria Silva']);
  assert.deepEqual(fakePool.calls[4].values, ['1']);
});

test('PostgresRepository converte camelCase para snake_case e linhas para camelCase', async () => {
  const fakePool = pool();
  const repo = new PostgresRepository(fakePool);

  const inserted = await repo.insert('apontamentos', {
    id: 'apt-1',
    colaboradorId: 'col-1',
    horasTrabalhadas: 480
  });

  assert.match(fakePool.calls[0].text, /"colaborador_id"/);
  assert.match(fakePool.calls[0].text, /"horas_trabalhadas"/);
  assert.equal(inserted.colaboradorId, 'col-1');
  assert.equal(inserted.horasTrabalhadas, 480);
});

test('PostgresRepository rejeita identificador SQL inválido', async () => {
  const repo = new PostgresRepository(pool());
  await assert.rejects(() => repo.get('colaboradores; DROP TABLE usuarios', '1'), /Identificador inválido/);
});
