import { calculatePoint } from '../../rules/jornada.js';

const makeId = () => `apt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

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

  async listar(filtro = {}) {
    const records = await this.repository.list('apontamentos');
    return records.filter((item) => {
      if (filtro.colaboradorId && item.colaboradorId !== filtro.colaboradorId) return false;
      if (filtro.inicio && item.data < filtro.inicio) return false;
      if (filtro.fim && item.data > filtro.fim) return false;
      return true;
    });
  }

  async obter(id) {
    return this.repository.get('apontamentos', id);
  }

  async criar(input) {
    const result = calculatePoint(input, this.config);
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
    const result = calculatePoint(merged, this.config);
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
