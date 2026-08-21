import test from 'node:test';
import assert from 'node:assert/strict';
import { MemoryRepository } from '../api/repository.js';
import { ApontamentosService } from '../api/services/apontamentos.js';

test('ApontamentosService delega filtro e paginação ao repository', async () => {
  const repository = new MemoryRepository({
    apontamentos: [
      { id: '1', colaboradorId: 'c1', data: '2026-08-01' },
      { id: '2', colaboradorId: 'c1', data: '2026-08-02' },
      { id: '3', colaboradorId: 'c2', data: '2026-08-03' }
    ]
  });
  const service = new ApontamentosService(repository, {});
  const result = await service.listar({ colaboradorId: 'c1', inicio: '2026-08-01', fim: '2026-08-31', limit: 1, offset: 1 });
  assert.deepEqual(result.map((item) => item.id), ['2']);
});
