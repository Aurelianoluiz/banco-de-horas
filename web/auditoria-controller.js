import { api } from './api-client.js';

const state = { loading: false, error: null, rows: [] };

export const auditoriaController = {
  getState() { return { ...state, rows: [...state.rows] }; },
  async load(filters = {}) {
    state.loading = true; state.error = null;
    try {
      const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value != null && value !== '')).toString();
      state.rows = await api.list(`auditoria${query ? `?${query}` : ''}`);
      return this.getState();
    } catch (error) { state.error = error; throw error; }
    finally { state.loading = false; }
  }
};
