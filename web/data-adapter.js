import { api } from './api-client.js';

const toLocal = (item = {}) => ({
  ...item,
  id: item.id ?? item._id,
  cid: item.cid ?? item.colaboradorId,
  date: item.date ?? item.data,
  in: item.in ?? item.entrada,
  out: item.out ?? item.saida,
  brk: item.brk ?? item.intervalo,
  saldo: item.saldo
});

const toApiApontamento = (item = {}) => ({
  id: item.id,
  colaboradorId: item.colaboradorId ?? item.cid,
  data: item.data ?? item.date,
  entrada: item.entrada ?? item.in ?? null,
  saida: item.saida ?? item.out ?? null,
  intervalo: item.intervalo ?? item.brk ?? '00:00',
  ocorrencia: item.ocorrencia ?? 'Normal'
});

const toLocalColaborador = (item = {}) => ({
  ...item,
  id: item.id ?? item._id,
  seg: item.seg ?? item.jornada ?? '09:00',
  sex: item.sex ?? item.jornada ?? '08:00',
  tol: item.tol ?? item.tolerancia ?? '00:15',
  active: item.active ?? item.status === 'ativo'
});

const toApiColaborador = (item = {}) => ({
  id: item.id,
  nome: item.nome,
  salario: item.salario ?? null,
  jornada: item.jornada ?? item.seg ?? null,
  tolerancia: item.tolerancia ?? item.tol ?? '00:15',
  status: item.status ?? (item.active === false ? 'inativo' : 'ativo')
});

export const dataAdapter = {
  async loadColaboradores() {
    const rows = await api.list('colaboradores');
    return rows.map(toLocalColaborador);
  },

  async loadApontamentos(params = {}) {
    const apiParams = {
      colaboradorId: params.colaboradorId ?? params.cid,
      inicio: params.inicio ?? params.dateFrom,
      fim: params.fim ?? params.dateTo
    };
    const query = new URLSearchParams(Object.entries(apiParams).filter(([, value]) => value != null && value !== '')).toString();
    const rows = await api.list(`apontamentos${query ? `?${query}` : ''}`);
    return rows.map(toLocal);
  },

  async saveColaborador(payload, id = null) {
    const body = toApiColaborador({ ...payload, id: id ?? payload?.id });
    const result = id ? await api.update('colaboradores', id, body) : await api.create('colaboradores', body);
    return toLocalColaborador(result);
  },

  async removeColaborador(id) {
    return api.remove('colaboradores', id);
  },

  async saveApontamento(payload, id = null) {
    const body = toApiApontamento({ ...payload, id: id ?? payload?.id });
    const result = id ? await api.update('apontamentos', id, body) : await api.create('apontamentos', body);
    return toLocal(result);
  },

  async removeApontamento(id) {
    return api.remove('apontamentos', id);
  },

  async loadBancoHoras(colaboradorId, competencia) {
    return api.bancoHoras(colaboradorId, competencia);
  }
};

export { toLocal, toApiApontamento, toLocalColaborador, toApiColaborador };
