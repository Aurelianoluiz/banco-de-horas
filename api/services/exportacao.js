import xlsx from 'node-xlsx';

const toMatrix = (rows = []) => {
  if (!Array.isArray(rows) || rows.length === 0) return [['Nenhum registro']];
  const columns = Object.keys(rows[0]);
  return [columns, ...rows.map((row) => columns.map((column) => row[column] ?? ''))];
};

const safeSheetName = (name) => String(name || 'Relatorio').replace(/[\\/?*\[\]:]/g, ' ').slice(0, 31) || 'Relatorio';

export class ExportacaoService {
  constructor(relatorios) { this.relatorios = relatorios; }

  async xlsx(tipo, params = {}) {
    const data = await this.relatorios[tipo](params);
    const rows = Array.isArray(data) ? data : [data];
    const buffer = xlsx.build([{ name: safeSheetName(tipo), data: toMatrix(rows) }]);
    return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  }
}

export { toMatrix, safeSheetName };
