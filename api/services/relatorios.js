const month = (value) => {
  if (!/^\d{4}-\d{2}$/.test(String(value || ''))) throw new TypeError('Competência inválida');
  return value;
};
const monthBounds = (competencia) => {
  const [year, monthNumber] = competencia.split('-').map(Number);
  const next = new Date(Date.UTC(year, monthNumber, 1));
  return { inicio: `${competencia}-01`, fim: next.toISOString().slice(0, 10) };
};
const normalizeRows = (value) => Array.isArray(value) ? value : [];
const minutesFromInterval = (value) => {
  if (value == null) return 0;
  if (typeof value === 'number') return Math.round(value);
  const text = String(value);
  const match = text.match(/^(-?)(\d+):([0-5]\d)(?::\d{2}(?:\.\d+)?)?$/);
  if (!match) return 0;
  return (match[1] === '-' ? -1 : 1) * (Number(match[2]) * 60 + Number(match[3]));
};

export class RelatoriosService {
  constructor(repository) { this.repository = repository; }

  async espelhoPonto({ colaboradorId, competencia }) {
    const referencia = month(competencia);
    const { inicio, fim } = monthBounds(referencia);
    const raw = typeof this.repository.listApontamentosByRange === 'function'
      ? await this.repository.listApontamentosByRange({ inicio, fim, colaboradorId })
      : await this.repository.list('apontamentos', { colaboradorId, limit: 500 });
    const apontamentos = normalizeRows(raw).filter((item) => String(item.data || '').startsWith(referencia) && (!colaboradorId || item.colaboradorId === colaboradorId));
    return apontamentos.map((item) => ({
      id: item.id,
      colaboradorId: item.colaboradorId,
      data: item.data,
      entrada: item.entrada,
      saida: item.saida,
      intervalo: item.intervalo,
      ocorrencia: item.ocorrencia,
      horasTrabalhadas: minutesFromInterval(item.horasTrabalhadas ?? item.minutosTrabalhados),
      horasPrevistas: minutesFromInterval(item.horasPrevistas ?? item.minutosPrevistos),
      saldo: minutesFromInterval(item.saldo)
    }));
  }

  async bancoHoras({ colaboradorId, competencia }) {
    const referencia = month(competencia);
    const apontamentos = await this.espelhoPonto({ colaboradorId, competencia: referencia });
    const creditos = apontamentos.reduce((sum, item) => sum + Math.max(0, item.saldo), 0);
    const debitos = apontamentos.reduce((sum, item) => sum + Math.max(0, -item.saldo), 0);
    const horasTrabalhadas = apontamentos.reduce((sum, item) => sum + item.horasTrabalhadas, 0);
    const horasPrevistas = apontamentos.reduce((sum, item) => sum + item.horasPrevistas, 0);
    return { competencia: referencia, colaboradorId: colaboradorId || null, quantidade: apontamentos.length, horasTrabalhadas, horasPrevistas, creditos, debitos, saldo: creditos - debitos };
  }

  async ferias({ colaboradorId } = {}) {
    return normalizeRows(await this.repository.list('ferias', { colaboradorId, limit: 500 })).filter((item) => !colaboradorId || item.colaboradorId === colaboradorId);
  }

  async folgas({ colaboradorId } = {}) {
    return normalizeRows(await this.repository.list('folgas', { colaboradorId, limit: 500 })).filter((item) => !colaboradorId || item.colaboradorId === colaboradorId);
  }

  async fechamento({ colaboradorId, competencia }) {
    const referencia = month(competencia);
    return normalizeRows(await this.repository.list('fechamentos', { colaboradorId, competencia: referencia, limit: 500 })).filter((item) => item.competencia === referencia && (!colaboradorId || item.colaboradorId === colaboradorId));
  }

  async atrasos({ colaboradorId, competencia }) {
    const rows = await this.espelhoPonto({ colaboradorId, competencia });
    return rows.filter((item) => item.saldo < 0 && item.ocorrencia === 'Normal');
  }
}
