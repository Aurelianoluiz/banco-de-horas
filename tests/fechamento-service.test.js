import test from 'node:test';
import assert from 'node:assert/strict';
import { createRepository } from '../api/repository.js';
import { AuditoriaService } from '../api/services/auditoria.js';
import { FechamentoService } from '../api/services/fechamento.js';

test('fechamento consolida crédito e impede fechamento duplicado', () => {
  const repo = createRepository({ apontamentos: [
    { id: 'a1', colaboradorId: 'c1', data: '2026-08-01', saldo: 120 },
    { id: 'a2', colaboradorId: 'c1', data: '2026-08-02', saldo: -30 }
  ] });
  const audit = new AuditoriaService(repo, () => '2026-08-19T20:00:00.000Z');
  const service = new FechamentoService(repo, audit);
  const result = service.fechar({ colaboradorId: 'c1', competencia: '2026-08', saldoAnterior: 60, usuarioId: 'u1' });
  assert.equal(result.creditos, 120);
  assert.equal(result.debitos, 30);
  assert.equal(result.saldoFinal, 150);
  assert.throws(() => service.fechar({ colaboradorId: 'c1', competencia: '2026-08', usuarioId: 'u1' }), /já fechada/);
  assert.equal(repo.list('auditoria').length, 1);
});
