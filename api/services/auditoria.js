export class AuditoriaService {
  constructor(repository, clock = () => new Date().toISOString()) {
    this.repository = repository;
    this.clock = clock;
  }

  registrar({ usuarioId = null, acao, entidade, registroId = null, antes = null, depois = null, sessaoId = null }) {
    if (!acao || !entidade) throw new TypeError('acao e entidade são obrigatórios');
    return this.repository.insert('auditoria', {
      id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      usuarioId,
      acao,
      entidade,
      registroId,
      antes,
      depois,
      sessaoId,
      criadoEm: this.clock()
    });
  }

  listar(filtro = {}) {
    return this.repository.list('auditoria', (item) => {
      if (filtro.usuarioId && item.usuarioId !== filtro.usuarioId) return false;
      if (filtro.entidade && item.entidade !== filtro.entidade) return false;
      if (filtro.registroId && item.registroId !== filtro.registroId) return false;
      return true;
    });
  }
}
