import test from 'node:test';
import assert from 'node:assert/strict';
import { toApiApontamento, toLocal, toApiColaborador, toLocalColaborador } from '../web/data-adapter.js';

test('adaptador preserva identificador do registro', () => {
  const item = toLocal({ _id: 'c1', nome: 'Ana' });
  assert.equal(item.id, 'c1');
  assert.equal(item.nome, 'Ana');
  assert.equal(toLocal({ id: 'c2' }).id, 'c2');
});

test('adaptador converte apontamento da UI para o contrato da API', () => {
  assert.deepEqual(toApiApontamento({ id: 'p1', cid: 'c1', date: '2026-08-20', in: '08:00', out: '17:00', brk: '01:00' }), {
    id: 'p1', colaboradorId: 'c1', data: '2026-08-20', entrada: '08:00', saida: '17:00', intervalo: '01:00', ocorrencia: 'Normal'
  });
});

test('adaptador converte colaborador entre UI e API', () => {
  const apiItem = toApiColaborador({ id: 'c1', nome: 'Ana', salario: 3000, seg: '09:00', tol: '00:15', active: true });
  assert.deepEqual(apiItem, { id: 'c1', nome: 'Ana', salario: 3000, jornada: '09:00', tolerancia: '00:15', status: 'ativo' });
  const local = toLocalColaborador(apiItem);
  assert.equal(local.id, 'c1');
  assert.equal(local.tol, '00:15');
  assert.equal(local.active, true);
});
