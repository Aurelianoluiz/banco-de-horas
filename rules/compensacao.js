// Regras derivadas da planilha de referência. Percentuais e janelas só devem
// ser alterados após nova validação contra a planilha homologada.
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

export function extraBand(minutesExtra) {
  const value = Math.max(0, Number(minutesExtra) || 0);
  if (value < minutes('02:00')) return 0;
  if (value < minutes('04:00')) return 0.5;
  if (value < minutes('06:00')) return 0.8;
  return 1.5;
}

export function nightMinutes({ entrada, saida }) {
  let start = minutes(entrada);
  let end = minutes(saida);
  if (end < start) end += 24 * 60;
  const windows = [
    [22 * 60, 24 * 60],
    [24 * 60, 29 * 60],
  ];
  return windows.reduce((total, [from, to]) => total + Math.max(0, Math.min(end, to) - Math.max(start, from)), 0);
}

export function summarizeExtra(minutesExtra) {
  const value = Math.max(0, Number(minutesExtra) || 0);
  return { minutos: value, horario: time(value), adicional: extraBand(value) };
}
