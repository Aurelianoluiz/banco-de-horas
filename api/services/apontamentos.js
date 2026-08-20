import { calculatePoint } from '../../rules/jornada.js';

const makeId = () => `apt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export class ApontamentosService {
  constructor(repository, config, auditoria = null, actor = () => null) {
    this.repository = repository;
    this.config = config;
    this.auditoria = auditoria;
    this.actor = actor;
  }

  registrar(evento) {
    if (this.auditoria) this.auditoria.registrar({ usuarioId: this.actor(), ...evento });
  }

  listar(filtro = {}) {
    return this.repository.list('apontamentos', (item) => {
      if (filtro.colaboradorId && item.colaboradorId !== filtro.colaboradorId) return false;
      if (filtro.inicio && item.data < filtro.inicio) return false;
      if (filtro.fim && item.data > filtro.fim) return false;
      return true;
    });
  }

  obter(id) {
    return this.repository.get('apontamentos', id);
  }

  criar(input) {
    const result = calculatePoint(input, this.config);
    const item = this.repository.insert('apontamentos', {
      id: input.id || makeId(),
      colaboradorId: input.colaboradorId,
      data: input.data,
      entrada: input.entrada || null,
      saida: input.saida || null,
      intervalo: input.intervalo || '00:00',
      ocorrencia: input.ocorrencia || 'Normal',
      ...result
    });
    this.registrar({ acao: 'CRIAR', entidade: 'apontamentos', registroId: item.id, depois: item });
    return item;
  }

  atualizar(id, changes) {
    const current = this.obter(id);
    if (!current) return null;
    const merged = { ...current, ...changes };
    const result = calculatePoint(merged, this.config);
    const depois = this.repository.update('apontamentos', id, { ...changes, ...result });
    this.registrar({ acao: 'ALTERAR', entidade: 'apontamentos', registroId: id, antes: current, depois });
    return depois;
  }

  excluir(id) {
    const antes = this.obter(id);
    if (!antes) return false;
    const removido = this.repository.remove('apontamentos', id);
    if (removido) this.registrar({ acao: 'EXCLUIR', entidade: 'apontamentos', registroId: id, antes });
    return removido;
  }
}
