import test from 'node:test';
import assert from 'node:assert/strict';
import { createRepository } from '../api/repository.js';
import { createApi } from '../api/http.js';
import { ColaboradoresService } from '../api/services/colaboradores.js';
import { ApontamentosService } from '../api/services/apontamentos.js';

const config = { cargaSegQui: '09:00', cargaSexta: '08:00', cargaSabado: '00:00', tolerancia: '00:15' };
const auth = {
  authenticate: () => ({ sub: 'u1', role: 'admin' }),
  authorize: () => true
};

const setup = () => {
  const repo = createRepository();
  return createApi({
    auth,
    colaboradores: new ColaboradoresService(repo),
    apontamentos: new ApontamentosService(repo, config),
    bancoHoras: { resumo: () => ({ saldo: 0 }) },
    fechamentos: { fechar: () => ({ status: 'fechado' }) }
  });
};

test('API CRUD de colaborador', async () => {
  const api = setup();
  const created = await api({ method: 'POST', url: '/api/colaboradores', body: { nome: 'Maria' }, token: 't' });
  const id = JSON.parse(created.body).id;
  assert.equal(created.status, 201);

  const updated = await api({ method: 'PATCH', url: `/api/colaboradores/${id}`, body: { nome: 'Maria Silva' }, token: 't' });
  assert.equal(updated.status, 200);
  assert.equal(JSON.parse(updated.body).nome, 'Maria Silva');

  const removed = await api({ method: 'DELETE', url: `/api/colaboradores/${id}`, token: 't' });
  assert.equal(removed.status, 200);

  const missing = await api({ method: 'GET', url: `/api/colaboradores/${id}`, token: 't' });
  assert.equal(missing.status, 404);
});

test('API CRUD de apontamento', async () => {
  const api = setup();
  const col = await api({ method: 'POST', url: '/api/colaboradores', body: { nome: 'João' }, token: 't' });
  const colaboradorId = JSON.parse(col.body).id;

  const created = await api({
    method: 'POST', url: '/api/apontamentos',
    body: { colaboradorId, data: '2026-08-20', entrada: '08:00', saida: '18:00', intervalo: '01:00' }, token: 't'
  });
  assert.equal(created.status, 201);
  const id = JSON.parse(created.body).id;

  const updated = await api({ method: 'PATCH', url: `/api/apontamentos/${id}`, body: { saida: '17:00' }, token: 't' });
  assert.equal(updated.status, 200);
  assert.equal(JSON.parse(updated.body).saida, '17:00');

  const removed = await api({ method: 'DELETE', url: `/api/apontamentos/${id}`, token: 't' });
  assert.equal(removed.status, 200);
});
