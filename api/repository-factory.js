import { createRepository as createMemoryRepository } from './repository.js';
import { PostgresRepository } from './repository-postgres.js';

export const createAppRepository = ({ env = process.env.NODE_ENV, pool } = {}) => {
  if (env === 'production' || env === 'postgres') {
    if (!pool) throw new Error('Pool PostgreSQL é obrigatório neste ambiente');
    return new PostgresRepository(pool);
  }
  return createMemoryRepository();
};
