const makeId = () => `col-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export class ColaboradoresService {
  constructor(repository, auditoria = null, actor = () => null) {
    this.repository = repository;
    this.auditoria = auditoria;
    this.actor = actor;
  }

  registrar(evento) {
    if (this.auditoria) return this.auditoria.registrar({ usuarioId: this.actor(), ...evento });
    return null;
  }

  async listar(filtro = {}) {
    const records = await this.repository.list('colaboradores');
    return records.filter((item) => {
      if (filtro.status && item.status !== filtro.status) return false;
      if (filtro.nome && !item.nome?.toLowerCase().includes(filtro.nome.toLowerCase())) return false;
      return true;
    });
  }

  async obter(id) {
    return this.repository.get('colaboradores', id);
  }

  async criar(input) {
    if (!input?.nome?.trim()) throw new TypeError('nome é obrigatório');
    const item = await this.repository.insert('colaboradores', {
      id: input.id || makeId(),
      nome: input.nome.trim(),
      salario: input.salario ?? null,
      jornada: input.jornada || null,
      tolerancia: input.tolerancia || '00:15',
      status: input.status || 'ativo'
    });
    await this.registrar({ acao: 'CRIAR', entidade: 'colaboradores', registroId: item.id, depois: item });
    return item;
  }

  async atualizar(id, changes) {
    if (changes.nome !== undefined && !changes.nome?.trim()) throw new TypeError('nome é obrigatório');
    const antes = await this.repository.get('colaboradores', id);
    if (!antes) return null;
    const depois = await this.repository.update('colaboradores', id, {
      ...changes,
      ...(changes.nome ? { nome: changes.nome.trim() } : {})
    });
    await this.registrar({ acao: 'ALTERAR', entidade: 'colaboradores', registroId: id, antes, depois });
    return depois;
  }

  async excluir(id) {
    const antes = await this.repository.get('colaboradores', id);
    if (!antes) return false;
    const removido = await this.repository.remove('colaboradores', id);
    if (removido) await this.registrar({ acao: 'EXCLUIR', entidade: 'colaboradores', registroId: id, antes });
    return removido;
  }
}
