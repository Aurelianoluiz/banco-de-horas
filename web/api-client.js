const json = async (response) => {
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || `HTTP ${response.status}`);
  return data;
};

export const api = {
  async list(path) {
    return json(await fetch(`/api/${path}`));
  },
  async get(path, id) {
    return json(await fetch(`/api/${path}/${encodeURIComponent(id)}`));
  },
  async create(path, payload) {
    return json(await fetch(`/api/${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    }));
  },
  async update(path, id, payload) {
    return json(await fetch(`/api/${path}/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    }));
  },
  async remove(path, id) {
    return json(await fetch(`/api/${path}/${encodeURIComponent(id)}`, { method: 'DELETE' }));
  }
};
