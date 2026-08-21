import test from 'node:test';
import assert from 'node:assert/strict';
import { RelatoriosService } from '../api/services/relatorios.js';

const repository = {
  async list(table) {
    const data = {
      apontamentos: [
        { id: '1', colaboradorId: 'c1', data: '2026-08-10', entrada: '08:00', saida: '17:00', intervalo: '01:00', ocorrencia: 'Normal', horasTrabalhadas: '08:00', horasPrevistas: '08:00', saldo: '00:00' },
        { id: '2', colaboradorId: 'c1', data: '2026-08-11', entrada: '08:00', saida: '16:30', intervalo: '01:00', ocorrencia: 'Normal', horasTrabalhadas: '07:30', horasPrevistas: '08:00', saldo: '-00:30' }
      ],
      ferias: [{ id: 'f1', colaboradorId: 'c1', inicio: '2026-08-20', fim: '2026-08-25', status: 'planejada' }],
      folgas: [{ id: 'l1', colaboradorId: 'c1', data: '2026-08-26', motivo: 'Compensação', origem: 'Banco de horas', status: 'planejada' }],
      fechamentos: [{ id: 'm1', colaboradorId: 'c1', competencia: '2026-08', saldoAnterior: 30, creditos: 60, debitos: 30, saldoFinal: 60 }]
    };
    return data[table] || [];
  }
};

test('espelho de ponto filtra competencia e colaborador', async () => {
  const service = new RelatoriosService(repository);
  const rows = await service.espelhoPonto({ colaboradorId: 'c1', competencia: '2026-08' });
  assert.equal(rows.length, 2);
  assert.equal(rows[1].saldo, -30);
});

test('banco de horas consolida creditos e debitos', async () => {
  const service = new RelatoriosService(repository);
  const result = await service.bancoHoras({ colaboradorId: 'c1', competencia: '2026-08' });
  assert.equal(result.creditos, 0);
  assert.equal(result.debitos, 30);
  assert.equal(result.saldo, -30);
  assert.equal(result.horasTrabalhadas, 930);
  assert.equal(result.horasPrevistas, 960);
});

test('competencia invalida é rejeitada', async () => {
  const service = new RelatoriosService(repository);
  await assert.rejects(() => service.bancoHoras({ competencia: '08/2026' }), /Competência inválida/);
});
