import test from 'node:test';
import assert from 'node:assert/strict';
import { createRepository } from '../api/repository.js';
import { AuditoriaService } from '../api/services/auditoria.js';
import { ColaboradoresService } from '../api/services/colaboradores.js';

test('CRUD de colaboradores registra criação, alteração e exclusão', () => {
  const repo = createRepository();
  const auditoria = new AuditoriaService(repo, () => '2026-08-20T10:00:00.000Z');
  const service = new ColaboradoresService(repo, auditoria, () => 'u-1');
  const criado = service.criar({ nome: 'Maria' });
  service.atualizar(criado.id, { nome: 'Maria Silva' });
  service.excluir(criado.id);

  const eventos = auditoria.listar({ registroId: criado.id });
  assert.equal(eventos.length, 3);
  assert.deepEqual(eventos.map((event) => event.acao), ['CRIAR', 'ALTERAR', 'EXCLUIR']);
  assert.equal(eventos[1].antes.nome, 'Maria');
  assert.equal(eventos[1].depois.nome, 'Maria Silva');
  assert.equal(eventos[2].antes.nome, 'Maria Silva');
  assert.equal(eventos.every((event) => event.usuarioId === 'u-1'), true);
});
