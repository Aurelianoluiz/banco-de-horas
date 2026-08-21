export const printRelatorio = ({ html, title = 'Relatório Banco de Horas' } = {}) => {
  const popup = window.open('', '_blank');
  if (!popup) throw new Error('Não foi possível abrir a janela de impressão');
  const safeTitle = String(title).replace(/[<>]/g, '');
  popup.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${safeTitle}</title><style>body{font:12px Arial;color:#111;margin:24px}table{width:100%;border-collapse:collapse}th,td{padding:7px;border-bottom:1px solid #ddd;text-align:left}h1{font-size:18px}@media print{@page{size:A4;margin:12mm}}</style></head><body>${html || '<p>Nenhum registro encontrado.</p>'}</body></html>`);
  popup.document.close();
  popup.focus();
  popup.print();
};
