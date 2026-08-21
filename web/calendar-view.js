const pad = (value) => String(value).padStart(2, '0');
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const monthTitle = (year, month) => new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1));

export function monthGrid(year, month) {
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const startOffset = (first.getDay() + 6) % 7;
  const totalDays = last.getDate();
  const cells = [];
  for (let index = 0; index < startOffset; index += 1) cells.push(null);
  for (let day = 1; day <= totalDays; day += 1) cells.push(`${year}-${pad(month)}-${pad(day)}`);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function renderMonth(container, { year, month, events = [], onNavigate } = {}) {
  if (!container) throw new TypeError('container é obrigatório');
  const byDate = new Map();
  for (const event of events) {
    if (!byDate.has(event.date)) byDate.set(event.date, []);
    byDate.get(event.date).push(event);
  }
  const labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const cells = monthGrid(year, month).map((date) => {
    if (!date) return '<div class="calendar-cell calendar-empty" aria-hidden="true"></div>';
    const day = Number(date.slice(-2));
    const items = byDate.get(date) || [];
    const html = items.slice(0, 4).map((item) => `<span class="calendar-event calendar-${escapeHtml(item.type)}">${escapeHtml(item.title)}</span>`).join('');
    return `<div class="calendar-cell" data-date="${date}"><strong>${day}</strong><div class="calendar-events">${html}${items.length > 4 ? `<small>+${items.length - 4}</small>` : ''}</div></div>`;
  }).join('');
  container.innerHTML = `<div class="calendar-head"><button type="button" data-calendar="prev">‹</button><h2>${escapeHtml(monthTitle(year, month))}</h2><button type="button" data-calendar="next">›</button></div><div class="calendar-week">${labels.map((label) => `<span>${label}</span>`).join('')}</div><div class="calendar-grid">${cells}</div>`;
  container.querySelector('[data-calendar="prev"]')?.addEventListener('click', () => onNavigate?.(-1));
  container.querySelector('[data-calendar="next"]')?.addEventListener('click', () => onNavigate?.(1));
}
