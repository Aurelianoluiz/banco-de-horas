# Análise do `Apontamento.xls`

Fonte: arquivo fornecido para a implementação do Banco de Horas.

## 1. Inventário

| Aba | Situação | Observação |
|---|---|---|
| `Plan1` | usada | cadastro/parâmetros + apontamentos diários + resumo mensal + tabelas de apoio |
| `Plan2` | usada | tabela auxiliar de dias úteis e domingos/feriados para DSR, ano 2011 |
| `Plan3` | vazia | sem dados |

A `Plan1` possui 71 linhas e 28 colunas na versão analisada.

## 2. Parâmetros encontrados em `Plan1`

| Célula | Campo | Valor observado |
|---|---|---|
| `S3` | início do período | 01/01/2012 |
| `S5` | fim do período | 31/01/2012 |
| `H5` | salário mensal | 0 |
| `N5` | carga mensal | 220 horas |
| `N7` | carga diária seg/qui | 09:00 |
| `N9` | carga diária sexta | 08:00 |
| `I9` | expediente sábado | 00:00 |
| `T9` | tolerância | 00:15 |
| `Q12` | limite da primeira faixa de hora extra | 02:00 |

`I7` calcula o valor-hora como salário mensal dividido pela carga mensal, arredondado para 2 casas.

## 3. Estrutura diária

A tabela começa na linha 13 e usa:

- `C`: Data
- `D`: dia da semana calculado por `WEEKDAY`
- `F`: ocorrência
- `G`: marcador de feriado
- `H`: entrada 1
- `I`: saída 1
- `J`: entrada 2
- `K`: saída 2
- `L`: horas totais
- `N`: horas extras total
- `O`: faltas e atrasos
- `P`: dias trabalhados
- `Q`: horas extras faixa 0,5
- `R`: horas extras faixa 0,8
- `S`: horas extras faixa 1,5
- `T`: adicional noturno

As ocorrências aceitas pela fórmula principal são:

`-`, `Normal`, `Feriado`, `Folga`, `Justificado`, `Férias`, `Falta`.

## 4. Regra de horas totais

Para `Normal`, `Feriado` e `Justificado`, a fórmula soma dois intervalos:

`MOD(saída2 - entrada2, 1) + MOD(saída1 - entrada1, 1)`.

Para `Folga`, a carga utilizada é derivada do dia da semana:

- domingo: carga de sexta (`N9` na fórmula existente);
- sábado: carga de sexta (`N9`);
- demais dias: carga seg/qui (`N7`).

Para `Férias` e `Falta`, a fórmula retorna zero.

**Observação importante:** a fórmula da planilha tem particularidades de modelagem para `Folga`; elas devem ser preservadas/validadas antes de simplificar o comportamento no sistema.

## 5. Horas extras

A coluna `N` considera como hora extra a diferença entre as horas totais e a carga do dia.

Para:

- `Feriado`, `Folga` e `Férias`: todo o total lançado pode virar hora extra;
- domingo: a comparação usa `I9`;
- sábado: a comparação usa `N9`;
- segunda a quinta: a comparação usa `N7`;
- `Justificado` e algumas linhas sem apontamento são excluídas.

A planilha ainda divide as horas extras em três faixas:

- `Q`: 0,5;
- `R`: 0,8;
- `S`: 1,5.

`Q12 = 02:00` funciona como corte da primeira faixa. A segunda faixa desconta essas duas horas e a terceira faixa captura horas de feriados/folgas conforme a fórmula.

## 6. Tolerância e faltas/atrasos

A célula `T9` define tolerância de 15 minutos.

A fórmula de `O` considera débito quando as horas ficam abaixo da carga diária menos a tolerância. Domingo, folga, feriado, férias e justificado não geram esse débito.

Isso significa que a regra não é simplesmente `horas trabalhadas - horas previstas`: existe uma janela de tolerância de 15 minutos aplicada antes de registrar a falta/atraso.

## 7. Adicional noturno

A planilha calcula o adicional noturno pela interseção dos períodos trabalhados com uma janela auxiliar localizada em `AA27:AB27`.

Na cópia analisada:

- início: `22:00`;
- término: `05:00`.

As colunas `W` e `X` calculam a interseção para os dois períodos de trabalho e `T` soma essas parcelas.

## 8. Casos reais observados

Alguns registros usados como referência:

