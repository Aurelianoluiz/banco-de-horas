import { api } from './api-client.js';

const toLocal = (item = {}) => ({ ...item, id: item.id ?? item._id, cid: item.cid ?? item.colaboradorId, date: item.date ?? item.data, in: item.in ?? item.entrada, out: item.out ?? item.saida, brk: item.brk ?? item.intervalo, saldo: item.saldo });
const toApiApontamento = (item = {}) => ({ id: item.id, colaboradorId: item.colaboradorId ?? item.cid, data: item.data ?? item.date, entrada: item.entrada ?? item.in ?? null, saida: item.saida ?? item.out ?? null, intervalo: item.intervalo ?? item.brk ?? '00:00', ocorrencia: item.ocorrencia ?? 'Normal' });
const toLocalColaborador = (item = {}) => ({ ...item, id: item.id ?? item._id, seg: item.seg ?? item.jornada ?? '09:00', sex: item.sex ?? item.jornada ?? '08:00', tol: item.tol ?? item.tolerancia ?? '00:15', active: item.active ?? item.status === 'ativo' });
const toApiColaborador = (item = {}) => ({ id: item.id, nome: item.nome, salario: item.salario ?? null, jornada: item.jornada ?? item.seg ?? null, tolerancia: item.tolerancia ?? item.tol ?? '00:15', status: item.status ?? (item.active === false ? 'inativo' : 'ativo') });
const toLocalFerias = (item = {}) => ({ ...item, id: item.id ?? item._id });
const toLocalFolga = (item = {}) => ({ ...item, id: item.id ?? item._id });
const toLocalFeriado = (item = {}) => ({ ...item, id: item.id ?? item._id, nome: item.nome ?? item.descricao });
const toApiFerias = (item = {}) => ({ id: item.id, colaboradorId: item.colaboradorId ?? item.cid, inicio: item.inicio, fim: item.fim, dias: item.dias ?? 0, status: item.status ?? 'Programada' });
const toApiFolga = (item = {}) => ({ id: item.id, colaboradorId: item.colaboradorId ?? item.cid, data: item.data ?? item.date, motivo: item.motivo ?? '', origem: item.origem ?? 'Outro', status: item.status ?? 'Solicitada' });
const toApiFeriado = (item = {}) => ({ id: item.id, data: item.data ?? item.date, descricao: item.descricao ?? item.nome ?? '', tipo: item.tipo ?? 'Empresa' });

export const dataAdapter = {
  async loadColaboradores() { return (await api.list('colaboradores')).map(toLocalColaborador); },
  async loadApontamentos(params = {}) { const apiParams = { colaboradorId: params.colaboradorId ?? params.cid, inicio: params.inicio ?? params.dateFrom, fim: params.fim ?? params.dateTo }; const query = new URLSearchParams(Object.entries(apiParams).filter(([, value]) => value != null && value !== '')).toString(); return (await api.list(`apontamentos${query ? `?${query}` : ''}`)).map(toLocal); },
  async saveColaborador(payload, id = null) { const body = toApiColaborador({ ...payload, id: id ?? payload?.id }); return toLocalColaborador(id ? await api.update('colaboradores', id, body) : await api.create('colaboradores', body)); },
  async removeColaborador(id) { return api.remove('colaboradores', id); },
  async saveApontamento(payload, id = null) { const body = toApiApontamento({ ...payload, id: id ?? payload?.id }); return toLocal(id ? await api.update('apontamentos', id, body) : await api.create('apontamentos', body)); },
  async removeApontamento(id) { return api.remove('apontamentos', id); },
  async loadBancoHoras(colaboradorId, competencia) { return api.bancoHoras(colaboradorId, competencia); },
  async loadFerias(colaboradorId) { const query = colaboradorId ? `?colaboradorId=${encodeURIComponent(colaboradorId)}` : ''; return (await api.list(`ferias${query}`)).map(toLocalFerias); },
  async saveFerias(payload, id = null) { const body = toApiFerias({ ...payload, id: id ?? payload?.id }); return toLocalFerias(id ? await api.update('ferias', id, body) : await api.create('ferias', body)); },
  async removeFerias(id) { return api.remove('ferias', id); },
  async loadFolgas(colaboradorId) { const query = colaboradorId ? `?colaboradorId=${encodeURIComponent(colaboradorId)}` : ''; return (await api.list(`folgas${query}`)).map(toLocalFolga); },
  async saveFolga(payload, id = null) { const body = toApiFolga({ ...payload, id: id ?? payload?.id }); return toLocalFolga(id ? await api.update('folgas', id, body) : await api.create('folgas', body)); },
  async removeFolga(id) { return api.remove('folgas', id); },
  async loadFeriados() { return (await api.list('feriados')).map(toLocalFeriado); },
  async saveFeriado(payload, id = null) { const body = toApiFeriado({ ...payload, id: id ?? payload?.id }); return toLocalFeriado(id ? await api.update('feriados', id, body) : await api.create('feriados', body)); },
  async removeFeriado(id) { return api.remove('feriados', id); }
};

export { toLocal, toApiApontamento, toLocalColaborador, toApiColaborador, toLocalFerias, toLocalFolga, toLocalFeriado, toApiFerias, toApiFolga, toApiFeriado };
