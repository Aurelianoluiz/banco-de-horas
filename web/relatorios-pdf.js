import { api } from './api-client.js';

export async function baixarRelatorioPdf(tipo, params = {}) {
  const { blob, filename } = await api.exportarRelatorioPdf(tipo, params);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
  return filename;
}
