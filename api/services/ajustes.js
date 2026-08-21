import { randomUUID } from 'node:crypto';

export class AjustesService {
  constructor(repository, auditoria = null) { this.repository = repository; this.auditoria = auditoria; }
  async listar(filters = {}) { return this.repository.list('ajustes', filters); }
  async obter(id) { return this.repository.findById('ajustes', id); }
  async criar(input = {}, usuarioId) {
    if (!input.colaboradorId || !input.data || input.minutos === undefined || !input.motivo) throw new TypeError('Colaborador, data, minutos e motivo são obrigatórios.');
    const item = { ...input, id: input.id || randomUUID(), usuarioId: usuarioId || input.usuarioId };
    if (!item.usuarioId) throw new TypeError('Usuário obrigatório para ajuste.');
    const created = await this.repository.insert('ajustes', item);
    if (this.auditoria) await this.auditoria.registrar({ usuarioId: item.usuarioId, entidade: 'ajustes', registroId: item.id, acao: 'CREATE', valorNovo: created });
    return created;
  }
  async excluir(id, usuarioId) {
    const previous = await this.repository.findById('ajustes', id);
    const removed = await this.repository.delete('ajustes', id);
    if (removed && this.auditoria) await this.auditoria.registrar({ usuarioId, entidade: 'ajustes', registroId: id, acao: 'DELETE', valorAnterior: previous });
    return removed;
  }
}
