import { dataAdapter } from './data-adapter.js';

const state = { loading: false, error: null, colaboradores: [], rows: [] };

export const bancoHorasController = {
  getState() { return { ...state, colaboradores: [...state.colaboradores], rows: [...state.rows] }; },
  async load({ competencia, colaboradorId } = {}) {
    state.loading = true; state.error = null;
    try {
      state.colaboradores = await dataAdapter.loadColaboradores();
      const ids = colaboradorId ? [colaboradorId] : state.colaboradores.filter((item) => item.active !== false).map((item) => item.id);
      state.rows = await Promise.all(ids.map(async (id) => {
        const resumo = await dataAdapter.loadBancoHoras(id, competencia);
        const colaborador = state.colaboradores.find((item) => item.id === id);
        return { ...resumo, colaboradorId: id, colaboradorNome: colaborador?.nome || '—' };
      }));
      return this.getState();
    } catch (error) { state.error = error; throw error; }
    finally { state.loading = false; }
  }
};
if (typeof window !== 'undefined') window.BancoHorasController = bancoHorasController;
