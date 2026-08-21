const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

const empty = '<p class="muted">Nenhum registro encontrado.</p>';
const rows = (items, cells) => items.length ? `<table><thead><tr>${cells.map((cell) => `<th>${esc(cell)}</th>`).join('')}</tr></thead><tbody>${items.map((item) => `<tr>${cells.map((_, index) => `<td>${esc(index < cells.length ? item[index] : '')}</td>`).join('')}</tr>`).join('')}</tbody></table>` : empty;

export const renderFerias = (items = []) => `<section><h2>Férias</h2>${rows(items.map((x) => [x.colaboradorId, x.inicio, x.fim, x.dias, x.status]), ['Colaborador', 'Início', 'Fim', 'Dias', 'Status'])}</section>`;
export const renderFolgas = (items = []) => `<section><h2>Folgas</h2>${rows(items.map((x) => [x.colaboradorId, x.data, x.motivo, x.origem, x.status]), ['Colaborador', 'Data', 'Motivo', 'Origem', 'Status'])}</section>`;
export const renderFeriados = (items = []) => `<section><h2>Feriados</h2>${rows(items.map((x) => [x.data, x.descricao, x.tipo]), ['Data', 'Descrição', 'Tipo'])}</section>`;
