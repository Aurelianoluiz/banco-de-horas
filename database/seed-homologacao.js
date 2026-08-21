import pg from 'pg';
import { randomUUID, pbkdf2Sync, randomBytes } from 'node:crypto';

const { Pool } = pg;

const required = ['DATABASE_URL', 'SEED_ADMIN_PASSWORD', 'SEED_GESTOR_PASSWORD', 'SEED_COLABORADOR_PASSWORD'];
for (const key of required) {
  if (!process.env[key]) throw new Error(`${key} é obrigatório para o seed de homologação`);
}

const hashPassword = (password) => {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 600000, 32, 'sha256').toString('hex');
  return `pbkdf2$600000$${salt}$${hash}`;
};

const USERS = [
  { id: '00000000-0000-4000-8000-000000000001', nome: 'Admin Homologação', email: 'admin.homologacao@bancodehoras.local', perfil: 'admin', password: process.env.SEED_ADMIN_PASSWORD },
  { id: '00000000-0000-4000-8000-000000000002', nome: 'Gestor Homologação', email: 'gestor.homologacao@bancodehoras.local', perfil: 'gestor', password: process.env.SEED_GESTOR_PASSWORD },
  { id: '00000000-0000-4000-8000-000000000003', nome: 'Colaborador Homologação', email: 'colaborador.homologacao@bancodehoras.local', perfil: 'colaborador', password: process.env.SEED_COLABORADOR_PASSWORD }
];

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });

const query = (text, values = []) => pool.query(text, values);

const main = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const user of USERS) {
      await client.query(
        `INSERT INTO usuarios (id, nome, email, senha_hash, perfil, ativo)
         VALUES ($1, $2, lower($3), $4, $5, true)
         ON CONFLICT (email) DO NOTHING`,
        [user.id, user.nome, user.email, hashPassword(user.password), user.perfil]
      );
    }

    const usersByEmail = {};
    for (const user of USERS) {
      const result = await client.query('SELECT id FROM usuarios WHERE lower(email) = lower($1) LIMIT 1', [user.email]);
      if (!result.rows[0]) throw new Error(`Usuário de seed não encontrado: ${user.email}`);
      usersByEmail[user.email] = result.rows[0].id;
    }

    const adminId = usersByEmail[USERS[0].email];
    const gestorId = usersByEmail[USERS[1].email];
    const colaboradorUserId = usersByEmail[USERS[2].email];

    const collaboratorId = '10000000-0000-4000-8000-000000000001';
    await client.query(
      `INSERT INTO colaboradores (id, usuario_id, nome, salario, carga_seg_qui_min, carga_sexta_min, tolerancia_min, ativo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       ON CONFLICT (id) DO NOTHING`,
      [collaboratorId, colaboradorUserId, 'Colaborador Homologação', 3500, 540, 480, 15]
    );

    const collaboratorRows = [
      ['2026-08-17', 480, 60, 1020, 480, 480, 0],
      ['2026-08-18', 485, 60, 1025, 480, 480, 0],
      ['2026-08-19', 490, 60, 1030, 480, 480, 0],
      ['2026-08-20', 480, 60, 1050, 510, 480, 30],
      ['2026-08-21', 480, 60, 960, 420, 480, -60]
    ];

    for (const [date, entradaMin, intervaloMin, saidaMin, trabalhados, previstos, saldo] of collaboratorRows) {
      await client.query(
        `INSERT INTO apontamentos (id, colaborador_id, data, entrada_min, intervalo_min, saida_min, ocorrencia, minutos_trabalhados, minutos_previstos, saldo_min, extra_min, observacao, aprovado)
         VALUES ($1, $2, $3, $4, $5, $6, 'Normal', $7, $8, $9, $10, $11, true)
         ON CONFLICT (colaborador_id, data) DO NOTHING`,
        [randomUUID(), collaboratorId, date, entradaMin, intervaloMin, saidaMin, trabalhados, previstos, saldo, Math.max(0, saldo), saldo < 0 ? 'Teste de débito para homologação' : null]
      );
    }

    await client.query(
      `INSERT INTO feriados (id, data, descricao, tipo)
       VALUES ($1, '2026-08-20', 'Feriado de Homologação', 'Empresa')
       ON CONFLICT (data) DO NOTHING`,
      [randomUUID()]
    );

    await client.query(
      `INSERT INTO ferias (id, colaborador_id, inicio, fim, dias, status)
       VALUES ($1, $2, '2026-08-24', '2026-08-25', 2, 'Programada')
       ON CONFLICT (id) DO NOTHING`,
      [randomUUID(), collaboratorId]
    );

    await client.query(
      `INSERT INTO folgas (id, colaborador_id, data, motivo, origem, status)
       VALUES ($1, $2, '2026-08-26', 'Folga compensatória de homologação', 'Banco de horas', 'Aprovada')
       ON CONFLICT (colaborador_id, data) DO NOTHING`,
      [randomUUID(), collaboratorId]
    );

    await client.query(
      `INSERT INTO atestados (id, colaborador_id, inicio, fim, motivo, status)
       VALUES ($1, $2, '2026-08-27', '2026-08-27', 'Atestado de homologação', 'Pendente')
       ON CONFLICT (id) DO NOTHING`,
      [randomUUID(), collaboratorId]
    );

    await client.query(
      `INSERT INTO ajustes (id, colaborador_id, data, minutos, motivo, usuario_id)
       VALUES ($1, $2, '2026-08-28', 15, 'Ajuste positivo de homologação', $3)
       ON CONFLICT (id) DO NOTHING`,
      [randomUUID(), collaboratorId, gestorId]
    );

    await client.query(
      `INSERT INTO configuracoes (chave, valor, atualizado_por)
       VALUES ('toleranciaMin', '15'::jsonb, $1)
       ON CONFLICT (chave) DO NOTHING`,
      [adminId]
    );

    await client.query('COMMIT');

    const counts = {};
    for (const table of ['usuarios', 'colaboradores', 'apontamentos', 'feriados', 'ferias', 'folgas', 'atestados', 'ajustes', 'configuracoes']) {
      const result = await query(`SELECT count(*)::int AS count FROM "${table}"`);
      counts[table] = result.rows[0].count;
    }

    console.log(JSON.stringify({ ok: true, seed: 'homologacao', counts }, null, 2));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
