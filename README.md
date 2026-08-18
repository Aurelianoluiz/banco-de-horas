# Banco de Horas

Aplicação web para gestão de jornada, banco de horas, férias e folgas.

## Objetivo
Transformar a estrutura da planilha `Apontamento.xls` em uma aplicação web moderna, preservando os conceitos de carga diária/mensal, tolerância, apontamentos, horas extras, faltas/atrasos e acumulados.

## Módulos
- Dashboard
- Apontamentos
- Banco de Horas
- Calendário
- Férias
- Folgas
- Atestados
- Ajustes
- Colaboradores
- Relatórios
- Configurações

## Estado atual
A interface web já possui navegação por módulos, dashboard, tabelas, modal de apontamento, busca, dados de demonstração e cálculo inicial de jornada. O motor considera entrada, saída, intervalo, carga diária, sábado/domingo e tolerância configurável.

## Dados
A primeira versão usa `localStorage` somente para prototipação. O GitHub guarda o código-fonte e versões do sistema; não é usado como banco de dados operacional.

## Referência do XLS
A planilha `Apontamento.xls` é a fonte de referência funcional deste projeto. A implementação definitiva deve validar as regras da planilha antes do fechamento mensal, principalmente carga horária, tolerância, horas extras, faltas/atrasos, feriados e acumulados.

## Próximas evoluções
1. Importação e validação da estrutura do XLS.
2. CRUD completo de colaboradores, apontamentos, férias e folgas.
3. Banco de dados persistente.
4. Autenticação e perfis de acesso.
5. Fechamento mensal e histórico de saldos.
6. Calendário de feriados configurável.
7. Relatórios PDF/XLSX.
8. Auditoria de alterações.
9. Testes automatizados dos cálculos.
10. Deploy de produção.
