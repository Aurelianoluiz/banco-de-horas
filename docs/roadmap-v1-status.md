# Roadmap v1.0 — Status

Atualizado após a análise do Apontamento.xls.

## Fase 0 — Fundação

- [x] Repositório separado
- [x] Estrutura Web
- [x] Sidebar
- [x] Dashboard inicial
- [x] Modelo de domínio
- [x] Configuração/integracão inicial
- [x] CI/CD inicial
- [x] Dependabot
- [x] CodeQL
- [x] Smoke test

## Fase 1 — Análise XLS

- [x] Abas, colunas e estrutura identificadas
- [x] Parâmetros identificados
- [x] Ocorrências identificadas
- [x] Fórmulas/campos calculados mapeados
- [x] Importador com diagnóstico
- [x] Prévia antes da gravação
- [x] Conversão para modelo do sistema
- [x] Documentação da análise
- [x] Casos de regressão automatizados
- [ ] Validação 100% do saldo/acumulado contra todos os fechamentos da planilha
- [ ] DSR homologado contra a fórmula original
- [ ] Regras de hora extra 0,5/0,8/1,5 homologadas integralmente

## Fase 2 — UI/UX

- [ ] Design system definitivo
- [ ] Figma como referência oficial
- [ ] Responsividade validada
- [ ] Estados de loading/erro/vazio

## Fase 3 — Frontend

- [ ] Dashboard integrado ao motor real
- [ ] CRUD de apontamentos completo
- [ ] CRUD de colaboradores completo
- [ ] Férias
- [ ] Folgas
- [ ] Feriados
- [ ] Calendário integrado
- [ ] Banco de horas integrado

## Fase 4 — Motor de regras

- [x] Jornada
- [x] Tolerância
- [x] Fechamento inicial
- [x] Compensação/parâmetros do XLS
- [x] Adicional noturno
- [ ] DSR completo
- [ ] Férias homologadas
- [ ] Folgas homologadas
- [ ] Feriados homologados
- [ ] Fechamento homologado contra XLS

## Fases 5–20

Ainda pendentes: API/banco persistente, autenticação, permissões, auditoria, fechamento operacional, relatórios/exportação, importação definitiva, CI/CD completo, segurança de produção, responsividade, PWA, performance, homologação e release v1.0.

## Regra de homologação

Nenhuma regra de negócio deve ser marcada como definitiva quando houver divergência ou ambiguidade em relação ao XLS de referência. Regras não especificadas devem permanecer configuráveis e documentadas como pendentes.
