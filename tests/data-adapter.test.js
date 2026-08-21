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

test('adaptador preserva carga de sexta do colaborador', () => {
  const apiItem = toApiColaborador({ id: 'c1', nome: 'Ana', salario: 3000, seg: '09:00', sex: '07:30', tol: '00:15', active: true });
  assert.equal(apiItem.cargaSegQui, '09:00');
  assert.equal(apiItem.cargaSexta, '07:30');
  assert.equal(apiItem.tolerancia, '00:15');
  const local = toLocalColaborador({ id: 'c1', nome: 'Ana', carga_seg_qui_min: 540, carga_sexta_min: 450, tolerancia_min: 15, ativo: true });
  assert.equal(local.seg, '09:00');
  assert.equal(local.sex, '07:30');
  assert.equal(local.tol, '00:15');
});
