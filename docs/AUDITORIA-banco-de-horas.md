# Auditoria técnica — banco-de-horas

**Data:** 22/08/2026  
**Fonte:** auditoria enviada pelo usuário e arquivos do pacote `banco-de-horas-corrigido.zip`.

## Resultado aplicado ao repositório

A auditoria identificou que o pacote tinha pontos corretos e também inconsistências. Em vez de substituir cegamente o repositório por um pacote que ainda continha falhas conhecidas, foram aplicadas as correções de auditoria diretamente no `main`.

### Correções aplicadas

1. **Frontend unificado:** `index.html` deixou de executar uma segunda aplicação inline e passou a carregar `app.js` como fonte principal da interface.
2. **Persistência alinhada:** `app-config.js` passou a usar a mesma chave `BH_DB_V5` do frontend principal.
3. **Fechamento mensal:** padronizado `colaboradorId` e corrigido o teste correspondente.
4. **Servidor local:** removida a importação de `./api/application.js`, que não existia no pacote; `server.js` agora serve a aplicação estática e fornece `/health` para homologação do frontend.
5. **PWA/service worker:** removidas referências a arquivos inexistentes; o cache agora aponta para arquivos realmente presentes no repositório.
6. **CI:** além de sintaxe e testes, o workflow inicia o servidor, verifica `/health` e executa smoke test da página e do `app.js`.
7. **NPM:** adicionados `npm start` e validação de sintaxe do servidor.

## Limitações que permanecem

A auditoria também identificou funcionalidades que não devem ser simuladas como concluídas:

- API REST real ainda não está implementada.
- PostgreSQL e schema de produção ainda não estão no repositório.
- Login, JWT e RBAC ainda não estão implementados.
- Persistência atual é localStorage e não deve receber dados reais sensíveis em produção.
- Férias, folgas e calendário ainda precisam de integração completa com a UI.
- Importação XLS/XLSX e relatórios PDF/XLSX ainda precisam de implementação/homologação.
- O XLS original do usuário precisa ser disponibilizado para validação das regras; não foram inventadas regras ausentes na fonte.

## Critério de v1.0

A versão 1.0 somente deverá ser liberada depois de: unificação das regras, CRUD completo, persistência real, autenticação, permissões, auditoria, importação da planilha, relatórios, testes, CI/CD e homologação.

## Regra de segurança

Senhas, tokens, `DATABASE_URL` e outros segredos não devem ser gravados no GitHub. Dados de colaboradores e salários não devem ser usados como banco operacional do repositório.
