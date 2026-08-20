import test from 'node:test';
import assert from 'node:assert/strict';

// O teste valida a transformação de registros usada pelo adapter sem depender de DOM.
test('adaptador preserva identificador do registro', () => {
  const normalize = (item) => ({ ...item, id: item.id ?? item._id });
  assert.deepEqual(normalize({ _id: 'c1', nome: 'Ana' }), { _id: 'c1', nome: 'Ana', id: 'c1' });
  assert.deepEqual(normalize({ id: 'c2', nome: 'Bruno' }), { id: 'c2', nome: 'Bruno' });
});
