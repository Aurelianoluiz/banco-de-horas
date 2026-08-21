import test from 'node:test';
import assert from 'node:assert/strict';
import { createApi } from '../api/http.js';
import { createFeriasService, createFolgasService, createFeriadosService } from '../api/services/ausencias.js';
import { createRepository } from '../api/repository.js';

const auth = {
  async authenticate() { return { id: 'u1', perfil: 'admin' }; },
  async authorize() { return true; }
};

const setup = () => {
  const repository = createRepository();
  return createApi({
    colaboradores: {}, apontamentos: {}, bancoHoras: {}, fechamentos: {},
    ferias: createFeriasService(repository),
    folgas: createFolgasService(repository),
    feriados: createFeriadosService(repository),
    auth
  });
};

test('rotas HTTP criam e consultam ferias, folgas e feriados', async () => {
  const api = setup();
  const ferie = await api({ method: 'POST', url: '/api/ferias', body: { colaboradorId: 'c1', inicio: '2026-08-01', fim: '2026-08-10' }, token: 't' });
  assert.equal(ferie.status, 201);
  const folga = await api({ method: 'POST', url: '/api/folgas', body: { colaboradorId: 'c1', data: '2026-08-20', motivo: 'Compensação' }, token: 't' });
  assert.equal(folga.status, 201);
  const feriado = await api({ method: 'POST', url: '/api/feriados', body: { data: '2026-09-07', descricao: 'Independência', tipo: 'Nacional' }, token: 't' });
  assert.equal(feriado.status, 201);

  const list = await api({ method: 'GET', url: '/api/ferias?colaboradorId=c1', token: 't' });
  assert.equal(list.status, 200);
  assert.equal(JSON.parse(list.body).length, 1);
});
