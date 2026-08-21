import PDFDocument from 'pdfkit';

const text = (value) => String(value ?? '').replace(/[\r\n]+/g, ' ');
const formatMinutes = (value) => {
  const minutes = Math.round(Number(value) || 0);
  const sign = minutes < 0 ? '-' : '';
  const absolute = Math.abs(minutes);
  return `${sign}${String(Math.floor(absolute / 60)).padStart(2, '0')}:${String(absolute % 60).padStart(2, '0')}`;
};

const rowsFrom = (data) => Array.isArray(data) ? data : [data];

const buildPdf = ({ title, competencia, rows }) => new Promise((resolve, reject) => {
  const doc = new PDFDocument({ size: 'A4', margin: 42, bufferPages: true });
  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));
  doc.on('error', reject);
  doc.on('end', () => resolve(Buffer.concat(chunks)));

  doc.fontSize(18).text(text(title), { align: 'left' });
  if (competencia) doc.moveDown(0.3).fontSize(10).fillColor('#555').text(`Competência: ${text(competencia)}`);
  doc.moveDown(0.8).fillColor('#111');

  if (!rows.length) {
    doc.fontSize(11).text('Nenhum registro encontrado.');
    doc.end();
    return;
  }

  const columns = Object.keys(rows[0]);
  const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const columnWidth = Math.max(55, usableWidth / Math.min(columns.length, 7));
  const drawHeader = () => {
    const y = doc.y;
    doc.fontSize(8).font('Helvetica-Bold');
    columns.forEach((column, index) => {
      doc.text(text(column), doc.page.margins.left + index * columnWidth, y, { width: columnWidth - 4, ellipsis: true });
    });
    doc.moveDown(0.8).font('Helvetica');
  };

  drawHeader();
  rows.forEach((row) => {
    if (doc.y > doc.page.height - 60) { doc.addPage(); drawHeader(); }
    const y = doc.y;
    columns.forEach((column, index) => {
      const value = ['saldo', 'horasTrabalhadas', 'horasPrevistas', 'creditos', 'debitos'].includes(column)
        ? formatMinutes(row[column])
        : text(row[column]);
      doc.fontSize(7).text(value, doc.page.margins.left + index * columnWidth, y, { width: columnWidth - 4, ellipsis: true });
    });
    doc.moveDown(0.75);
  });

  const range = doc.bufferedPageRange();
  for (let index = range.start; index < range.start + range.count; index += 1) {
    doc.switchToPage(index);
    doc.fontSize(7).fillColor('#666').text(`Página ${index + 1} de ${range.count}`, 42, doc.page.height - 30, { align: 'center', width: doc.page.width - 84 });
  }
  doc.end();
});

export class ExportacaoPdfService {
  constructor(relatorios) { this.relatorios = relatorios; }

  async pdf(tipo, params = {}) {
    const data = await this.relatorios[tipo](params);
    return buildPdf({ title: `Banco de Horas — ${tipo}`, competencia: params.competencia, rows: rowsFrom(data) });
  }
}

export { buildPdf, formatMinutes };
