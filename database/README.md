# Banco PostgreSQL

A migration `001_initial.sql` cria o schema inicial da v1.0.

## Ordem lógica

1. usuarios
2. colaboradores
3. apontamentos
4. ferias
5. folgas
6. feriados
7. atestados
8. ajustes
9. fechamentos
10. auditoria
11. configuracoes

## Regras estruturais

- `colaboradores.usuario_id` é opcional e único.
- Um colaborador não pode ter dois apontamentos no mesmo dia.
- Uma folga não pode ser duplicada para o mesmo colaborador/data.
- Uma competência só pode ser fechada uma vez por colaborador.
- Férias e atestados não aceitam intervalo com fim anterior ao início.
- Valores de auditoria são armazenados como `JSONB`.
- Índices são criados para as consultas por colaborador, competência, data e auditoria.

A migration deve ser aplicada em um PostgreSQL de desenvolvimento antes da produção. Credenciais não devem ser armazenadas no repositório.
