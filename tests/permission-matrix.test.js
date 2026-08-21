import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuth } from '../api/auth.js';

const auth = createAuth({ tokenSecret: 'segredo-com-mais-de-32-caracteres-para-testes' });
const identity = (role) => ({ sub: `${role}-1`, role });

const expectPermission = async (role, resource, action, expected) => {
  assert.equal(await auth.authorize(identity(role), resource, action), expected, `${role} ${action} ${resource}`);
};

test('ADMIN possui acesso total', async () => {
  for (const resource of ['dashboard', 'colaboradores', 'apontamentos', 'bancoHoras', 'ferias', 'folgas', 'feriados', 'atestados', 'ajustes', 'configuracoes', 'fechamentos', 'auditoria', 'relatorios']) {
    for (const action of ['read', 'create', 'update', 'delete', 'approve']) {
      await expectPermission('admin', resource, action, true);
    }
  }
});

test('GESTOR fica limitado aos módulos operacionais previstos', async () => {
  for (const [resource, actions] of Object.entries({
    dashboard: ['read'], colaboradores: ['read', 'create', 'update'], apontamentos: ['read', 'create', 'update'], bancoHoras: ['read'],
    ferias: ['read', 'create', 'update'], folgas: ['read', 'create', 'update'], relatorios: ['read'], configuracoes: ['read']
  })) {
    for (const action of actions) await expectPermission('gestor', resource, action, true);
  }
  for (const pair of [
    ['colaboradores', 'delete'], ['apontamentos', 'delete'], ['bancoHoras', 'update'], ['ferias', 'delete'], ['folgas', 'delete'],
    ['feriados', 'read'], ['atestados', 'read'], ['ajustes', 'read'], ['ajustes', 'create'], ['configuracoes', 'update'],
    ['fechamentos', 'approve'], ['auditoria', 'read']
  ]) await expectPermission('gestor', pair[0], pair[1], false);
});

test('COLABORADOR fica limitado aos próprios módulos', async () => {
  for (const [resource, actions] of Object.entries({
    dashboard: ['read'], apontamentos: ['read', 'create'], bancoHoras: ['read'], ferias: ['read'], folgas: ['read']
  })) {
    for (const action of actions) await expectPermission('colaborador', resource, action, true);
  }
  for (const pair of [
    ['colaboradores', 'read'], ['colaboradores', 'create'], ['apontamentos', 'update'], ['apontamentos', 'delete'],
    ['feriados', 'read'], ['atestados', 'read'], ['ajustes', 'read'], ['configuracoes', 'read'], ['configuracoes', 'update'],
    ['fechamentos', 'approve'], ['auditoria', 'read'], ['relatorios', 'read']
  ]) await expectPermission('colaborador', pair[0], pair[1], false);
});
