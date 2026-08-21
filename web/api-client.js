const json = async (response) => {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.error || `HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
};

const request = async (path, options = {}) => {
  const response = await fetch(`/api/${path}`, {
    credentials: 'same-origin',
    ...options,
    headers: {
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(options.headers || {})
    }
  });
  return json(response);
};

const binaryRequest = async (path) => {
  const response = await fetch(`/api/${path}`, { credentials: 'same-origin' });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const error = new Error(data?.error || `HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  const disposition = response.headers.get('content-disposition') || '';
  const match = disposition.match(/filename="?([^";]+)"?/i);
  return { blob: await response.blob(), filename: match?.[1] || 'relatorio' };
};

const reportPath = (kind, tipo, params = {}) => {
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value != null && value !== '')).toString();
  return `relatorios/${kind}/${tipo}${query ? `?${query}` : ''}`;
};

export const api = {
  async login(email, senha) { return request('login', { method: 'POST', body: JSON.stringify({ email, senha }) }); },
  async list(path) { return request(path); },
  async get(path, id) { return request(`${path}/${encodeURIComponent(id)}`); },
  async create(path, payload) { return request(path, { method: 'POST', body: JSON.stringify(payload) }); },
  async update(path, id, payload) { return request(`${path}/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(payload) }); },
  async remove(path, id) { return request(path && id != null ? `${path}/${encodeURIComponent(id)}` : path, { method: 'DELETE' }); },
  async bancoHoras(colaboradorId, competencia) { return request(`banco-horas/${encodeURIComponent(colaboradorId)}/${encodeURIComponent(competencia)}`); },
  async fechar(competencia, colaboradorId) { return request('fechamentos', { method: 'POST', body: JSON.stringify({ competencia, colaboradorId }) }); },
  async relatorio(tipo, params = {}) { return request(reportPath('', tipo, params).replace('relatorios//', 'relatorios/')); },
  async exportarRelatorio(tipo, params = {}) { return binaryRequest(reportPath('export', tipo, params)); },
  async exportarRelatorioPdf(tipo, params = {}) { return binaryRequest(reportPath('pdf', tipo, params)); }
};
