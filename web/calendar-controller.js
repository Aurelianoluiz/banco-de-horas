import { dataAdapter } from './data-adapter.js';

const isoDate = (year, month, day) => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
const expandRange = (start, end) => {
  const result = [];
  const current = new Date(`${start}T12:00:00`);
  const limit = new Date(`${end}T12:00:00`);
  while (current <= limit) {
    result.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return result;
};

const buildEvents = ({ year, month, apontamentos, ferias, folgas, feriados }) => {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  const events = [];
  for (const point of apontamentos) {
    if (point.data?.startsWith(prefix)) events.push({ date: point.data, type: 'apontamento', title: `${point.entrada || '--:--'} → ${point.saida || '--:--'}`, item: point });
  }
  for (const holiday of feriados) {
    if (holiday.data?.startsWith(prefix)) events.push({ date: holiday.data, type: 'feriado', title: holiday.descricao || 'Feriado', item: holiday });
  }
  for (const dayOff of folgas) {
    if (dayOff.data?.startsWith(prefix)) events.push({ date: dayOff.data, type: 'folga', title: dayOff.motivo || 'Folga', item: dayOff });
  }
  for (const vacation of ferias) {
    for (const date of expandRange(vacation.inicio, vacation.fim)) {
      if (date.startsWith(prefix)) events.push({ date, type: 'ferias', title: 'Férias', item: vacation });
    }
  }
  return events.sort((a, b) => a.date.localeCompare(b.date));
};

const state = { loading: false, error: null, year: new Date().getFullYear(), month: new Date().getMonth() + 1, events: [] };

export const calendarController = {
  getState() { return { ...state, events: [...state.events] }; },
  async load({ year = state.year, month = state.month } = {}) {
    state.loading = true; state.error = null; state.year = year; state.month = month;
    try {
      const [apontamentos, ferias, folgas, feriados] = await Promise.all([
        dataAdapter.loadApontamentos({ inicio: `${year}-${String(month).padStart(2, '0')}-01`, fim: `${year}-${String(month).padStart(2, '0')}-31` }),
        dataAdapter.loadFerias(),
        dataAdapter.loadFolgas(),
        dataAdapter.loadFeriados()
      ]);
      state.events = buildEvents({ year, month, apontamentos, ferias, folgas, feriados });
      return this.getState();
    } catch (error) { state.error = error; throw error; }
    finally { state.loading = false; }
  },
  eventsForDate(date) { return state.events.filter((event) => event.date === date); }
};

if (typeof window !== 'undefined') window.BancoHorasCalendar = calendarController;
