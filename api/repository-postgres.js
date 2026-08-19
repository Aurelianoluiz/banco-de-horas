export class PostgresRepository {
  constructor(pool) {
    if (!pool?.query) throw new TypeError('pool PostgreSQL inválido');
    this.pool = pool;
  }

  async query(text, values = []) {
    return this.pool.query(text, values);
  }

  async list(table, { where = '', values = [] } = {}) {
    const result = await this.query(`SELECT * FROM ${safeIdentifier(table)} ${where}`, values);
    return result.rows;
  }

  async get(table, id) {
    const result = await this.query(`SELECT * FROM ${safeIdentifier(table)} WHERE id = $1 LIMIT 1`, [id]);
    return result.rows[0] ?? null;
  }
}

const safeIdentifier = (value) => {
  if (!/^[a-z_][a-z0-9_]*$/i.test(value)) throw new TypeError(`Identificador inválido: ${value}`);
  return `"${value}"`;
};
