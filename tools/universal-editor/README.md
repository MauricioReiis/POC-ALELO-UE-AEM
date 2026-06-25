# Serviço Universal Editor Local (POC)

Este diretório contém o serviço local do Universal Editor fornecido pela Adobe:

- `universal-editor-service.cjs`

## Onde colocar o arquivo

Esse arquivo **não** deve ir para `apps` nem para `core`.
Ele deve rodar como um processo Node separado (ferramenta local).

## Pré-requisitos

- Node.js instalado (`node -v`)
- AEM Author local em execução (`http://localhost:4502`)

## Como iniciar

**Opção 1 (VS Code Task):**

- Execute a tarefa `AEM: Universal Editor Service (Local)`
- Ou execute a tarefa `AEM: UE Local + Deploy (POC)` para subir o serviço e fazer deploy no author em uma única execução

**Opção 2 (terminal):**

```bash
node tools/universal-editor/universal-editor-service.cjs
```

Ao subir corretamente, o log deve mostrar:

`Universal Editor Service listening on port 8080 as HTTP Server`

**Teste rápido:**

```bash
curl -i http://localhost:8080/ping
```

Retorno esperado: `HTTP/1.1 200 OK`

## Conectar ao AEM local

1. Suba/deploy o projeto no author local:

```bash
mvn clean install -PautoInstallSinglePackage
```

2. Confirme que a página abre no author:

- `http://localhost:4502/editor.html/content/alelo/us/en.html`

3. Deixe o Universal Editor Service ativo na porta `8080`.

4. CORS do author:

- A configuração em `config` foi ajustada para aceitar as origens:
  - `http://localhost:8080`
  - `http://127.0.0.1:8080`

## O que foi implementado na POC

### 1) Serviço local do Universal Editor

- Arquivo do serviço adicionado ao projeto:
  - `tools/universal-editor/universal-editor-service.cjs`
- Healthcheck utilizado:
  - `http://localhost:8080/ping`

### 2) Automação no VS Code (tarefas)

- Tarefa para subir somente o serviço local:
  - `AEM: Universal Editor Service (Local)` em `.vscode/tasks.json`
- Tarefa combinada para serviço + deploy:
  - `AEM: UE Local + Deploy (POC)` em `.vscode/tasks.json`

### 3) CORS no Author

- Inclusão de origens locais para o serviço:
  - `http://localhost:8080`
  - `http://127.0.0.1:8080`
- Arquivo:
  - `config/src/main/content/jcr_root/apps/alelo/osgiconfig/config.author/com.adobe.granite.cors.impl.CORSPolicyImpl~alelo.cfg.json`

### 4) Instrumentação de página (head)

- Inclusão do script CORS oficial do Universal Editor
- Inclusão de meta tags de conexão:
  - `urn:adobe:aue:system:aemconnection`
  - `urn:adobe:aue:config:service`
- Arquivos:
  - `apps/src/main/content/jcr_root/apps/alelo/components/page/customheaderlibs.html`
  - `apps/src/main/content/jcr_root/apps/alelo/components/xfpage/customheaderlibs.html`

### 5) Instrumentação de componentes

- Componente customizado (Hello World) com `data-aue-resource`, `data-aue-type` e `data-aue-prop`
- Componentes base instrumentados para cobertura de página:
  - `title`
  - `text`
  - `container`
- Arquivos:
  - `apps/src/main/content/jcr_root/apps/alelo/components/helloworld/helloworld.html`
  - `apps/src/main/content/jcr_root/apps/alelo/components/title/title.html`
  - `apps/src/main/content/jcr_root/apps/alelo/components/text/text.html`
  - `apps/src/main/content/jcr_root/apps/alelo/components/container/container.html`

### 6) Mapeamento de abertura por resourceType

- Configuração para abrir conteúdos específicos no fluxo Universal Editor:
  - `alelo/components/page`
  - `alelo/components/xfpage`
- Arquivo:
  - `config/src/main/content/jcr_root/apps/alelo/osgiconfig/config.author/com.day.cq.wcm.core.impl.AuthoringUIModeServiceImpl.cfg.json`

## Como replicar em outros projetos (arquiteturas distintas)

### Passo A - Serviço local

1. Adicionar o arquivo do serviço local ao projeto
2. Criar tarefa/comando para subir o serviço
3. Confirmar `GET /ping` retornando `200`

### Passo B - CORS

1. Liberar no Author as origens do serviço local
2. Restringir paths conforme escopo do projeto (`/content`, `/conf` etc.)

### Passo C - Instrumentação no head

1. Incluir script:
   - `https://universal-editor-service.adobe.io/cors.js`
2. Incluir meta de conexão AEM:
   - `urn:adobe:aue:system:aemconnection`
3. Incluir meta de endpoint do serviço:
   - `urn:adobe:aue:config:service`

### Passo D - Instrumentação de componentes

1. Em cada componente editável, adicionar:
   - `data-aue-resource` (apontando para o recurso persistente)
   - `data-aue-type` (`component`, `container`, `text`, `richtext`, etc.)
   - `data-aue-prop` para propriedades editáveis
2. Priorizar primeiro componentes estruturais:
   - Page, Container, Title, Text

### Passo E - Mapeamento de abertura

1. Configurar `AuthoringUIModeService` por `resourceType` ou path
2. Definir quais tipos devem abrir no fluxo Universal Editor

## Checklist de validação (replicável)

1. Serviço local ativo: `curl -i http://localhost:8080/ping`
2. Deploy concluído no Author sem erro
3. HTML renderizado contém:
   - metas `urn:adobe:aue:*`
   - atributos `data-aue-*`
4. OSGi contém `resourceTypes.universal` para os tipos alvo

## Limitações importantes

- O arquivo local do serviço não substitui a UI oficial do Universal Editor
- Sem Adobe ID/permissão no produto, não há acesso completo a interface oficial do Universal Editor
- Sem login, a POC cobre integração técnica (instrumentação + persistência), não a experiência completa da UI oficial

## Resultado desta POC

- Projeto ficou UE-ready no nível técnico (instrumentação, serviço local, mapeamento, CORS)
- Estrutura pronta para reaproveitamento em projetos AEM headful, headless ou híbridos com ajustes mínimos de paths/resourceTypes
