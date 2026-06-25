# Mini Documentacao - Integracao Universal Editor (POC)

## Objetivo

Padronizar uma implementacao minima e replicavel de integracao com Universal Editor em projetos AEM.

## Escopo desta POC

- AEM local (Author) com componentes instrumentados para Universal Editor.
- Servico local do Universal Editor executando via arquivo `universal-editor-service.cjs`.
- Fluxo de validacao tecnica da integracao.

## O que foi implementado

### 1) Servico local do Universal Editor

- Arquivo do servico adicionado ao projeto:
  - `tools/universal-editor/universal-editor-service.cjs`
- Healthcheck utilizado:
  - `http://localhost:8080/ping`

### 2) Automacao no VS Code (tasks)

- Task para subir apenas o servico local:
  - `AEM: Universal Editor Service (Local)`
- Task para servico + deploy no Author:
  - `AEM: UE Local + Deploy (POC)`
- Arquivo:
  - `.vscode/tasks.json`

### 3) CORS no Author

- Inclusao de origens locais para o servico:
  - `http://localhost:8080`
  - `http://127.0.0.1:8080`
- Arquivo:
  - `config/src/main/content/jcr_root/apps/alelo/osgiconfig/config.author/com.adobe.granite.cors.impl.CORSPolicyImpl~alelo.cfg.json`

### 4) Instrumentacao de pagina (head)

- Inclusao do script CORS oficial do Universal Editor.
- Inclusao de meta tags de conexao:
  - `urn:adobe:aue:system:aemconnection`
  - `urn:adobe:aue:config:service`
- Arquivos:
  - `apps/src/main/content/jcr_root/apps/alelo/components/page/customheaderlibs.html`
  - `apps/src/main/content/jcr_root/apps/alelo/components/xfpage/customheaderlibs.html`

### 5) Instrumentacao de componentes

- Componente customizado (Hello World) com `data-aue-resource`, `data-aue-type` e `data-aue-prop`.
- Componentes base instrumentados para cobertura de pagina:
  - `title`
  - `text`
  - `container`
- Arquivos:
  - `apps/src/main/content/jcr_root/apps/alelo/components/helloworld/helloworld.html`
  - `apps/src/main/content/jcr_root/apps/alelo/components/title/title.html`
  - `apps/src/main/content/jcr_root/apps/alelo/components/text/text.html`
  - `apps/src/main/content/jcr_root/apps/alelo/components/container/container.html`

### 6) Mapeamento de abertura por resourceType

- Configuracao para abrir conteudos especificos no fluxo Universal Editor:
  - `alelo/components/page`
  - `alelo/components/xfpage`
- Arquivo:
  - `config/src/main/content/jcr_root/apps/alelo/osgiconfig/config.author/com.day.cq.wcm.core.impl.AuthoringUIModeServiceImpl.cfg.json`

## Como replicar em outros projetos (arquiteturas distintas)

### Passo A - Servico local

1. Adicionar o arquivo do servico local ao projeto.
2. Criar task/comando para subir o servico.
3. Confirmar `GET /ping` retornando `200`.

### Passo B - CORS

1. Liberar no Author as origens do servico local.
2. Restringir paths conforme escopo do projeto (`/content`, `/conf` etc.).

### Passo C - Instrumentacao no head

1. Incluir script:
   - `https://universal-editor-service.adobe.io/cors.js`
2. Incluir meta de conexao AEM:
   - `urn:adobe:aue:system:aemconnection`
3. Incluir meta de endpoint do servico:
   - `urn:adobe:aue:config:service`

### Passo D - Instrumentacao de componentes

1. Em cada componente editavel, adicionar:
   - `data-aue-resource` (apontando para o recurso persistente)
   - `data-aue-type` (`component`, `container`, `text`, `richtext`, etc.)
   - `data-aue-prop` para propriedades editaveis
2. Priorizar primeiro componentes estruturais:
   - Page, Container, Title, Text

### Passo E - Mapeamento de abertura

1. Configurar `AuthoringUIModeService` por `resourceType` ou path.
2. Definir quais tipos devem abrir no fluxo Universal Editor.

## Checklist de validacao (replicavel)

1. Servico local ativo: `curl -i http://localhost:8080/ping`
2. Deploy concluido no Author sem erro.
3. HTML renderizado contem:
   - metas `urn:adobe:aue:*`
   - atributos `data-aue-*`
4. OSGi contem `resourceTypes.universal` para os tipos alvo.

## Limites importantes

- O arquivo local do servico nao substitui a UI oficial do Universal Editor.
- Sem Adobe ID/permissao no produto, nao ha acesso completo a interface oficial do Universal Editor.
- Sem login, a POC cobre integracao tecnica (instrumentacao + persistencia), nao a experiencia completa da UI oficial.

## Resultado desta POC

- Projeto ficou UE-ready no nivel tecnico (instrumentacao, servico local, mapeamento, CORS).
- Estrutura pronta para reaproveitamento em projetos AEM headful, headless ou hibridos com ajustes minimos de paths/resourceTypes.
