// Motor de regras de jornada. A UI deve consumir estas funções em vez de duplicar cálculos.

export function minutes(value='00:00') {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value);
  const match = String(value).trim().match(/^(\d{1,3}):(\d{2})$/);
  if (!match) throw new Error(`Horário inválido: ${value}`);
  const hours = Number(match[1]);
  const mins = Number(match[2]);
  if (mins > 59) throw new Error(`Horário inválido: ${value}`);
  return hours * 60 + mins;
}

export function time(value) {
  const total = Math.max(0, Math.round(minutes(value)));
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function workedMinutes({ entrada, saida, intervalo='00:00' }) {
  let start = minutes(entrada);
  let end = minutes(saida);
  if (end < start) end += 24 * 60;
  return Math.max(0, end - start - minutes(intervalo));
}

export function weekday(date) {
  const value = new Date(`${date}T12:00:00`);
  if (Number.isNaN(value.getTime())) throw new Error(`Data inválida: ${date}`);
  return value.getDay();
}

export function expectedMinutes(date, config={}, collaborator={}) {
  const day = weekday(date);
  if (day === 0) return 0;
  if (day === 6) return minutes(collaborator.cargaSabado ?? config.cargaSabado ?? '00:00');
  return minutes(day === 5
    ? collaborator.cargaSexta ?? config.cargaSexta ?? '08:00'
    : collaborator.cargaSegQui ?? config.cargaSegQui ?? '09:00');
}

export function balanceMinutes(point, config={}, collaborator={}) {
  const worked = workedMinutes(point);
  const expected = expectedMinutes(point.data, config, collaborator);
  const tolerance = minutes(collaborator.tolerancia ?? config.tolerancia ?? '00:00');
  const delta = worked - expected;
  return Math.abs(delta) <= tolerance ? 0 : delta;
}

export function classifyBalance(balance) {
  if (balance > 0) return 'credito';
  if (balance < 0) return 'debito';
  return 'neutro';
}

export function calculatePoint(point, config={}, collaborator={}) {
  const trabalhado = workedMinutes(point);
  const previsto = expectedMinutes(point.data, config, collaborator);
  const saldo = balanceMinutes(point, config, collaborator);
  return { trabalhado, previsto, saldo, classificacao: classifyBalance(saldo) };
}
