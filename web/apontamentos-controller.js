import { dataAdapter } from './data-adapter.js';

const state = {
  rows: [],
  loading: false,
  error: null
};

export const apontamentosController = {
  getState() {
    return { ...state, rows: [...state.rows] };
  },

  async load(params = {}) {
    state.loading = true;
    state.error = null;
    try {
      state.rows = await dataAdapter.loadApontamentos(params);
      return this.getState();
    } catch (error) {
      state.error = error;
      throw error;
    } finally {
      state.loading = false;
    }
  },

  async save(payload, id = null) {
    state.error = null;
    try {
      const saved = await dataAdapter.saveApontamento(payload, id);
      const index = state.rows.findIndex((row) => row.id === saved.id);
      if (index >= 0) state.rows[index] = saved;
      else state.rows.unshift(saved);
      return saved;
    } catch (error) {
      state.error = error;
      throw error;
    }
  },

  async remove(id) {
    state.error = null;
    try {
      await dataAdapter.removeApontamento(id);
      state.rows = state.rows.filter((row) => row.id !== id);
    } catch (error) {
      state.error = error;
      throw error;
    }
  }
};
