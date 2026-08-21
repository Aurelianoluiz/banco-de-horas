export class ConfiguracoesService {
  constructor(repository) { this.repository = repository; }
  async listar() { return this.repository.list('configuracoes'); }
  async obter(chave) { return this.repository.findOne('configuracoes', { chave }); }
  async salvar(chave, valor, usuarioId = null) {
    if (!String(chave || '').trim()) throw new TypeError('Chave obrigatória.');
    const item = { chave: String(chave).trim(), valor, atualizadoPor: usuarioId, atualizadoEm: new Date().toISOString() };
    const existing = await this.obter(item.chave);
    return existing ? this.repository.update('configuracoes', item.chave, item) : this.repository.insert('configuracoes', item);
  }
}
