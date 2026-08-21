import { api } from './api-client.js';

const state = { loading: false, error: null, resumo: null, fechamentos: [] };

export const fechamentoController = {
  getState() { return { ...state, resumo: state.resumo ? { ...state.resumo } : null, fechamentos: [...state.fechamentos] }; },
  async carregarResumo(colaboradorId, competencia) {
    state.loading = true; state.error = null;
    try {
      state.resumo = await api.relatorio('fechamento', { colaboradorId, competencia });
      return this.getState();
    } catch (error) { state.error = error; throw error; }
    finally { state.loading = false; }
  },
  async fechar(colaboradorId, competencia, saldoAnterior = 0) {
    state.loading = true; state.error = null;
    try {
      const result = await api.fechar(competencia, colaboradorId, saldoAnterior);
      state.fechamentos = [result, ...state.fechamentos.filter((item) => item.id !== result.id)];
      state.resumo = result;
      return result;
    } catch (error) { state.error = error; throw error; }
    finally { state.loading = false; }
  }
};
