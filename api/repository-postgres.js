const safeIdentifier = (value) => {
  if (!/^[a-z_][a-z0-9_]*$/i.test(value)) throw new TypeError(`Identificador inválido: ${value}`);
  return `"${value}"`;
};

export class PostgresRepository {
  constructor(pool) {
    if (!pool?.query) throw new TypeError('pool PostgreSQL inválido');
    this.pool = pool;
  }

  async query(text, values = []) {
    return this.pool.query(text, values);
  }

  async list(table, options = {}) {
    const { where = '', values = [] } = typeof options === 'string' ? { where: options } : options;
    const result = await this.query(`SELECT * FROM ${safeIdentifier(table)}${where ? ` WHERE ${where}` : ''}`, values);
    return result.rows;
  }

  async get(table, id) {
    const result = await this.query(`SELECT * FROM ${safeIdentifier(table)} WHERE id = $1 LIMIT 1`, [id]);
    return result.rows[0] ?? null;
  }

  async insert(table, record) {
    if (!record?.id) throw new TypeError('registro.id é obrigatório');
    const entries = Object.entries(record);
    const columns = entries.map(([key]) => safeIdentifier(key)).join(', ');
    const placeholders = entries.map((_, index) => `$${index + 1}`).join(', ');
    const values = entries.map(([, value]) => value);
    const result = await this.query(`INSERT INTO ${safeIdentifier(table)} (${columns}) VALUES (${placeholders}) RETURNING *`, values);
    return result.rows[0];
  }

  async update(table, id, changes) {
    const entries = Object.entries(changes);
    if (!entries.length) return this.get(table, id);
    const assignments = entries.map(([key], index) => `${safeIdentifier(key)} = $${index + 2}`).join(', ');
    const values = entries.map(([, value]) => value);
    const result = await this.query(`UPDATE ${safeIdentifier(table)} SET ${assignments} WHERE id = $1 RETURNING *`, [id, ...values]);
    return result.rows[0] ?? null;
  }

  async remove(table, id) {
    const result = await this.query(`DELETE FROM ${safeIdentifier(table)} WHERE id = $1`, [id]);
    return result.rowCount > 0;
  }
}
