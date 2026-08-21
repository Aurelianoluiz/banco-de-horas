import { apontamentosController } from './apontamentos-controller.js';
import { dataAdapter } from './data-adapter.js';

const bridge = {
  async loadApontamentos(params = {}) {
    return apontamentosController.load(params);
  },
  async saveApontamento(payload, id = null) {
    return apontamentosController.save(payload, id);
  },
  async removeApontamento(id) {
    return apontamentosController.remove(id);
  },
  async loadColaboradores() {
    return dataAdapter.loadColaboradores();
  },
  async saveColaborador(payload, id = null) {
    return dataAdapter.saveColaborador(payload, id);
  },
  async removeColaborador(id) {
    return dataAdapter.removeColaborador(id);
  },
  async loadBancoHoras(colaboradorId, competencia) {
    return dataAdapter.loadBancoHoras(colaboradorId, competencia);
  }
};

if (typeof window !== 'undefined') window.BancoHorasAPI = Object.freeze(bridge);

export { bridge as uiApiBridge };
