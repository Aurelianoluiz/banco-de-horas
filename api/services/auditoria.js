import { randomUUID } from 'node:crypto';

export class AuditoriaService {
  constructor(repository, clock = () => new Date().toISOString()) {
    this.repository = repository;
    this.clock = clock;
  }

  async registrar({ usuarioId = null, acao, entidade, registroId = null, antes = null, depois = null, sessaoId = null, ip = null }) {
    if (!acao || !entidade) throw new TypeError('acao e entidade são obrigatórios');
    return this.repository.insert('auditoria', {
      id: randomUUID(),
      usuarioId,
      acao,
      entidade,
      registroId,
      antes,
      depois,
      sessaoId,
      ip,
      criadoEm: this.clock()
    });
  }

  async listar(filtro = {}) {
    const records = await this.repository.list('auditoria');
    return records.filter((item) => {
      if (filtro.usuarioId && item.usuarioId !== filtro.usuarioId) return false;
      if (filtro.entidade && item.entidade !== filtro.entidade) return false;
      if (filtro.registroId && item.registroId !== filtro.registroId) return false;
      return true;
    });
  }
}
