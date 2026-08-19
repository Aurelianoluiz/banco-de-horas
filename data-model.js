// Modelo de domínio do Banco de Horas — preparado para futura API/banco de dados.
export const schema = {
  colaboradores: { id:'string', nome:'string', salario:'number', cargaSegQui:'HH:mm', cargaSexta:'HH:mm', tolerancia:'HH:mm', ativo:'boolean' },
  apontamentos: { id:'string', data:'YYYY-MM-DD', colaboradorId:'string', entrada:'HH:mm', intervalo:'HH:mm', saida:'HH:mm', ocorrencia:'string', observacao:'string', aprovado:'boolean' },
  ferias: { id:'string', colaboradorId:'string', inicio:'YYYY-MM-DD', fim:'YYYY-MM-DD', dias:'number', status:'Programada|Solicitada|Aprovada|Cancelada' },
  folgas: { id:'string', colaboradorId:'string', data:'YYYY-MM-DD', motivo:'string', origem:'Banco de horas|Escala|Outro', status:'Solicitada|Aprovada|Cancelada' },
  feriados: { id:'string', data:'YYYY-MM-DD', descricao:'string', tipo:'Nacional|Estadual|Municipal|Empresa' },
  ajustes: { id:'string', colaboradorId:'string', data:'YYYY-MM-DD', minutos:'number', motivo:'string', usuario:'string', criadoEm:'ISO-8601' },
  fechamentos: { id:'string', colaboradorId:'string', competencia:'YYYY-MM', saldoAnterior:'number', creditos:'number', debitos:'number', saldoFinal:'number', fechadoEm:'ISO-8601' }
};

export function monthlySummary(points, collaboratorId, competencia) {
  const rows = points.filter(p => p.colaboradorId === collaboratorId && p.data.startsWith(competencia));
  return rows.reduce((acc,p) => ({...acc, creditos:acc.creditos + Math.max(0,p.saldo||0), debitos:acc.debitos + Math.min(0,p.saldo||0)}), {creditos:0,debitos:0});
}
