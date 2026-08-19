export class BancoHorasService {
  constructor(repository, fechamento) {
    this.repository = repository;
    this.fechamento = fechamento;
  }

  listar(colaboradorId, competencia) {
    return this.repository.list('apontamentos', (item) => {
      if (colaboradorId && item.colaboradorId !== colaboradorId) return false;
      if (competencia && !item.data?.startsWith(competencia)) return false;
      return true;
    });
  }

  resumo(colaboradorId, competencia, saldoAnterior = 0) {
    const points = this.listar(colaboradorId, competencia);
    return this.fechamento({ points, collaboratorId: colaboradorId, competencia, saldoAnterior });
  }
}
