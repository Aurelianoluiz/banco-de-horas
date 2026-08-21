// Consolidação mensal do banco de horas.

export function monthlySummary(points, collaboratorId, competencia) {
  return points
    .filter(point => point.colaboradorId === collaboratorId && point.data.startsWith(competencia))
    .reduce((summary, point) => {
      const saldo = Number(point.saldo || 0);
      return {
        creditos: summary.creditos + Math.max(0, saldo),
        debitos: summary.debitos + Math.max(0, -saldo),
      };
    }, { creditos: 0, debitos: 0 });
}

export function closeMonth({ points = [], collaboratorId, competencia, saldoAnterior = 0, fechadoEm = new Date().toISOString() }) {
  if (!collaboratorId) throw new Error('Colaborador obrigatório.');
  if (!/^\d{4}-\d{2}$/.test(competencia)) throw new Error(`Competência inválida: ${competencia}`);

  const summary = monthlySummary(points, collaboratorId, competencia);
  const saldoFinal = saldoAnterior + summary.creditos - summary.debitos;

  return {
    colaboradorId: collaboratorId,
    competencia,
    saldoAnterior,
    creditos: summary.creditos,
    debitos: summary.debitos,
    saldoFinal,
    fechadoEm,
  };
}
