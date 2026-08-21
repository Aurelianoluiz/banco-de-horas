import { PostgresRepository } from './repository-postgres.js';

export const isPostgresRepository = (repository) => repository instanceof PostgresRepository && typeof repository.pool?.connect === 'function';

export const withTransaction = async (repository, callback) => {
  if (!isPostgresRepository(repository)) return callback(repository);
  const client = await repository.pool.connect();
  const transactionRepository = new PostgresRepository(client);
  try {
    await client.query('BEGIN');
    const result = await callback(transactionRepository);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch { /* preserve original error */ }
    throw error;
  } finally {
    client.release();
  }
};
