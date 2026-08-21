const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const fmt = (value = 0) => { const n = Math.round(Number(value) || 0); const sign = n < 0 ? '-' : '+'; const abs = Math.abs(n); return `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}h ${String(abs % 60).padStart(2, '0')}min`; };

export const renderBancoHoras = (state, target) => {
  if (!target) return;
  if (state.loading) { target.innerHTML = '<p>Carregando banco de horas...</p>'; return; }
  if (state.error) { target.innerHTML = `<p role="alert">${escapeHtml(state.error.message)}</p>`; return; }
  if (!state.rows?.length) { target.innerHTML = '<p>Nenhum saldo encontrado para a competência.</p>'; return; }
  target.innerHTML = `<div class="table-wrap"><table class="table"><thead><tr><th>Colaborador</th><th>Saldo anterior</th><th>Créditos</th><th>Débitos</th><th>Saldo final</th></tr></thead><tbody>${state.rows.map((row) => `<tr><td>${escapeHtml(row.colaboradorNome)}</td><td>${fmt(row.saldoAnterior)}</td><td>${fmt(row.creditos)}</td><td class="danger">-${fmt(row.debitos).slice(1)}</td><td><strong>${fmt(row.saldoFinal)}</strong></td></tr>`).join('')}</tbody></table></div>`;
};
