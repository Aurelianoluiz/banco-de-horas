const esc = (value) => String(value ?? '').replace(/[&<>\"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const time = (value) => value == null || value === '' ? '—' : String(value);

export const renderApontamentos = ({ rows = [], colaboradores = [], loading = false, error = null } = {}) => {
  const names = new Map(colaboradores.map((item) => [item.id, item.nome]));
  if (error) return `<div class="error" role="alert">${esc(error.message || error)}</div>`;
  if (loading) return '<p>Carregando apontamentos…</p>';
  if (!rows.length) return '<div class="empty"><strong>Nenhum apontamento</strong><p>Não há registros para os filtros selecionados.</p></div>';
  const body = rows.map((row) => `<tr><td>${esc(row.date || row.data)}</td><td>${esc(names.get(row.cid || row.colaboradorId) || row.nome || '—')}</td><td>${esc(time(row.in || row.entrada))}</td><td>${esc(time(row.out || row.saida))}</td><td>${esc(row.minutosTrabalhados ?? row.trabalhado ?? '—')}</td><td>${esc(row.saldo ?? row.saldoMin ?? '—')}</td></tr>`).join('');
  return `<table class="table"><thead><tr><th>Data</th><th>Colaborador</th><th>Entrada</th><th>Saída</th><th>Trabalhado</th><th>Saldo</th></tr></thead><tbody>${body}</tbody></table>`;
};
