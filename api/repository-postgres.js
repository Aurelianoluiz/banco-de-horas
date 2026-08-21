const TABLE_MAPPERS = {
  colaboradores: {
    toRow(record) {
      return {
        id: record.id,
        usuario_id: record.usuarioId ?? null,
        nome: record.nome,
        salario: record.salario ?? null,
        carga_seg_qui_min: record.cargaSegQuiMin ?? toMinutes(record.cargaSegQui ?? '09:00'),
        carga_sexta_min: record.cargaSextaMin ?? toMinutes(record.cargaSexta ?? '08:00'),
        tolerancia_min: record.toleranciaMin ?? toMinutes(record.tolerancia ?? '00:15'),
        ativo: record.ativo ?? record.status !== 'inativo'
      };
    },
    fromRow(row) {
      return {
        ...row,
        usuarioId: row.usuario_id,
        cargaSegQuiMin: row.carga_seg_qui_min,
        cargaSextaMin: row.carga_sexta_min,
        toleranciaMin: row.tolerancia_min,
        cargaSegQui: toTime(row.carga_seg_qui_min),
        cargaSexta: toTime(row.carga_sexta_min),
        tolerancia: toTime(row.tolerancia_min),
        status: row.ativo ? 'ativo' : 'inativo'
      };
    }
  },
  apontamentos: {
    toRow(record) {
      return {
        id: record.id,
        colaborador_id: record.colaboradorId,
        data: record.data,
        entrada_min: record.entradaMin ?? nullableMinutes(record.entrada),
        intervalo_min: record.intervaloMin ?? toMinutes(record.intervalo ?? '00:00'),
        saida_min: record.saidaMin ?? nullableMinutes(record.saida),
        ocorrencia: record.ocorrencia ?? 'Normal',
        minutos_trabalhados: record.minutosTrabalhados ?? record.trabalhado ?? 0,
        minutos_previstos: record.minutosPrevistos ?? record.previsto ?? 0,
        saldo_min: record.saldoMin ?? record.saldo ?? 0,
        extra_min: record.extraMin ?? record.extra ?? 0,
        noturno_min: record.noturnoMin ?? record.noturno ?? 0,
        observacao: record.observacao ?? null,
        aprovado: record.aprovado ?? false
      };
    },
    fromRow(row) {
      return {
        ...row,
        colaboradorId: row.colaborador_id,
        entrada: nullableTime(row.entrada_min),
        saida: nullableTime(row.saida_min),
        intervalo: toTime(row.intervalo_min),
        entradaMin: row.entrada_min,
        saidaMin: row.saida_min,
        intervaloMin: row.intervalo_min,
        minutosTrabalhados: row.minutos_trabalhados,
        minutosPrevistos: row.minutos_previstos,
        saldo: row.saldo_min,
        extra: row.extra_min,
        noturno: row.noturno_min
      };
    }
  },
  feriados: {
    toRow(record) { return { id: record.id, data: record.data, descricao: record.descricao, tipo: record.tipo ?? 'Empresa' }; },
    fromRow(row) { return { ...row, descricao: row.descricao }; }
  },
  ferias: {
    toRow(record) { return { id: record.id, colaborador_id: record.colaboradorId, inicio: record.inicio, fim: record.fim, dias: record.dias ?? 0, status: record.status ?? 'Programada' }; },
    fromRow(row) { return { ...row, colaboradorId: row.colaborador_id }; }
  },
  folgas: {
    toRow(record) { return { id: record.id, colaborador_id: record.colaboradorId, data: record.data, motivo: record.motivo, origem: record.origem ?? 'Outro', status: record.status ?? 'Solicitada' }; },
    fromRow(row) { return { ...row, colaboradorId: row.colaborador_id }; }
  },
  auditoria: {
    toRow(record) { return { id: record.id, usuario_id: record.usuarioId ?? null, entidade: record.entidade, registro_id: record.registroId ?? null, acao: record.acao, valor_anterior: record.antes ?? null, valor_novo: record.depois ?? null, sessao: record.sessaoId ?? null, criado_em: record.criadoEm }; },
    fromRow(row) { return { ...row, usuarioId: row.usuario_id, registroId: row.registro_id, antes: row.valor_anterior, depois: row.valor_novo, sessaoId: row.sessao, criadoEm: row.criado_em }; }
  },
  fechamentos: {
    toRow(record) { return { id: record.id, colaborador_id: record.colaboradorId, competencia: record.competencia, saldo_anterior_min: record.saldoAnterior ?? 0, creditos_min: record.creditos ?? 0, debitos_min: record.debitos ?? 0, saldo_final_min: record.saldoFinal ?? 0, fechado_por: record.fechadoPor, fechado_em: record.fechadoEm, }; },
    fromRow(row) { return { ...row, colaboradorId: row.colaborador_id, saldoAnterior: row.saldo_anterior_min, creditos: row.creditos_min, debitos: row.debitos_min, saldoFinal: row.saldo_final_min, fechadoPor: row.fechado_por, fechadoEm: row.fechado_em }; }
  }
};

