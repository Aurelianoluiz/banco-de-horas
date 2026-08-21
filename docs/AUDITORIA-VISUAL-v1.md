# Auditoria visual e funcional — Banco de Horas v1

## Achados críticos
1. `app.js` usa `banco_horas_v3`, enquanto o HTML atual contém implementação inline com `BH_DB_V5`. Isso cria duas fontes de estado/regras e precisa ser unificado antes da v1.0.
2. O HTML atual ainda marca Férias, Folgas e Calendário como em desenvolvimento; `absence-calendar.js` existe, mas ainda precisa ser conectado à UI.
3. `rules/jornada.js` e `rules/fechamento.js` existem, mas o frontend ainda duplica parte dos cálculos.
4. O CI está configurado para `npm test` e `npm run check`; o status de execução deve ser verificado antes de declarar pipeline verde.
5. Os dados atuais são de demonstração/localStorage; não há persistência multiusuário real.

## Telas auditadas
Dashboard; Apontamentos; Banco de Horas; Calendário; Férias; Folgas; Colaboradores; Relatórios; Configurações; Ajustes; Atestados.

## Critério v1.0
Unificar fonte de dados/regras, conectar CRUD de ausências e calendário, adicionar banco persistente, autenticação, permissões, auditoria, importação XLS, relatórios, testes e deploy verificado.
