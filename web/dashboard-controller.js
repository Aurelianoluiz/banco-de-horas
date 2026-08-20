import { dataAdapter } from './data-adapter.js';

const state = {
  loading: false,
  error: null,
  colaboradores: [],
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

export const dashboardController = {
  getState() {
    return {
      ...state,
      colaboradores: [...state.colaboradores],
      cards: { ...state.cards }
    };
  },

  async load({ competencia, colaboradorId } = {}) {
    state.loading = true;
    state.error = null;
    try {
      state.colaboradores = await dataAdapter.loadColaboradores();
      const ids = colaboradorId ? [colaboradorId] : state.colaboradores.map((item) => item.id);
      const balances = await Promise.all(ids.map((id) => dataAdapter.loadBancoHoras(id, competencia)));
      const rows = balances.flatMap((item) => Array.isArray(item) ? item : (item?.rows || [item]));
      const saldoAtual = sum(rows, 'saldoAtual');
      const creditos = sum(rows, 'creditos');
      const debitos = sum(rows, 'debitos');
      const horasTrabalhadas = sum(rows, 'horasTrabalhadas');
      state.cards = {
        saldoAtual,
        horasPositivas: Math.max(creditos, 0),
        horasNegativas: Math.abs(Math.min(debitos, 0)),
        horasTrabalhadas
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
