# Comandos do Projeto (Requiem)

Este documento descreve os comandos configurados no `package.json` para facilitar o desenvolvimento, testes isolados e geração de pacotes do projeto.

---

## 1. Executando Localmente (Desenvolvimento e Testes Seguros)

### `npm start` ou `npm run dev`
- **Função**: Inicia o programa localmente em **Modo de Desenvolvimento Seguro** (Padrão).
- **O que faz**: Inicia o servidor local do Vite carregando as credenciais de teste (`.env.development.local`) e abre o Electron com Hot-Reload. Qualquer modificação de dados interage com o Firebase de desenvolvimento (`requiem-dev`) e com o banco SQLite isolado em `./dev-data/requiem.db`.
- **Indicador Visual**: Exibe o badge animado `[DEV (requiem-dev)]` no cabeçalho e detalhamento de ambiente no painel de configurações.

### `npm run dev:web`
- **Função**: Inicia a versão Web/PWA em modo de desenvolvimento seguro (porta 5174).

---

## 2. Executando Localmente em Modo de Produção (Atenção / Uso Consciente)

### `npm run start:prod` ou `npm run dev:prod`
- **Função**: Inicia o programa localmente carregando o ambiente de **Produção**.
- **O que faz**: Inicia o servidor local do Vite carregando as credenciais de produção reais (`.env.production.local`) e abre o Electron. Ideal para verificar bugs específicos de produção, mas **atenção**: alterações de dados afetarão a base de produção (`requiem-4886d`).

### `npm run dev:web:prod`
- **Função**: Inicia a versão Web/PWA carregando as credenciais de produção.

---

## 3. Gerando Pacotes de Produção

### `npm run dist` (ou `npm run build`)
- **Função**: Gera o instalador final de produção para Desktop (Windows/Linux/Mac).
- **O que faz**: Compila os arquivos web em modo de produção (com credenciais do `requiem-4886d`) e os empacota via `electron-builder`.
- **Saída**: Os arquivos instaláveis finais ficarão na pasta `dist/desktop`.

### `npm run apk`
- **Função**: Gera o APK final de produção para Android.
- **O que faz**: Compila os arquivos web em modo de produção, sincroniza com o Capacitor e compila a build no Android usando o `google-services.json` de produção (`src/release/`).
- **Saída**: O APK de produção (`requiem.apk`) ficará na pasta `dist/mobile`.

---

## 4. Gerando Pacotes de Desenvolvimento / Testes

### `npm run dist:dev` (ou `npm run build:dev`)
- **Função**: Gera o instalador de desenvolvimento para Desktop.
- **O que faz**: Compila os arquivos web em modo de desenvolvimento (com chaves de teste `requiem-dev`) e os empacota.
- **Saída**: Os arquivos de teste ficarão na pasta `dist/desktop`.

### `npm run apk:dev` (ou `npm run dist apk dev`)
- **Função**: Gera o APK de testes/desenvolvimento para Android.
- **O que faz**: Compila os arquivos web em modo de desenvolvimento, sincroniza com o Capacitor e compila a build no Android usando o `google-services.json` de testes (`src/debug/`).
- **Saída**: O APK de testes (`requiem-dev.apk`) ficará na pasta `dist/mobile`.

---

## 5. Gerenciamento do Firebase CLI & Segurança do Banco

Graças aos aliases configurados no `.firebaserc`, você pode alternar e implantar regras de segurança no Firestore sem risco de afetar a base errada:

### Alternar Projeto Ativo no CLI:
- **Selecionar Ambiente de Teste**:
  ```bash
  npm run firebase:use:dev
  ```
- **Selecionar Ambiente de Produção**:
  ```bash
  npm run firebase:use:prod
  ```

### Deploy de Regras de Segurança (`firestore.rules`):
- **Deploy no Firebase de Desenvolvimento (`requiem-dev`)**:
  ```bash
  npm run firebase:deploy:rules:dev
  ```
- **Deploy no Firebase de Produção (`requiem-4886d`)**:
  ```bash
  npm run firebase:deploy:rules:prod
  ```

### Firebase Local Emulator Suite:
- **Iniciar Emuladores Locais (Auth e Firestore)**:
  ```bash
  npm run firebase:emulators
  ```
  *(Inicia uma cópia offline no seu computador em `http://localhost:4000`)*