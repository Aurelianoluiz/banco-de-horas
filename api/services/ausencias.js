const makeId = () => crypto.randomUUID();
const validateDate = (value, field) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) throw new TypeError(`${field} inválida`);
};
const validateStatus = (value, allowed, field) => {
  if (value !== undefined && !allowed.includes(value)) throw new TypeError(`${field} inválido`);
};

const createCrudService = (repository, table, { mapCreate, mapUpdate, validateCreate = () => {}, validateUpdate = () => {} } = {}) => ({
  async listar(filters = {}) { return repository.list(table, filters); },
  async obter(id) { return repository.get(table, id); },
  async criar(input) { validateCreate(input); return repository.insert(table, mapCreate(input)); },
  async atualizar(id, input) { validateUpdate(input); return repository.update(table, id, mapUpdate(input)); },
  async excluir(id) { return repository.remove(table, id); }
});

export const createFeriasService = (repository) => createCrudService(repository, 'ferias', {
  validateCreate(data) {
    if (!data?.colaboradorId) throw new TypeError('colaboradorId obrigatório');
    validateDate(data.inicio, 'Data inicial'); validateDate(data.fim, 'Data final');
    if (data.inicio > data.fim) throw new TypeError('Período de férias inválido');
    validateStatus(data.status, ['Programada', 'Solicitada', 'Aprovada', 'Cancelada'], 'Status');
  },
  validateUpdate(data) {
    if (data.inicio) validateDate(data.inicio, 'Data inicial');
    if (data.fim) validateDate(data.fim, 'Data final');
    validateStatus(data.status, ['Programada', 'Solicitada', 'Aprovada', 'Cancelada'], 'Status');
  },
  mapCreate(data) { return { id: data.id || makeId(), colaboradorId: data.colaboradorId, inicio: data.inicio, fim: data.fim, dias: data.dias ?? 0, status: data.status || 'Programada' }; },
  mapUpdate(data) { return { ...(data.inicio !== undefined && { inicio: data.inicio }), ...(data.fim !== undefined && { fim: data.fim }), ...(data.dias !== undefined && { dias: data.dias }), ...(data.status !== undefined && { status: data.status }) }; }
});

export const createFolgasService = (repository) => createCrudService(repository, 'folgas', {
  validateCreate(data) {
    if (!data?.colaboradorId) throw new TypeError('colaboradorId obrigatório');
    validateDate(data.data, 'Data');
    if (!data.motivo?.trim()) throw new TypeError('motivo obrigatório');
    validateStatus(data.status, ['Solicitada', 'Aprovada', 'Cancelada'], 'Status');
    if (data.origem && !['Banco de horas', 'Escala', 'Outro'].includes(data.origem)) throw new TypeError('Origem inválida');
  },
  validateUpdate(data) {
    if (data.data) validateDate(data.data, 'Data');
    if (data.motivo !== undefined && !data.motivo?.trim()) throw new TypeError('motivo obrigatório');
    validateStatus(data.status, ['Solicitada', 'Aprovada', 'Cancelada'], 'Status');
    if (data.origem && !['Banco de horas', 'Escala', 'Outro'].includes(data.origem)) throw new TypeError('Origem inválida');
  },
  mapCreate(data) { return { id: data.id || makeId(), colaboradorId: data.colaboradorId, data: data.data, motivo: data.motivo.trim(), origem: data.origem || 'Outro', status: data.status || 'Solicitada' }; },
  mapUpdate(data) { return { ...(data.data !== undefined && { data: data.data }), ...(data.motivo !== undefined && { motivo: data.motivo.trim() }), ...(data.origem !== undefined && { origem: data.origem }), ...(data.status !== undefined && { status: data.status }) }; }
});

export const createFeriadosService = (repository) => createCrudService(repository, 'feriados', {
  validateCreate(data) {
    validateDate(data?.data, 'Data');
    if (!data?.descricao?.trim()) throw new TypeError('descricao obrigatória');
    if (!['Nacional', 'Estadual', 'Municipal', 'Empresa'].includes(data.tipo || 'Empresa')) throw new TypeError('Tipo inválido');
  },
  validateUpdate(data) {
    if (data.data) validateDate(data.data, 'Data');
    if (data.descricao !== undefined && !data.descricao?.trim()) throw new TypeError('descricao obrigatória');
    if (data.tipo && !['Nacional', 'Estadual', 'Municipal', 'Empresa'].includes(data.tipo)) throw new TypeError('Tipo inválido');
  },
  mapCreate(data) { return { id: data.id || makeId(), data: data.data, descricao: data.descricao.trim(), tipo: data.tipo || 'Empresa' }; },
  mapUpdate(data) { return { ...(data.data !== undefined && { data: data.data }), ...(data.descricao !== undefined && { descricao: data.descricao.trim() }), ...(data.tipo !== undefined && { tipo: data.tipo }) }; }
});
