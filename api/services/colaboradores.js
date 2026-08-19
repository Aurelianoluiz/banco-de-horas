const makeId = () => `col-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export class ColaboradoresService {
  constructor(repository) {
    this.repository = repository;
  }

  listar(filtro = {}) {
    return this.repository.list('colaboradores', (item) => {
      if (filtro.status && item.status !== filtro.status) return false;
      if (filtro.nome && !item.nome?.toLowerCase().includes(filtro.nome.toLowerCase())) return false;
      return true;
    });
  }

  obter(id) {
    return this.repository.get('colaboradores', id);
  }

  criar(input) {
    if (!input?.nome?.trim()) throw new TypeError('nome é obrigatório');
    return this.repository.insert('colaboradores', {
      id: input.id || makeId(),
      nome: input.nome.trim(),
      salario: input.salario ?? null,
      jornada: input.jornada || null,
      tolerancia: input.tolerancia || '00:15',
      status: input.status || 'ativo'
    });
  }

  atualizar(id, changes) {
    if (changes.nome !== undefined && !changes.nome?.trim()) throw new TypeError('nome é obrigatório');
    return this.repository.update('colaboradores', id, {
      ...changes,
      ...(changes.nome ? { nome: changes.nome.trim() } : {})
    });
  }

  excluir(id) {
    return this.repository.remove('colaboradores', id);
  }
}
