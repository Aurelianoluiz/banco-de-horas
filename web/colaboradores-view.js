const esc = (value) => String(value ?? '').replace(/[&<>\"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

export function renderColaboradores(state = {}) {
  if (state.loading) return '<p>Carregando colaboradores…</p>';
  if (state.error) return `<p role="alert">${esc(state.error.message || state.error)}</p>`;
  const rows = state.rows || [];
  if (!rows.length) return '<p>Nenhum colaborador cadastrado.</p>';
  return `<table><thead><tr><th>Nome</th><th>Salário</th><th>Seg-Qui</th><th>Sexta</th><th>Tolerância</th><th>Status</th></tr></thead><tbody>${rows.map((row) => `<tr><td>${esc(row.nome)}</td><td>${esc(row.salario ?? '')}</td><td>${esc(row.seg)}</td><td>${esc(row.sex)}</td><td>${esc(row.tol)}</td><td>${row.active ? 'Ativo' : 'Inativo'}</td></tr>`).join('')}</tbody></table>`;
}
