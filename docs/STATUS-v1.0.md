# Status oficial — Banco de Horas v1.0

**Atualizado:** 22/08/2026

| Etapa | Status |
|---|---|
| Repositório exclusivo | 🟢 Concluído |
| Auditoria técnica | 🟢 Concluído |
| Auditoria visual | 🟢 Concluído |
| Sidebar minimalista | 🟢 Concluído |
| Estrutura Web/PWA | 🟢 Concluído |
| CI/CD | 🟡 Configurado; execução deve ser homologada |
| Segurança/CodeQL/Dependabot | 🟢 Configurado |
| Dashboard | 🟡 Parcial |
| Apontamentos | 🟡 Parcial |
| Colaboradores | 🟡 Parcial |
| Motor de jornada | 🟡 Parcial |
| Banco de horas | 🟡 Parcial |
| Tolerância | 🟡 Parâmetro identificado; regra completa pendente |
| Férias | 🟠 Em desenvolvimento |
| Folgas | 🟠 Em desenvolvimento |
| Feriados | 🟠 Em desenvolvimento |
| Calendário | 🟠 Em desenvolvimento |
| Atestados | 🔴 Pendente |
| Fechamento mensal | 🟡 Parcial |
| Relatórios | 🔴 Pendente |
| PDF/XLSX | 🔴 Pendente |
| Importação XLS/XLSX | 🔵 Bloqueado para homologação completa |
| Banco/API real | 🔴 Pendente |
| Login/RBAC | 🔴 Pendente |
| Auditoria de usuário | 🔴 Pendente |
| Homologação | 🔴 Pendente |
| Release v1.0 | 🔴 Pendente |

## Novas evidências aplicadas

A análise do `Apontamento.xls` confirmou na `Plan1` os parâmetros: 220 horas/mês, 09:00 de segunda a quinta, 08:00 na sexta, sábado 00:00 e tolerância de 00:15. Eles foram registrados em `app-config.js` e documentados em `docs/ANALISE-Apontamento-XLS.md`.

## Regra de liberação

A v1.0 só será liberada após a integração dos módulos, validação dos cálculos contra o XLS, persistência real, autenticação, permissões, relatórios, testes, CI/CD e homologação.
