const pad = (value) => String(value).padStart(2, '0');

export function monthGrid(year, month) {
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const startOffset = first.getDay();
  const totalDays = last.getDate();
  const cells = [];
  for (let index = 0; index < startOffset; index += 1) cells.push(null);
  for (let day = 1; day <= totalDays; day += 1) cells.push(`${year}-${pad(month)}-${pad(day)}`);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function renderMonth(container, { year, month, events = [] } = {}) {
  if (!container) throw new TypeError('container é obrigatório');
  const byDate = new Map();
  for (const event of events) {
    if (!byDate.has(event.date)) byDate.set(event.date, []);
    byDate.get(event.date).push(event);
  }
  container.innerHTML = monthGrid(year, month).map((date) => {
    if (!date) return '<div class="calendar-cell calendar-empty" aria-hidden="true"></div>';
    const day = Number(date.slice(-2));
    const items = byDate.get(date) || [];
    const html = items.map((item) => `<span class="calendar-event calendar-${item.type}">${escapeHtml(item.title)}</span>`).join('');
    return `<div class="calendar-cell" data-date="${date}"><strong>${day}</strong><div class="calendar-events">${html}</div></div>`;
  }).join('');
}

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
