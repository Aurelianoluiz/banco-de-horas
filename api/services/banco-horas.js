export class BancoHorasService {
  constructor(repository, fechamento) {
    this.repository = repository;
    this.fechamento = fechamento;
  }

  async listar(colaboradorId, competencia) {
    const points = await this.repository.list('apontamentos');
    return points.filter((item) => {
      if (colaboradorId && item.colaboradorId !== colaboradorId) return false;
      if (competencia && !item.data?.startsWith(competencia)) return false;
      return true;
    });
  }

  async resumo(colaboradorId, competencia, saldoAnterior = 0) {
    const points = await this.listar(colaboradorId, competencia);
    return this.fechamento({ points, collaboratorId: colaboradorId, competencia, saldoAnterior });
  }
}
