import { calculatePoint } from '../../rules/jornada.js';

const makeId = () => `apt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export class ApontamentosService {
  constructor(repository, config) {
    this.repository = repository;
    this.config = config;
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
    return this.repository.insert('apontamentos', {
      id: input.id || makeId(),
      colaboradorId: input.colaboradorId,
      data: input.data,
      entrada: input.entrada || null,
      saida: input.saida || null,
      intervalo: input.intervalo || '00:00',
      ocorrencia: input.ocorrencia || 'Normal',
      ...result
    });
  }

  atualizar(id, changes) {
    const current = this.obter(id);
    if (!current) return null;
    const merged = { ...current, ...changes };
    const result = calculatePoint(merged, this.config);
    return this.repository.update('apontamentos', id, { ...changes, ...result });
  }

  excluir(id) {
    return this.repository.remove('apontamentos', id);
  }
}
