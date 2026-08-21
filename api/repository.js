const assertId = (id) => {
  if (!id || typeof id !== 'string') throw new TypeError('id é obrigatório');
  return id;
};

const matches = (record, filters) => Object.entries(filters).every(([key, value]) => value === undefined || value === null || value === '' || record[key] === value);

const paginate = (records, options = {}) => {
  const rawLimit = Number(options.limit);
  const rawOffset = Number(options.offset);
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(Math.floor(rawLimit), 500) : 200;
  const offset = Number.isFinite(rawOffset) && rawOffset >= 0 ? Math.floor(rawOffset) : 0;
  return records.slice(offset, offset + limit);
};

export class MemoryRepository {
  constructor(seed = {}) {
    this.collections = new Map();
    for (const [name, records] of Object.entries(seed)) {
      this.collections.set(name, new Map(records.map((record) => [record.id, structuredClone(record)])));
    }
  }
  collection(name) { if (!this.collections.has(name)) this.collections.set(name, new Map()); return this.collections.get(name); }
  list(name, options = {}) {
    const predicate = typeof options === 'function' ? options : options.predicate || ((record) => matches(record, Object.fromEntries(Object.entries(options).filter(([key]) => !['limit', 'offset', 'where'].includes(key)))));
    return paginate([...this.collection(name).values()].filter(predicate).map((record) => structuredClone(record)), options);
  }
  listApontamentosByRange({ inicio, fim, colaboradorId } = {}) {
    return this.list('apontamentos', { predicate: (record) => String(record.data || '') >= inicio && String(record.data || '') < fim && (!colaboradorId || record.colaboradorId === colaboradorId), limit: 500 });
  }
  get(name, id) { const record = this.collection(name).get(assertId(id)); return record ? structuredClone(record) : null; }
  findById(name, id) { return this.get(name, id); }
  findOne(name, predicate = {}) { return this.list(name, (record) => Object.entries(predicate).every(([key, value]) => record[key] === value))[0] || null; }
  insert(name, record) { if (!record?.id) throw new TypeError('registro.id é obrigatório'); const collection = this.collection(name); if (collection.has(record.id)) throw new Error(`Registro já existe: ${record.id}`); collection.set(record.id, structuredClone(record)); return structuredClone(record); }
  update(name, id, changes) { const collection = this.collection(name); const current = collection.get(assertId(id)); if (!current) return null; const updated = { ...current, ...structuredClone(changes), id }; collection.set(id, updated); return structuredClone(updated); }
  remove(name, id) { return this.collection(name).delete(assertId(id)); }
  delete(name, id) { return this.remove(name, id); }
  upsertConfiguracao(chave, valor, usuarioId = null) { const collection = this.collection('configuracoes'); const current = collection.get(chave); const updated = { chave, valor, atualizadoPor: usuarioId, atualizadoEm: new Date().toISOString() }; collection.set(chave, { ...(current || {}), ...updated }); return structuredClone(collection.get(chave)); }
}

export const createRepository = (seed) => new MemoryRepository(seed);
