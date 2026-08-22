# Análise da planilha `Apontamento.xls`

**Data da análise:** 22/08/2026

## Fonte

Arquivo original `Apontamento.xls`, convertido localmente para leitura sem alterar o arquivo-fonte.

## Estrutura encontrada

- `Plan1`: registro mensal de horas e parâmetros da jornada.
- `Plan2`: tabela mensal de dias úteis e domingos/feriados para base de DSR.
- `Plan3`: vazia.

## Parâmetros identificados em `Plan1`

| Parâmetro | Valor encontrado | Uso previsto no sistema |
|---|---:|---|
| Carga horária mensal | 220:00 | parâmetro de jornada mensal |
| Carga diária seg/qui | 09:00 | jornada prevista de segunda a quinta |
| Carga diária sexta | 08:00 | jornada prevista de sexta |
| Expediente sábado | 00:00 | sábado sem jornada padrão |
| Tolerância | 00:15 | tolerância de apuração |

## Campos de registro identificados

A planilha contém, entre outros, os campos/conceitos:

- Data
- Ocorrência
- Entrada
- Saída
- Segunda entrada/saída (intervalo)
- Horas totais
- Horas extras
- Faltas e atrasos
- Dias trabalhados
- Horas extras acumuladas
- AD NOT / adicional noturno

Também aparecem ocorrências como `Normal` e `Folga`.

## Exemplo observado na planilha

Em 02/01/2012, o registro mostra entrada às 07:20, saída às 12:00, retorno às 13:00 e saída às 17:00, totalizando 08:40. A planilha apresenta 00:20 na coluna relacionada a faltas/atrasos/variação, indicando que o motor precisa separar claramente **horas trabalhadas**, **jornada prevista** e **crédito/débito**.

Em 04/01/2012, o total observado é 11:00, com 02:00 de horas extras.

Em 05/01/2012, o total observado é 15:15, com componentes de horas extras e adicional noturno.

## Regra de implementação

Os parâmetros acima foram incorporados ao `APP_CONFIG.xlsRules`, mas **não foram usados para inventar regras que a planilha não demonstra**. O motor definitivo deverá ser validado contra mais linhas da planilha antes do fechamento da v1.0.

## Plan2 — DSR

A segunda aba contém a tabela de 2011 com meses, dias úteis e domingos/feriados para base de cálculo de DSR. Isso deve ser modelado como tabela/calendário de referência, e não como regra fixa de um único ano.

## Pendências de homologação do XLS

1. Comparar todas as fórmulas relevantes do arquivo original.
2. Reproduzir os exemplos de horas extras e adicional noturno no motor web.
3. Definir exatamente a regra de tolerância.
4. Definir a regra de ocorrências `Normal`, `Folga` e demais códigos existentes.
5. Validar DSR por competência.
6. Criar importador XLS/XLSX com prévia e validação antes de gravar.

## Decisão aplicada

A planilha passa a ser uma **fonte de validação das regras de negócio**. O arquivo original não será armazenado no repositório como banco operacional e dados pessoais/salariais não devem ser versionados no GitHub.
