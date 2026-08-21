import test from 'node:test';
import assert from 'node:assert/strict';
import { createRepository } from '../api/repository.js';
import { ColaboradoresService } from '../api/services/colaboradores.js';
import { AuditoriaService } from '../api/services/auditoria.js';

test('colaboradores: CRUD e validação de nome', () => {
  const service = new ColaboradoresService(createRepository());
  assert.throws(() => service.criar({ nome: ' ' }), /nome é obrigatório/);
  const item = service.criar({ nome: ' Maria ', salario: 3000 });
  assert.equal(item.nome, 'Maria');
  assert.equal(service.obter(item.id).salario, 3000);
  service.atualizar(item.id, { status: 'inativo' });
  assert.equal(service.obter(item.id).status, 'inativo');
  assert.equal(service.excluir(item.id), true);
});

test('auditoria: registra antes/depois e permite filtro', () => {
  const service = new AuditoriaService(createRepository(), () => '2026-08-19T20:00:00.000Z');
  service.registrar({ usuarioId: 'u1', acao: 'ALTERAR', entidade: 'apontamentos', registroId: 'a1', antes: { entrada: '08:10' }, depois: { entrada: '08:00' } });
  const [evento] = service.listar({ registroId: 'a1' });
  assert.equal(evento.usuarioId, 'u1');
  assert.equal(evento.antes.entrada, '08:10');
  assert.equal(evento.depois.entrada, '08:00');
  assert.equal(evento.criadoEm, '2026-08-19T20:00:00.000Z');
});
