import test from 'node:test';
import assert from 'node:assert/strict';
import { createRepository } from '../api/repository.js';
import { createApi } from '../api/http.js';
import { ColaboradoresService } from '../api/services/colaboradores.js';
import { ApontamentosService } from '../api/services/apontamentos.js';

const config = { cargaSegQui: '09:00', cargaSexta: '08:00', tolerancia: '00:15' };

test('api HTTP cria e consulta colaborador', async () => {
  const repo = createRepository();
  const api = createApi({ colaboradores: new ColaboradoresService(repo), apontamentos: new ApontamentosService(repo, config), bancoHoras: { resumo: () => ({ saldo: 0 }) }, fechamentos: { fechar: () => ({ status: 'fechado' }) } });
  const created = await api({ method: 'POST', url: '/api/colaboradores', body: { nome: 'Ana' } });
  assert.equal(created.status, 201);
  const data = JSON.parse(created.body);
  const found = await api({ method: 'GET', url: `/api/colaboradores/${data.id}` });
  assert.equal(found.status, 200);
  assert.equal(JSON.parse(found.body).nome, 'Ana');
});

test('api HTTP retorna 404 para rota inexistente', async () => {
  const api = createApi({ colaboradores: {}, apontamentos: {}, bancoHoras: {}, fechamentos: {} });
  const response = await api({ method: 'GET', url: '/api/inexistente' });
  assert.equal(response.status, 404);
});
