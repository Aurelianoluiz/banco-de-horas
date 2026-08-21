# Auditoria técnica — segurança e performance

Data: 2026-08-21
Branch: `feat/xls-importacao`

## Correções aplicadas

### Segurança
- Limite de 1 MiB para corpos HTTP.
- Respostas 500 da API e do servidor não expõem mensagens internas.
- Rate limit básico de login por IP + conta: 10 tentativas por janela de 60 segundos.
- PBKDF2-HMAC-SHA256 passou a usar 600.000 iterações para novos hashes; hashes existentes continuam verificáveis por compatibilidade.
- Cabeçalhos HTTP de proteção mantidos no servidor.
- Variáveis sensíveis documentadas em `.env.example`, sem segredos no repositório.
- SQL usa parâmetros e identificadores de tabela/coluna passam por allowlist de formato.

### Performance / banco
- Pool PostgreSQL limitado a 10 conexões com timeout de ociosidade.
- Índices adicionados para apontamentos, férias, folgas, atestados, ajustes, fechamentos e auditoria.
- Índices existentes para consultas de apontamentos e períodos de férias foram preservados.
- Repositório PostgreSQL aceita filtros simples e trata a chave textual de `configuracoes` corretamente.

## Pendências de produção

1. Rate limiting deve também existir no edge/WAF para ambiente distribuído.
2. O sistema ainda precisa de execução CI comprovada neste branch.
3. O teste real de PostgreSQL precisa ser executado em homologação com banco provisionado.
4. HTTPS/TLS deve ser terminado na infraestrutura de produção.
5. MFA para contas administrativas é recomendável antes da publicação externa.
6. O token atual possui expiração absoluta de 8 horas; timeout de inatividade e revogação server-side ainda não estão implementados.
7. O frontend usa `sessionStorage` para o token; migrar para cookie `HttpOnly`, `Secure`, `SameSite` deve ser considerado antes de exposição pública.

## Critério de fechamento

A auditoria técnica não deve ser considerada encerrada como `v1.0` apenas pela análise estática. É obrigatório executar CI, testes, smoke test contra PostgreSQL e homologação funcional antes do release.
