import { randomUUID } from 'node:crypto';
import { calculatePoint } from '../../rules/jornada.js';

const makeId = () => randomUUID();

export class ApontamentosService {
  constructor(repository, config, auditoria = null, actor = () => null) {
    this.repository = repository;
    this.config = config;
    this.auditoria = auditoria;
    this.actor = actor;
  }

  async registrar(evento) {
    if (this.auditoria) return this.auditoria.registrar({ usuarioId: this.actor(), ...evento });
    return null;
  }

  async obterColaborador(id) {
    if (!id) return {};
    return (await this.repository.get('colaboradores', id)) || {};
  }

  async listar(filtro = {}) {
    const limit = filtro.limit === undefined ? undefined : Number(filtro.limit);
    const offset = filtro.offset === undefined ? undefined : Number(filtro.offset);
    const hasRange = filtro.inicio || filtro.fim;
    if (hasRange) {
      if (!filtro.inicio || !filtro.fim) throw new TypeError('inicio e fim são obrigatórios para filtro por período');
      if (typeof this.repository.listApontamentosByRange === 'function') {
        const records = await this.repository.listApontamentosByRange({ inicio: filtro.inicio, fim: String(filtro.fim).slice(0, 10) + 'Z', colaboradorId: filtro.colaboradorId, limit, offset });
        return records;
      }
    }
    return this.repository.list('apontamentos', {
      ...(filtro.colaboradorId ? { colaborador_id: filtro.colaboradorId } : {}),
      ...(Number.isFinite(limit) ? { limit } : {}),
      ...(Number.isFinite(offset) ? { offset } : {})
    });
  }

  async obter(id) {
    return this.repository.get('apontamentos', id);
  }

  async criar(input) {
    if (!input?.colaboradorId) throw new TypeError('colaboradorId é obrigatório');
    if (!input?.data) throw new TypeError('data é obrigatória');
    const colaborador = await this.obterColaborador(input.colaboradorId);
    const result = calculatePoint(input, this.config, colaborador);
    const item = await this.repository.insert('apontamentos', {
      id: input.id || makeId(),
      colaboradorId: input.colaboradorId,
      data: input.data,
      entrada: input.entrada || null,
      saida: input.saida || null,
      intervalo: input.intervalo || '00:00',
      ocorrencia: input.ocorrencia || 'Normal',
      ...result
    });
    await this.registrar({ acao: 'CRIAR', entidade: 'apontamentos', registroId: item.id, depois: item });
    return item;
  }

  async atualizar(id, changes) {
    const current = await this.obter(id);
    if (!current) return null;
    const merged = { ...current, ...changes };
    const colaborador = await this.obterColaborador(merged.colaboradorId);
    const result = calculatePoint(merged, this.config, colaborador);
    const depois = await this.repository.update('apontamentos', id, { ...changes, ...result });
    await this.registrar({ acao: 'ALTERAR', entidade: 'apontamentos', registroId: id, antes: current, depois });
    return depois;
  }

  async excluir(id) {
    const antes = await this.obter(id);
    if (!antes) return false;
    const removido = await this.repository.remove('apontamentos', id);
    if (removido) await this.registrar({ acao: 'EXCLUIR', entidade: 'apontamentos', registroId: id, antes });
    return removido;
  }
}
