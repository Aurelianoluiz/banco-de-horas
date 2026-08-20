import pg from 'pg';

const { Pool } = pg;

export const createPostgresPool = ({ connectionString = process.env.DATABASE_URL } = {}) => {
  if (!connectionString) throw new Error('DATABASE_URL é obrigatório para PostgreSQL');
  return new Pool({ connectionString, max: 10, idleTimeoutMillis: 30_000 });
};
