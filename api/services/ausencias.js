const validateDate = (value, field) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) throw new TypeError(`${field} inválida`);
};

const createCrudService = (repository, table, { validateCreate = () => {}, validateUpdate = () => {} } = {}) => ({
  async listar(filters = {}) { return repository.list(table, filters); },
  async obter(id) { return repository.get(table, id); },
  async criar(data) { validateCreate(data); return repository.insert(table, data); },
  async atualizar(id, data) { validateUpdate(data); return repository.update(table, id, data); },
  async excluir(id) { return repository.remove(table, id); }
});

export const createFeriasService = (repository) => createCrudService(repository, 'ferias', {
  validateCreate(data) {
    if (!data?.colaboradorId) throw new TypeError('colaboradorId obrigatório');
    validateDate(data.inicio, 'Data inicial'); validateDate(data.fim, 'Data final');
    if (data.inicio > data.fim) throw new TypeError('Período de férias inválido');
  },
  validateUpdate(data) { if (data.inicio) validateDate(data.inicio, 'Data inicial'); if (data.fim) validateDate(data.fim, 'Data final'); }
});

export const createFolgasService = (repository) => createCrudService(repository, 'folgas', {
  validateCreate(data) { if (!data?.colaboradorId) throw new TypeError('colaboradorId obrigatório'); validateDate(data.data, 'Data'); },
  validateUpdate(data) { if (data.data) validateDate(data.data, 'Data'); }
});

export const createFeriadosService = (repository) => createCrudService(repository, 'feriados', {
  validateCreate(data) { validateDate(data?.data, 'Data'); if (!data?.nome) throw new TypeError('nome obrigatório'); },
  validateUpdate(data) { if (data.data) validateDate(data.data, 'Data'); }
});
