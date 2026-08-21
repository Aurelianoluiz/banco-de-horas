// Regras explicitamente identificadas na planilha de referência.
// Limites de aplicação das faixas 0,5 / 0,8 / 1,5 não são inferidos aqui:
// devem permanecer configuráveis até nova validação contra a fórmula original.
import { minutes, time } from './jornada.js';

export const XLS_RULES = Object.freeze({
  cargaMensal: '220:00',
  cargaSegQui: '09:00',
  cargaSexta: '08:00',
  cargaSabado: '00:00',
  tolerancia: '00:15',
  corteHoraExtra: '02:00',
  adicionalNoturnoInicio: '22:00',
  adicionalNoturnoFim: '05:00',
  faixasHoraExtra: [0.5, 0.8, 1.5],
});

export function extraEligible(minutesExtra, corte = XLS_RULES.corteHoraExtra) {
  return Math.max(0, Number(minutesExtra) || 0) >= minutes(corte);
}

export function nightMinutes({ entrada, saida }) {
  let start = minutes(entrada);
  let end = minutes(saida);
  if (end < start) end += 24 * 60;
  const windows = [[22 * 60, 24 * 60], [24 * 60, 29 * 60]];
  return windows.reduce((total, [from, to]) => total + Math.max(0, Math.min(end, to) - Math.max(start, from)), 0);
}

export function summarizeExtra(minutesExtra) {
  const value = Math.max(0, Number(minutesExtra) || 0);
  return { minutos: value, horario: time(value), elegivel: extraEligible(value) };
}
