import { randomUUID } from 'node:crypto';
import { closeMonth, monthlySummary } from '../../rules/fechamento.js';

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
    const fechamentos = await this.repository.list('fechamentos');
    const existente = fechamentos.find((item) => item.colaboradorId === colaboradorId && item.competencia === competencia);
    if (existente) throw new Error(`Competência já fechada: ${competencia}`);

    const points = await this.repository.list('apontamentos');
    const fechamento = closeMonth({ points, collaboratorId: colaboradorId, competencia, saldoAnterior });
    const salvo = await this.repository.insert('fechamentos', {
      id: randomUUID(),
      ...fechamento,
      fechadoPor: usuarioId
    });

    if (this.auditoria) {
      await this.auditoria.registrar({
        usuarioId,
        acao: 'FECHAR_COMPETENCIA',
        entidade: 'fechamentos',
        registroId: salvo.id,
        antes: null,
        depois: salvo
      });
    }
    return salvo;
  }

  async listar() {
    return this.repository.list('fechamentos');
  }
}