const toMinutes = (value = '00:00') => {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value);
  const match = String(value).trim().match(/^(\d{1,3}):(\d{2})$/);
  if (!match) throw new TypeError(`Tempo inválido: ${value}`);
  return Number(match[1]) * 60 + Number(match[2]);
};
const nullableMinutes = (value) => value == null || value === '' ? null : toMinutes(value);
const toTime = (value = 0) => { const n = Math.max(0, Math.round(Number(value) || 0)); return `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`; };
const nullableTime = (value) => value == null ? null : toTime(value);
const safeIdentifier = (value) => { if (!/^[a-z_][a-z0-9_]*$/i.test(value)) throw new TypeError(`Identificador inválido: ${value}`); return `"${value}"`; };
const mapToRow = (table, record) => TABLE_MAPPERS[table]?.toRow ? TABLE_MAPPERS[table].toRow(record) : Object.fromEntries(Object.entries(record).map(([key, value]) => [key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`), value]));
const mapFromRow = (table, row) => TABLE_MAPPERS[table]?.fromRow ? TABLE_MAPPERS[table].fromRow(row) : Object.fromEntries(Object.entries(row).map(([key, value]) => [key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()), value]));

export class PostgresRepository {
  constructor(pool) { if (!pool?.query) throw new TypeError('pool PostgreSQL inválido'); this.pool = pool; }
  async query(text, values = []) { return this.pool.query(text, values); }
  async list(table, options = {}) { const { where = '', values = [] } = typeof options === 'string' ? { where: options } : options; const result = await this.query(`SELECT * FROM ${safeIdentifier(table)}${where ? ` WHERE ${where}` : ''}`, values); return result.rows.map((row) => mapFromRow(table, row)); }
  async get(table, id) { const result = await this.query(`SELECT * FROM ${safeIdentifier(table)} WHERE id = $1 LIMIT 1`, [id]); return result.rows[0] ? mapFromRow(table, result.rows[0]) : null; }
  async insert(table, record) { if (!record?.id) throw new TypeError('registro.id é obrigatório'); const row = mapToRow(table, record); const entries = Object.entries(row); const columns = entries.map(([key]) => safeIdentifier(key)).join(', '); const placeholders = entries.map((_, index) => `$${index + 1}`).join(', '); const values = entries.map(([, value]) => value); const result = await this.query(`INSERT INTO ${safeIdentifier(table)} (${columns}) VALUES (${placeholders}) RETURNING *`, values); return mapFromRow(table, result.rows[0]); }
  async update(table, id, changes) { const row = mapToRow(table, changes); const entries = Object.entries(row); if (!entries.length) return this.get(table, id); const assignments = entries.map(([key], index) => `${safeIdentifier(key)} = $${index + 2}`).join(', '); const values = entries.map(([, value]) => value); const result = await this.query(`UPDATE ${safeIdentifier(table)} SET ${assignments} WHERE id = $1 RETURNING *`, [id, ...values]); return result.rows[0] ? mapFromRow(table, result.rows[0]) : null; }
  async remove(table, id) { const result = await this.query(`DELETE FROM ${safeIdentifier(table)} WHERE id = $1`, [id]); return result.rowCount > 0; }
}
