import { api } from './api-client.js';

const state = { loading: false, error: null, tipo: null, rows: [], resumo: null };

export const relatoriosController = {
  getState() { return { ...state, rows: [...state.rows], resumo: state.resumo ? { ...state.resumo } : null }; },
  async load(tipo, params = {}) {
    state.loading = true; state.error = null; state.tipo = tipo;
    try {
      const data = await api.relatorio(tipo, params);
      if (Array.isArray(data)) { state.rows = data; state.resumo = null; }
      else { state.rows = data?.rows || []; state.resumo = data || null; }
      return this.getState();
    } catch (error) { state.error = error; throw error; }
    finally { state.loading = false; }
  }
};

if (typeof window !== 'undefined') window.BancoHorasRelatorios = relatoriosController;
