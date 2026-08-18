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
- Colaboradores
- Relatórios
- Configurações

## Execução
Abra `index.html` em um navegador ou publique o repositório como site estático.

## Dados
A primeira versão usa `localStorage` para persistência local no navegador. O GitHub guarda o código-fonte e versões do sistema; não é usado como banco de dados operacional.

## Próximas evoluções
1. Validar todas as regras da planilha.
2. Separar frontend, domínio e persistência.
3. Criar backend e banco de dados para múltiplos usuários.
4. Autenticação e perfis.
5. Cálculo automático de horas, extras, débitos, tolerância e compensações.
6. Calendário integrado com férias, folgas e feriados.
7. Relatórios PDF/XLSX.
8. Testes automatizados e CI.
