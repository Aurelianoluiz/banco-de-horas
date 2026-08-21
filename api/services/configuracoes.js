export class ConfiguracoesService {
  constructor(repository) { this.repository = repository; }
  async listar() { return this.repository.list('configuracoes'); }
  async obter(chave) { return this.repository.findOne('configuracoes', { chave }); }
  async salvar(chave, valor, usuarioId = null) {
    const key = String(chave || '').trim();
    if (!key) throw new TypeError('Chave obrigatória.');
    if (typeof this.repository.upsertConfiguracao === 'function') return this.repository.upsertConfiguracao(key, valor, usuarioId);
    const item = { chave: key, valor, atualizadoPor: usuarioId, atualizadoEm: new Date().toISOString() };
    const existing = await this.obter(key);
    return existing ? this.repository.update('configuracoes', key, item) : this.repository.insert('configuracoes', item);
  }
}
