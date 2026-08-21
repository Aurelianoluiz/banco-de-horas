const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const fmtMinutes = (minutes) => { const total = Math.round(Number(minutes) || 0); const sign = total < 0 ? '-' : ''; const abs = Math.abs(total); return `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}h ${String(abs % 60).padStart(2, '0')}min`; };

export const renderRelatorio = (state, target) => {
  if (!target) return;
  if (state.loading) { target.innerHTML = '<p>Carregando relatório...</p>'; return; }
  if (state.error) { target.innerHTML = `<p role="alert">${escapeHtml(state.error.message)}</p>`; return; }
  const rows = state.rows || [];
  if (state.resumo && !rows.length) {
    target.innerHTML = `<div class="report-summary"><strong>Competência:</strong> ${escapeHtml(state.resumo.competencia)}<br><strong>Registros:</strong> ${Number(state.resumo.quantidade || 0)}<br><strong>Trabalhadas:</strong> ${fmtMinutes(state.resumo.horasTrabalhadas)}<br><strong>Previstas:</strong> ${fmtMinutes(state.resumo.horasPrevistas)}<br><strong>Créditos:</strong> ${fmtMinutes(state.resumo.creditos)}<br><strong>Débitos:</strong> ${fmtMinutes(state.resumo.debitos)}<br><strong>Saldo:</strong> ${fmtMinutes(state.resumo.saldo)}</div>`;
    return;
  }
  if (!rows.length) { target.innerHTML = '<p>Nenhum registro encontrado.</p>'; return; }
  const columns = Object.keys(rows[0]);
  target.innerHTML = `<table class="table"><thead><tr>${columns.map((column) => `<th>${escapeHtml(column)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${columns.map((column) => `<td>${['saldo','horasTrabalhadas','horasPrevistas'].includes(column) ? fmtMinutes(row[column]) : escapeHtml(row[column])}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
};
