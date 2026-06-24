# Universal Editor Service local (POC)

Este diretório contém o serviço local do Universal Editor fornecido pela Adobe:

- `universal-editor-service.cjs`

## Onde colocar o arquivo

Esse arquivo **nao** deve ir para `ui.apps` nem para `core`.
Ele deve rodar como um processo Node separado (ferramenta local).

## Pre-requisitos

- Node.js instalado (`node -v`)
- AEM Author local em execucao (`http://localhost:4502`)

## Como iniciar

Opcao 1 (VS Code Task):

- Execute a task `AEM: Universal Editor Service (Local)`
- Ou execute a task `AEM: UE Local + Deploy (POC)` para subir o servico e fazer deploy no author em uma unica execucao

Opcao 2 (terminal):

```bash
node tools/universal-editor/universal-editor-service.cjs
```

Ao subir corretamente, o log deve mostrar:

`Universal Editor Service listening on port 8080 as HTTP Server`

Teste rapido:

```bash
curl -i http://localhost:8080/ping
```

Retorno esperado: `HTTP/1.1 200 OK`

## Conectar ao AEM local

1. Suba/deploy o projeto no author local:

```bash
mvn clean install -PautoInstallSinglePackage
```

2. Confirme que a pagina abre no author:

- `http://localhost:4502/editor.html/content/alelo/us/en.html`

3. Deixe o Universal Editor Service ativo na porta `8080`.

4. CORS do author:

- A configuracao em `ui.config` foi ajustada para aceitar as origens:
  - `http://localhost:8080`
  - `http://127.0.0.1:8080`

## O que foi implementado na POC

1. Servico local versionado no projeto:

- `tools/universal-editor/universal-editor-service.cjs`

2. Task para subir somente o servico:

- `AEM: Universal Editor Service (Local)` em `.vscode/tasks.json`

3. Task combinada para servico + deploy:

- `AEM: UE Local + Deploy (POC)` em `.vscode/tasks.json`

4. Instrumentacao inicial de componente para Universal Editor:

- Arquivo: `ui.apps/src/main/content/jcr_root/apps/alelo/components/helloworld/helloworld.html`
- Atributos adicionados:
  - `data-aue-resource="urn:aaid:aem:${resource.path}"`
  - `data-aue-type="component"`
  - `data-aue-label="Hello World"`
  - `data-aue-prop="text"` no campo editavel `properties.text`

5. Instrumentacao adicional para componentes base da pagina:

- `ui.apps/src/main/content/jcr_root/apps/alelo/components/title/title.html`
- `ui.apps/src/main/content/jcr_root/apps/alelo/components/text/text.html`
- `ui.apps/src/main/content/jcr_root/apps/alelo/components/container/container.html`

6. Meta tags e script de conexao no `head` da pagina para Universal Editor:

- `ui.apps/src/main/content/jcr_root/apps/alelo/components/page/customheaderlibs.html`
- `ui.apps/src/main/content/jcr_root/apps/alelo/components/xfpage/customheaderlibs.html`

7. Configuracao de modo de abertura por `resourceType`:

- `ui.config/src/main/content/jcr_root/apps/alelo/osgiconfig/config.author/com.day.cq.wcm.core.impl.AuthoringUIModeServiceImpl.cfg.json`
- `authoringUIModeService.editorUrl.universal` configurado para `https://experience.adobe.com/ui#/aem/universal-editor/canvas/`
- Resource types configurados para Universal Editor:
  - `alelo/components/page`
  - `alelo/components/xfpage`

## Validacao rapida

1. Healthcheck do servico local:

```bash
curl -i http://localhost:8080/ping
```

Esperado: `HTTP/1.1 200 OK`

2. Pagina no author:

- `http://localhost:4502/editor.html/content/alelo/us/en.html`

3. Confirmar que o componente de Hello World renderiza na pagina para teste de edicao via UE.

## Importante sobre o layout do editor

Se voce abrir a pagina diretamente em `editor.html`, voce estara no Page Editor classico.

Para usar o Universal Editor:

1. Abra a pagina pelo fluxo de Universal Editor (na abertura por `resourceType` configurada no author), que agora direciona para a UI oficial em `experience.adobe.com`.
2. Garanta que o servico local esteja ativo em `http://localhost:8080`.
3. Garanta que as meta tags `urn:adobe:aue:*` estejam no `head` da pagina renderizada.

Se mesmo assim ainda abrir no editor antigo, a causa mais comum em ambiente local e o endpoint de UI do Universal Editor nao estar disponivel no dominio local do SDK. Nesse caso, a instrumentacao e o backend local continuam corretos, mas a UI do editor precisa ser acessada pelo fluxo suportado na instancia (ou configuracao equivalente no ambiente).

## Observacao importante

Este servico local substitui o backend remoto de servico para a POC.
Dependendo da versao do AEM SDK e do fluxo de uso do Universal Editor, voce ainda pode precisar habilitar instrumentacao de pagina/componentes para edicao universal.
