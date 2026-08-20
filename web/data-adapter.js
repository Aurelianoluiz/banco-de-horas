import { api } from './api-client.js';

const toLocal = (item) => ({
  ...item,
  id: item.id ?? item._id
});

export const dataAdapter = {
  async loadColaboradores() {
    const rows = await api.list('colaboradores');
    return rows.map(toLocal);
  },

  async loadApontamentos(params = {}) {
    const query = new URLSearchParams(params).toString();
    const rows = await api.list(`apontamentos${query ? `?${query}` : ''}`);
    return rows.map(toLocal);
  },

  async saveColaborador(payload, id = null) {
    return id ? api.update('colaboradores', id, payload) : api.create('colaboradores', payload);
  },

  async removeColaborador(id) {
    return api.remove('colaboradores', id);
  },

  async saveApontamento(payload, id = null) {
    return id ? api.update('apontamentos', id, payload) : api.create('apontamentos', payload);
  },

  async removeApontamento(id) {
    return api.remove('apontamentos', id);
  },

  async loadBancoHoras(colaboradorId, competencia) {
    return api.bancoHoras(colaboradorId, competencia);
  }
};
