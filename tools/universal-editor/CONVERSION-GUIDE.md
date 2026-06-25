# Guia de Conversão de Componentes UE

## Objetivo

Manter componentes do Universal Editor manteníveis com uma estrutura semelhante a React:
- uma pasta por componente
- arquivos independentes: HTML + model JSON + definition JSON + CSS
- registros UE compartilhados globalmente para carregamento em tempo de execução

## Padrão de Pasta

- Implementação do componente:
  - `apps/src/main/content/jcr_root/apps/alelo/components/ue/<componente>/`
    - `.content.xml`
    - `<componente>.html`
    - `ue.model.json`
    - `ue.definition.json`

- Registros de tempo de execução do UE:
  - `apps/src/main/content/jcr_root/apps/alelo/components/universal-editor/models.json`
  - `apps/src/main/content/jcr_root/apps/alelo/components/universal-editor/component-definition.json`
  - `apps/src/main/content/jcr_root/apps/alelo/components/universal-editor/filter-definition.json`

- Estilos:
  - CSS do componente: `apps/src/main/content/jcr_root/apps/alelo/clientlibs/clientlib-base/css/components/`
  - Saída de sincronização do DS: `apps/src/main/content/jcr_root/apps/alelo/clientlibs/clientlib-base/css/vendor/`

## Fluxo de Conversão

1. Criar pasta do componente em `components/ue/<componente>`.
2. Converter estrutura React para HTL (`<componente>.html`) mantendo nomes de campos estáveis.
3. Criar `ue.model.json` com campos autorizáveis.
4. Criar `ue.definition.json` com `resourceType` e template padrão.
5. Registrar model + componente nos registros UE compartilhados.
6. Adicionar CSS do componente em `clientlib-base/css/components/` e incluir em `css.txt`.
7. Se necessário, adicionar nó de conteúdo de exemplo em `content` para testes de autoria rápida.

## Sincronização do Design System

Use o script de sincronização antes de builds quando @rango é atualizado:

`node tools/universal-editor/sync-rango-design-system.cjs`

Ou execute a tarefa do VS Code:

`AEM: Sync Rango Design System`

O script atualiza:
- CSS principal
- CSS de tokens globais
- ativos de fontes

de:
- `.../libs/@rango/core/dist`
- `.../libs/@rango/tokens/dist`

para a pasta de vendor da clientlib AEM.
