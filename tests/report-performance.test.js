import test from 'node:test';
import assert from 'node:assert/strict';
import { createRepository } from '../api/repository.js';
import { PostgresRepository } from '../api/repository-postgres.js';
import { RelatoriosService } from '../api/services/relatorios.js';

test('relatório usa consulta por faixa no repository em memória', async () => {
  const repository = createRepository({
    apontamentos: [
      { id: '1', colaboradorId: 'c1', data: '2026-08-01', minutosTrabalhados: 480, minutosPrevistos: 480, saldo: 0 },
      { id: '2', colaboradorId: 'c1', data: '2026-09-01', minutosTrabalhados: 480, minutosPrevistos: 480, saldo: 0 }
    ]
  });
  const service = new RelatoriosService(repository);
  const rows = await service.espelhoPonto({ colaboradorId: 'c1', competencia: '2026-08' });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].data, '2026-08-01');
});

test('PostgresRepository consulta apontamentos por faixa com parâmetros', async () => {
  const calls = [];
  const repository = new PostgresRepository({
    query: async (text, values) => {
      calls.push({ text, values });
      return { rows: [] };
    }
  });
  await repository.listApontamentosByRange({ inicio: '2026-08-01', fim: '2026-09-01', colaboradorId: 'c1' });
  assert.equal(calls.length, 1);
  assert.match(calls[0].text, /"data" >= \$1 AND "data" < \$2/);
  assert.match(calls[0].text, /"colaborador_id" = \$3/);
  assert.match(calls[0].text, /ORDER BY "data", "id" LIMIT \$4/);
  assert.deepEqual(calls[0].values, ['2026-08-01', '2026-09-01', 'c1', 500]);
});
