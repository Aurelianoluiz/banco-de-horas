import { dataAdapter } from './data-adapter.js';

const state = {
  loading: false,
  error: null,
  colaboradores: [],
  apontamentos: [],
  cards: {
    saldoAtual: 0,
    horasPositivas: 0,
    horasNegativas: 0,
    horasTrabalhadas: 0
  }
};

const minutesOf = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const text = String(value ?? '').trim();
  const sign = text.startsWith('-') ? -1 : 1;
  const clean = text.replace(/^[+-]/, '');
  const match = clean.match(/^(\d+):([0-5]\d)$/);
  return match ? sign * (Number(match[1]) * 60 + Number(match[2])) : 0;
};

const sum = (rows, field) => rows.reduce((total, row) => total + minutesOf(row?.[field]), 0);

const normalizeBalance = (item) => ({
  saldoAtual: Number(item?.saldoFinal ?? item?.saldoAtual ?? 0),
  creditos: Number(item?.creditos ?? 0),
  debitos: Number(item?.debitos ?? 0)
});

export const dashboardController = {
  getState() {
    return {
      ...state,
      colaboradores: [...state.colaboradores],
      apontamentos: [...state.apontamentos],
      cards: { ...state.cards }
    };
  },

  async load({ competencia, colaboradorId } = {}) {
    state.loading = true;
    state.error = null;
    try {
      state.colaboradores = await dataAdapter.loadColaboradores();
      state.apontamentos = await dataAdapter.loadApontamentos({ colaboradorId, dateFrom: competencia ? `${competencia}-01` : undefined, dateTo: competencia ? `${competencia}-31` : undefined });

      const ids = colaboradorId ? [colaboradorId] : state.colaboradores.filter((item) => item.active !== false).map((item) => item.id);
      const balances = await Promise.all(ids.map((id) => dataAdapter.loadBancoHoras(id, competencia)));
      const normalized = balances.map(normalizeBalance);

      const saldoAtual = normalized.reduce((total, item) => total + item.saldoAtual, 0);
      const creditos = normalized.reduce((total, item) => total + Math.max(0, item.creditos), 0);
      const debitos = normalized.reduce((total, item) => total + Math.max(0, item.debitos), 0);

      state.cards = {
        saldoAtual,
        horasPositivas: creditos,
        horasNegativas: debitos,
        horasTrabalhadas: sum(state.apontamentos, 'minutosTrabalhados') || sum(state.apontamentos, 'horasTrabalhadas')
      };
      return this.getState();
    } catch (error) {
      state.error = error;
      throw error;
    } finally {
      state.loading = false;
    }
  }
};

if (typeof window !== 'undefined') window.BancoHorasDashboard = dashboardController;
