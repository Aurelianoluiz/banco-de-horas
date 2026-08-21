import { closeMonth } from '../../rules/fechamento.js';

export class BancoHorasService {
  constructor(repository) {
    this.repository = repository;
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
    return closeMonth({ points, collaboratorId: colaboradorId, competencia, saldoAnterior });
  }
}
