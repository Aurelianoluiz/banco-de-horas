const assertId = (id) => {
  if (!id || typeof id !== 'string') throw new TypeError('id é obrigatório');
  return id;
};

export class MemoryRepository {
  constructor(seed = {}) {
    this.collections = new Map();
    for (const [name, records] of Object.entries(seed)) {
      this.collections.set(name, new Map(records.map((record) => [record.id, structuredClone(record)])));
    }
  }

  collection(name) {
    if (!this.collections.has(name)) this.collections.set(name, new Map());
    return this.collections.get(name);
  }

  list(name, options = {}) {
    const predicate = typeof options === 'function' ? options : (options.predicate || (() => true));
    return [...this.collection(name).values()].filter(predicate).map((record) => structuredClone(record));
  }

  get(name, id) {
    const record = this.collection(name).get(assertId(id));
    return record ? structuredClone(record) : null;
  }

  insert(name, record) {
    if (!record?.id) throw new TypeError('registro.id é obrigatório');
    const collection = this.collection(name);
    if (collection.has(record.id)) throw new Error(`Registro já existe: ${record.id}`);
    collection.set(record.id, structuredClone(record));
    return structuredClone(record);
  }

  update(name, id, changes) {
    const collection = this.collection(name);
    const current = collection.get(assertId(id));
    if (!current) return null;
    const updated = { ...current, ...structuredClone(changes), id };
    collection.set(id, updated);
    return structuredClone(updated);
  }

  remove(name, id) {
    return this.collection(name).delete(assertId(id));
  }
}

export const createRepository = (seed) => new MemoryRepository(seed);
