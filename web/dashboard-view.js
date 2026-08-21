const formatMinutes = (value = 0) => {
  const minutes = Math.round(Number(value) || 0);
  const sign = minutes < 0 ? '-' : '+';
  const abs = Math.abs(minutes);
  return `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}h ${String(abs % 60).padStart(2, '0')}min`;
};
const escapeHtml = (value) => String(value ?? '').replace(/[&<>\"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export const renderDashboard = (state, target) => {
  if (!target) return;
  if (state.loading) { target.innerHTML = '<p>Carregando dashboard...</p>'; return; }
  if (state.error) { target.innerHTML = `<p role="alert">${escapeHtml(state.error.message)}</p>`; return; }
  const cards = state.cards || {};
  const rows = (state.apontamentos || []).slice().sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))).slice(0, 10);
  const byId = new Map((state.colaboradores || []).map((item) => [item.id, item.nome || '—']));
  target.innerHTML = `
    <div class="dashboard-grid">
      <article class="card"><span>Saldo atual</span><strong>${formatMinutes(cards.saldoAtual)}</strong></article>
      <article class="card"><span>Créditos</span><strong>${formatMinutes(cards.horasPositivas)}</strong></article>
      <article class="card"><span>Débitos</span><strong>-${formatMinutes(cards.horasNegativas).slice(1)}</strong></article>
      <article class="card"><span>Horas trabalhadas</span><strong>${formatMinutes(cards.horasTrabalhadas)}</strong></article>
    </div>
    <div class="card" style="margin-top:16px;overflow:auto">
      <h2>Últimos apontamentos</h2>
      ${rows.length ? `<table class="table"><thead><tr><th>Data</th><th>Colaborador</th><th>Entrada</th><th>Saída</th><th>Saldo</th></tr></thead><tbody>${rows.map((row) => `<tr><td>${escapeHtml(row.date || row.data || '')}</td><td>${escapeHtml(byId.get(row.cid || row.colaboradorId))}</td><td>${escapeHtml(row.in || row.entrada || '')}</td><td>${escapeHtml(row.out || row.saida || '')}</td><td>${formatMinutes(row.saldo)}</td></tr>`).join('')}</tbody></table>` : '<p>Nenhum apontamento no período.</p>'}
    </div>`;
};
