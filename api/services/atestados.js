import { randomUUID } from 'node:crypto';

const STATUS = new Set(['Pendente', 'Aprovado', 'Rejeitado', 'Cancelado']);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export class AtestadosService {
  constructor(repository) { this.repository = repository; }
  async listar(filters = {}) { return this.repository.list('atestados', filters); }
  async obter(id) { return this.repository.findById('atestados', id); }
  async criar(input = {}) {
    const payload = { ...input, id: input.id || randomUUID() };
    if (!payload.colaboradorId || !payload.inicio || !payload.fim) throw new TypeError('Colaborador e período obrigatórios.');
    if (!DATE_RE.test(String(payload.inicio)) || !DATE_RE.test(String(payload.fim))) throw new TypeError('Período de atestado inválido.');
    if (!STATUS.has(payload.status || 'Pendente')) throw new TypeError('Status de atestado inválido.');
    if (payload.fim < payload.inicio) throw new TypeError('Período de atestado inválido.');
    payload.status ||= 'Pendente';
    return this.repository.insert('atestados', payload);
  }
  async atualizar(id, patch = {}) {
    const current = await this.repository.findById('atestados', id);
    if (!current) return null;
    const merged = { ...current, ...patch };
    if (!DATE_RE.test(String(merged.inicio)) || !DATE_RE.test(String(merged.fim)) || merged.fim < merged.inicio) throw new TypeError('Período de atestado inválido.');
    if (merged.status && !STATUS.has(merged.status)) throw new TypeError('Status de atestado inválido.');
    return this.repository.update('atestados', id, patch);
  }
  async excluir(id) { return this.repository.delete('atestados', id); }
}
