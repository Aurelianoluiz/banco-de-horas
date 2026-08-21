import test from 'node:test';
import assert from 'node:assert/strict';
import { createRepository } from '../api/repository.js';
import { ApontamentosService } from '../api/services/apontamentos.js';

const config = { cargaSegQui: '09:00', cargaSexta: '08:00', tolerancia: '00:15' };

test('repositorio isola cópias dos registros', () => {
  const repo = createRepository();
  const original = repo.insert('colaboradores', { id: 'c1', nome: 'Ana' });
  original.nome = 'Alterado fora';
  assert.equal(repo.get('colaboradores', 'c1').nome, 'Ana');
});

test('serviço cria apontamento com cálculo de jornada', () => {
  const service = new ApontamentosService(createRepository(), config);
  const item = service.criar({ colaboradorId: 'c1', data: '2012-01-04', entrada: '07:00', saida: '19:00', intervalo: '01:00' });
  assert.equal(item.trabalhado, 660);
  assert.equal(item.previsto, 540);
  assert.equal(item.saldo, 120);
});
