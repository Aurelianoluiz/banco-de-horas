import { randomUUID } from 'node:crypto';

const STATUS = new Set(['Pendente', 'Aprovado', 'Rejeitado', 'Cancelado']);

export class AtestadosService {
  constructor(repository) { this.repository = repository; }
  async listar(filters = {}) { return this.repository.list('atestados', filters); }
  async obter(id) { return this.repository.findById('atestados', id); }
  async criar(input = {}) {
    const payload = { ...input, id: input.id || randomUUID() };
    if (!payload.colaboradorId || !payload.inicio || !payload.fim) throw new TypeError('Colaborador e período obrigatórios.');
    if (!STATUS.has(payload.status || 'Pendente')) throw new TypeError('Status de atestado inválido.');
    if (payload.fim < payload.inicio) throw new TypeError('Período de atestado inválido.');
    payload.status ||= 'Pendente';
    return this.repository.insert('atestados', payload);
  }
  async atualizar(id, patch = {}) {
    if (patch.status && !STATUS.has(patch.status)) throw new TypeError('Status de atestado inválido.');
    return this.repository.update('atestados', id, patch);
  }
  async excluir(id) { return this.repository.delete('atestados', id); }
}