| Data | Ocorrência | Jornada | Total | Extra total | Extra 1,5 | Noturno |
|---|---|---|---:|---:|---:|---:|
| 02/01/2012 | Normal | 07:20–12:00 / 13:00–17:00 | 08:40 | — | — | — |
| 03/01/2012 | Normal | 07:00–12:00 / 13:00–17:00 | 09:00 | — | — | — |
| 04/01/2012 | Normal | 07:00–12:00 / 13:00–19:00 | 11:00 | 02:00 | 02:00 | — |
| 05/01/2012 | Normal | 07:00–12:00 / 13:00–23:15 | 15:15 | 06:15 | 02:00 | 01:15 |
| 07/01/2012 | Normal | 07:50–12:00 / 13:00–16:00 | 07:10 | 07:10 | — | — |
| 23/01/2012 | Normal | 07:15–12:00 / 13:02–18:25 | 10:08 | 01:08 | — | — |
| 25/01/2012 | Normal | 07:10–12:00 / 13:00–23:00 | 14:50 | 05:50 | 02:00 | 01:00 |

Esses casos devem permanecer como fixtures de regressão do motor.

## 9. Resumo mensal observado

A planilha mostra:

- 26 dias úteis;
- 28 dias trabalhados;
- horas extras nas faixas 0,5 / 0,8 / 1,5;
- adicional noturno;
- DSR;
- bruto a pagar;
- valor perdido por faltas e atrasos.

Os valores calculados na cópia analisada incluem aproximadamente:

- horas extras 0,5: `08:08`;
- horas extras 0,8: `16:15`;
- horas extras 1,5: `13:25`;
- adicional noturno: `02:15`;
- DSR: `4 dias` e `32:00`;
- faltas/atrasos: `00:20`.

Os valores acima são **resultado da planilha fornecida**, não regras inventadas pelo sistema.

## 10. `Plan2`

`Plan2` contém uma tabela auxiliar de 2011 com:

- Janeiro: 25 dias úteis / 6 domingos e feriados;
- Fevereiro: 23 / 5;
- Março: 27 / 4;
- Abril: 24 / 6;
- Maio: 25 / 6;
- Junho: 25 / 5;
- Julho: 27 / 4;
- Agosto: 26 / 5;
- Setembro: 25 / 5;
- Outubro: 24 / 6;
- Novembro: 24 / 6;
- Dezembro: 26 / 5.

A tabela deve ser tratada como dado auxiliar histórico e não como calendário oficial atual.

## 11. Mapeamento para o sistema

| XLS | Domínio | Tela/relatório |
|---|---|---|
| Nome | `colaboradores.nome` | Colaboradores |
| Salário mês | `colaboradores.salario` | Colaboradores |
| Carga mensal | `configuracoes.cargaMensal` | Configurações |
| Carga seg/qui | `colaboradores.jornada.segQui` | Colaboradores |
| Carga sexta | `colaboradores.jornada.sexta` | Colaboradores |
| Tolerância | `colaboradores.jornada.tolerancia` | Colaboradores/Configurações |
| Data | `apontamentos.data` | Apontamentos/Calendário |
| Ocorrência | `apontamentos.ocorrencia` | Apontamentos |
| Entrada/Saída | `apontamentos` | Apontamentos |
| Horas totais | campo calculado | Apontamentos/Relatórios |
| Horas extras | campo calculado | Banco/Relatórios |
| Faltas/Atrasos | campo calculado | Relatórios |
| Adicional noturno | campo calculado | Relatórios |
| Fechamento/resumo | `fechamentos` | Banco/Relatórios |

## 12. Importação implementada

O parser em `importadores/apontamento-xls.js` faz:

1. leitura da `Plan1`;
2. identificação dos parâmetros;
3. leitura das linhas 15 em diante;
4. validação das ocorrências;
5. validação de datas e horários;
6. extração do resumo mensal;
7. geração de diagnóstico com erros e avisos;
8. conversão para registros do domínio.

A importação foi desenhada para **analisar antes de gravar**, conforme o roadmap.

## 13. Pendências de validação

Antes de declarar as regras 100% fechadas:

- validar a fórmula de DSR em todos os meses;
- validar as três faixas de adicional das horas extras;
- validar o adicional noturno em virada de dia;
- validar `Folga` com e sem apontamento;
- validar `Feriado` com apontamento;
- validar `Férias`, `Justificado` e `Falta`;
- comparar o saldo acumulado da planilha com o motor do sistema.

Essas pendências são intencionais: a planilha contém fórmulas históricas específicas e o sistema não deve substituí-las por uma regra presumida sem casos de validação.
