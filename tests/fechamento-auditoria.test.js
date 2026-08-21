import test from 'node:test';
import assert from 'node:assert/strict';
import { createRepository } from '../api/repository.js';
import { AuditoriaService } from '../api/services/auditoria.js';
import { FechamentoService } from '../api/services/fechamento.js';

test('fechamento mensal gera evento de auditoria', () => {
  const repo = createRepository();
  const auditoria = new AuditoriaService(repo, () => '2026-08-20T12:00:00.000Z');
  const service = new FechamentoService(repo, auditoria);
  const fechamento = service.fechar({ colaboradorId: 'c1', competencia: '2026-07', saldoAnterior: 60, usuarioId: 'u1' });
  const eventos = auditoria.listar({ registroId: fechamento.id });
  assert.equal(eventos.length, 1);
  assert.equal(eventos[0].acao, 'FECHAR_COMPETENCIA');
  assert.equal(eventos[0].usuarioId, 'u1');
  assert.equal(eventos[0].depois.id, fechamento.id);
});

test('não permite fechar a mesma competência duas vezes', () => {
  const repo = createRepository();
  const service = new FechamentoService(repo);
  service.fechar({ colaboradorId: 'c1', competencia: '2026-07' });
  assert.throws(() => service.fechar({ colaboradorId: 'c1', competencia: '2026-07' }), /Competência já fechada/);
});
