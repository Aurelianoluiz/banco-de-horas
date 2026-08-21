import { dataAdapter } from './data-adapter.js';

const state = { loading: false, error: null, ferias: [], folgas: [], feriados: [] };

const loadCollection = async (loader) => {
  const value = await loader();
  return Array.isArray(value) ? value : (value?.rows || []);
};

export const absenceController = {
  getState() { return { ...state, ferias: [...state.ferias], folgas: [...state.folgas], feriados: [...state.feriados] }; },
  async load({ colaboradorId } = {}) {
    state.loading = true; state.error = null;
    try {
      state.ferias = await loadCollection(() => dataAdapter.loadFerias?.(colaboradorId));
      state.folgas = await loadCollection(() => dataAdapter.loadFolgas?.(colaboradorId));
      state.feriados = await loadCollection(() => dataAdapter.loadFeriados?.());
      return this.getState();
    } catch (error) { state.error = error; throw error; }
    finally { state.loading = false; }
  }
};

if (typeof window !== 'undefined') window.BancoHorasAbsences = absenceController;
