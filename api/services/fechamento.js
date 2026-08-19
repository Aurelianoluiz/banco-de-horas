import { closeMonth, monthlySummary } from '../../rules/fechamento.js';

const makeId = () => `fec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export class FechamentoService {
  constructor(repository, auditoria = null) {
    this.repository = repository;
    this.auditoria = auditoria;
  }

  resumo(colaboradorId, competencia) {
    const points = this.repository.list('apontamentos');
    return monthlySummary(points, colaboradorId, competencia);
  }

  fechar({ colaboradorId, competencia, saldoAnterior = 0, usuarioId = null }) {
    const existente = this.repository.list('fechamentos', (item) => item.colaboradorId === colaboradorId && item.competencia === competencia)[0];
    if (existente) throw new Error(`Competência já fechada: ${competencia}`);

    const points = this.repository.list('apontamentos');
    const fechamento = closeMonth({ points, colaboradorId, competencia, saldoAnterior });
    const salvo = this.repository.insert('fechamentos', { id: makeId(), status: 'fechado', ...fechamento });

    if (this.auditoria) {
      this.auditoria.registrar({
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

  listar() {
    return this.repository.list('fechamentos');
  }
}
