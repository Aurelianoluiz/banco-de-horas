// Orquestração das regras de jornada, ausências e calendário.
import { loadStore, saveStore, emitDataChange } from './app-config.js';
import { calendarEvents, absenceSummary, isBusinessDay } from './absence-calendar.js';

export function getAppData(seed={}) { return loadStore(seed); }
export function setAppData(data) { const saved=saveStore(data); emitDataChange(); return saved; }
export function getCalendar(year,month) { return calendarEvents(getAppData(),year,month); }
export function getEmployeeAbsences(id) { return absenceSummary(getAppData(),id); }
export function countBusinessDays(start,end,holidays=[]) {
  let total=0; const a=new Date(start+'T12:00:00'), b=new Date(end+'T12:00:00');
  for(let d=new Date(a); d<=b; d.setDate(d.getDate()+1)) { const iso=d.toISOString().slice(0,10); if(isBusinessDay(iso,holidays)) total++; }
  return total;
}
export function subscribeToChanges(handler) { return window.addEventListener('banco-horas:data-change',handler); }
