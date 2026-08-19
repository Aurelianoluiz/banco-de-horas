import test from 'node:test';
import assert from 'node:assert/strict';
import { PostgresRepository } from '../api/repository-postgres.js';

test('postgres repository rejeita identificador inválido antes da consulta', async () => {
  const repo = new PostgresRepository({ query: async () => ({ rows: [] }) });
  await assert.rejects(() => repo.get('colaboradores;drop table usuarios', '1'), /Identificador inválido/);
});

test('postgres repository consulta registro por id', async () => {
  const calls = [];
  const repo = new PostgresRepository({ query: async (text, values) => { calls.push({ text, values }); return { rows: [{ id: 'c1', nome: 'Ana' }] }; } });
  const result = await repo.get('colaboradores', 'c1');
  assert.equal(result.nome, 'Ana');
  assert.deepEqual(calls[0].values, ['c1']);
});
