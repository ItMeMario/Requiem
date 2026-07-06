# Comandos do Projeto (Requiem)

Este documento descreve os comandos configurados no `package.json` para facilitar o desenvolvimento e a construção do projeto.

## 1. Executando Localmente (Desenvolvimento e Visualização)

### `npm run dev`
- **Função**: Inicia o programa localmente em **Modo de Desenvolvimento / Teste**.
- **O que faz**: Inicia o servidor local do Vite carregando as credenciais de teste (`.env.development.local`) e abre o Electron com Hot-Reload. Qualquer modificação de dados interage com o Firebase de desenvolvimento (`requiem-dev`).

### `npm start`
- **Função**: Inicia o programa localmente em **Modo de Produção**.
- **O que faz**: Inicia o servidor local do Vite carregando as credenciais de produção reais (`.env.production.local`) e abre o Electron. Ideal para simular e testar localmente exatamente o que o usuário final verá em produção.

---

## 2. Gerando Pacotes de Produção

### `npm run dist`
- **Função**: Gera o instalador final de produção para Desktop (Windows/Linux/Mac).
- **O que faz**: Compila os arquivos web em modo de produção (com credenciais do `requiem-4886d`) e os empacota via `electron-builder`.
- **Saída**: Os arquivos instaláveis finais ficarão na pasta `dist/desktop`.

### `npm run apk`
- **Função**: Gera o APK final de produção para Android.
- **O que faz**: Compila os arquivos web em modo de produção, sincroniza com o Capacitor e compila a build no Android usando o `google-services.json` de produção (`src/release/`).
- **Saída**: O APK de produção (`requiem.apk`) ficará na pasta `dist/mobile`.

---

## 3. Gerando Pacotes de Desenvolvimento / Testes

### `npm run dist dev`
- **Função**: Gera o instalador de desenvolvimento para Desktop.
- **O que faz**: Compila os arquivos web em modo de desenvolvimento (com chaves de teste) e os empacota.
- **Saída**: Os arquivos de teste ficarão na pasta `dist/desktop`.

### `npm run apk:dev` (ou `npm run dist apk dev`)
- **Função**: Gera o APK de testes/desenvolvimento para Android.
- **O que faz**: Compila os arquivos web em modo de desenvolvimento, sincroniza com o Capacitor e compila a build no Android usando o `google-services.json` de testes (`src/debug/`).
- **Saída**: O APK de testes (`requiem-dev.apk`) ficará na pasta `dist/mobile`.

---

## 4. Comandos Firebase (Gerenciamento da Nuvem e Emuladores)
Como as ferramentas do Firebase CLI foram instaladas localmente no projeto, você pode gerenciar seu backend de nuvem e rodar o emulador diretamente pelo terminal do IDE usando o prefixo `npx firebase`:

- **Login no Firebase**:
  ```bash
  npx firebase login
  ```
  *(Abre o navegador para autenticar a linha de comando com a sua conta do Google)*

- **Vincular ao seu projeto do Firebase**:
  ```bash
  npx firebase use --add
  ```
  *(Permite selecionar qual dos seus projetos Firebase na nuvem este repositório deve interagir)*

- **Implantar regras de segurança do Firestore (`firestore.rules`) na nuvem**:
  ```bash
  npx firebase deploy --only firestore:rules
  ```
  *(Publica instantaneamente o arquivo `firestore.rules` criado na raiz do seu projeto sem que precise abrir o Console Web do Firebase)*

- **Iniciar o Firebase Local Emulator Suite**:
  ```bash
  npx firebase emulators:start
  ```
  *(Inicia uma cópia offline do Firestore e Auth no seu computador. Permite que você acesse `http://localhost:4000` para gerenciar usuários de teste e documentos localmente)*