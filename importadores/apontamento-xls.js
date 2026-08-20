const STATUS = new Set(['-', 'Normal', 'Feriado', 'Folga', 'Justificado', 'Férias', 'Falta']);

function text(value) {
  return value == null ? '' : String(value).trim();
}

export function timeToMinutes(value) {
  if (value == null || value === '') return null;
  if (value instanceof Date) return value.getHours() * 60 + value.getMinutes();
  if (typeof value === 'number') return Math.round(value * 24 * 60) % (24 * 60);
  const match = /^\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*$/.exec(String(value));
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function minutesToTime(minutes) {
  const value = Math.max(0, Number(minutes) || 0);
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}

export function dateToISO(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  if (typeof value === 'number') {
    const epoch = new Date(Date.UTC(1899, 11, 30));
    return new Date(epoch.getTime() + value * 86400000).toISOString().slice(0, 10);
  }
  const s = text(value);
  const br = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  return iso ? `${iso[1]}-${iso[2]}-${iso[3]}` : null;
}

function valueAt(rows, row, col) {
  return rows[row - 1]?.[col - 1];
}

function rowObject(rows, row) {
  return {
    data: dateToISO(valueAt(rows, row, 3)),
    ocorrencia: text(valueAt(rows, row, 6)),
    entrada1: text(valueAt(rows, row, 8)),
    saida1: text(valueAt(rows, row, 9)),
    entrada2: text(valueAt(rows, row, 10)),
    saida2: text(valueAt(rows, row, 11)),
    horasTotais: timeToMinutes(valueAt(rows, row, 12)),
    horasExtras: timeToMinutes(valueAt(rows, row, 14)),
    faltasAtrasos: timeToMinutes(valueAt(rows, row, 15)),
    extras05: timeToMinutes(valueAt(rows, row, 17)),
    extras08: timeToMinutes(valueAt(rows, row, 18)),
    extras15: timeToMinutes(valueAt(rows, row, 19)),
    adicionalNoturno: timeToMinutes(valueAt(rows, row, 20)),
  };
}

export function analyzeApontamentoRows(rows) {
  const errors = [];
  const warnings = [];
  const records = [];
  const name = text(valueAt(rows, 3, 3));
  const salary = Number(valueAt(rows, 5, 8) || 0);
  const monthlyRaw = valueAt(rows, 5, 14);
  const monthlyMinutes = typeof monthlyRaw === 'number' ? monthlyRaw * 60 : (timeToMinutes(monthlyRaw) ?? 0);
  const segQui = timeToMinutes(valueAt(rows, 7, 14));
  const sexta = timeToMinutes(valueAt(rows, 9, 14));
  const sabado = timeToMinutes(valueAt(rows, 9, 9));
  const tolerancia = timeToMinutes(valueAt(rows, 9, 20));
  const periodoInicio = dateToISO(valueAt(rows, 3, 19));
  const periodoFim = dateToISO(valueAt(rows, 5, 19));

  if (!periodoInicio || !periodoFim) errors.push({ code: 'PERIODO_INVALIDO', message: 'Período da planilha não foi identificado.' });
  if (monthlyMinutes <= 0) warnings.push({ code: 'CARGA_MENSAL_AUSENTE', message: 'Carga horária mensal não foi informada.' });
  if (segQui == null) warnings.push({ code: 'CARGA_SEG_QUI_AUSENTE', message: 'Carga diária de segunda a quinta não foi identificada.' });
  if (sexta == null) warnings.push({ code: 'CARGA_SEXTA_AUSENTE', message: 'Carga diária de sexta não foi identificada.' });
  if (tolerancia == null) warnings.push({ code: 'TOLERANCIA_AUSENTE', message: 'Tolerância não foi identificada.' });

  for (let row = 15; row <= rows.length; row += 1) {
    const record = rowObject(rows, row);
    const hasAny = Object.values(record).some((value) => value != null && value !== '');
    if (!hasAny) continue;
    if (!record.data) {
      if (row > 45) continue;
      errors.push({ code: 'DATA_INVALIDA', row, message: `Linha ${row}: data inválida.` });
      continue;
    }
    if (!STATUS.has(record.ocorrencia)) warnings.push({ code: 'OCORRENCIA_DESCONHECIDA', row, message: `Linha ${row}: ocorrência '${record.ocorrencia}' não pertence à lista conhecida.` });
    if (record.entrada1 && timeToMinutes(record.entrada1) == null) warnings.push({ code: 'ENTRADA_INVALIDA', row, message: `Linha ${row}: entrada inválida.` });
    if (record.saida1 && timeToMinutes(record.saida1) == null) warnings.push({ code: 'SAIDA_INVALIDA', row, message: `Linha ${row}: saída inválida.` });
    records.push({ ...record, sourceRow: row });
  }

  const summary = {
    diasUteis: Number(valueAt(rows, 48, 7) || 0),
    diasTrabalhados: Number(valueAt(rows, 48, 9) || 0),
    horasExtras05: timeToMinutes(valueAt(rows, 49, 10)),
    horasExtras08: timeToMinutes(valueAt(rows, 50, 10)),
    horasExtras15: timeToMinutes(valueAt(rows, 51, 10)),
    adicionalNoturno: timeToMinutes(valueAt(rows, 52, 10)),
    dsrDias: Number(valueAt(rows, 53, 9) || 0),
    dsrHoras: timeToMinutes(valueAt(rows, 53, 10)),
    perdaPorFaltasAtrasos: timeToMinutes(valueAt(rows, 56, 11)),
  };

  return { metadata: { name, salary, monthlyMinutes, segQui, sexta, sabado, tolerancia, periodoInicio, periodoFim }, records, summary, diagnostics: { valid: errors.length === 0, errors, warnings } };
}

export function importApontamentoWorkbook(workbook) {
  if (!workbook?.Sheets?.Plan1) return { diagnostics: { valid: false, errors: [{ code: 'ABA_PLAN1_AUSENTE', message: 'A aba Plan1 não foi encontrada.' }], warnings: [] } };
  const XLSX = globalThis.XLSX;
  if (!XLSX?.utils?.sheet_to_json) throw new Error('A biblioteca XLSX precisa estar disponível para ler a planilha.');
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets.Plan1, { header: 1, raw: true, defval: null });
  return analyzeApontamentoRows(rows);
}

export function toSystemRecords(result, collaboratorId) {
  return result.records.map((r) => {
    const breakMinutes = r.entrada2 && r.saida1 ? Math.max(0, timeToMinutes(r.entrada2) - timeToMinutes(r.saida1)) : 0;
    return {
      id: `xls-${r.data}-${collaboratorId}`,
      cid: collaboratorId,
      date: r.data,
      in: r.entrada1 || '',
      out: r.saida2 || r.saida1 || '',
      brk: minutesToTime(breakMinutes),
      ocorrencia: r.ocorrencia,
      source: 'Apontamento.xls',
      sourceRow: r.sourceRow,
      importedAt: new Date().toISOString(),
    };
  });
}
