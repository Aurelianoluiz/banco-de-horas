import { randomUUID } from 'node:crypto';
import { closeMonth, monthlySummary } from '../../rules/fechamento.js';
import { AuditoriaService } from './auditoria.js';
import { withTransaction } from '../repository-transaction.js';

export class FechamentoService {
  constructor(repository, auditoria = null) {
    this.repository = repository;
    this.auditoria = auditoria;
  }

  async resumo(colaboradorId, competencia) {
    const points = await this.repository.list('apontamentos');
    return monthlySummary(points, colaboradorId, competencia);
  }

  async fechar({ colaboradorId, competencia, saldoAnterior = 0, usuarioId = null }) {
    try {
      return await withTransaction(this.repository, async (repository) => {
        const existente = await repository.findOne('fechamentos', { colaboradorId, competencia });
        if (existente) throw Object.assign(new Error(`Competência já fechada: ${competencia}`), { code: 'MONTH_ALREADY_CLOSED' });

        const points = await repository.list('apontamentos', { limit: 500 });
        const fechamento = closeMonth({ points, collaboratorId: colaboradorId, competencia, saldoAnterior });
        const salvo = await repository.insert('fechamentos', {
          id: randomUUID(),
          ...fechamento,
          fechadoPor: usuarioId
        });

        if (this.auditoria) {
          const auditoria = repository === this.repository ? this.auditoria : new AuditoriaService(repository);
          await auditoria.registrar({
            usuarioId,
            acao: 'FECHAR_COMPETENCIA',
            entidade: 'fechamentos',
            registroId: salvo.id,
            antes: null,
            depois: salvo
          });
        }
        return salvo;
      });
    } catch (error) {
      if (error?.code === '23505') throw Object.assign(new Error(`Competência já fechada: ${competencia}`), { code: 'MONTH_ALREADY_CLOSED' });
      throw error;
    }
  }

  async listar() {
    return this.repository.list('fechamentos');
  }
}
