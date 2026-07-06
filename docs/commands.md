# Comandos do Projeto (Requiem)

Este documento descreve os comandos configurados no `package.json` para facilitar o desenvolvimento e a construção do projeto.

## 1. `npm start`
- **Função**: Inicia o programa via terminal em modo de desenvolvimento.
- **O que faz**: Executa simultaneamente o servidor do Vite (para o Frontend) e compila/inicia o processo do Electron (para o Backend), permitindo o desenvolvimento com Hot-Reload.

## 2. `npm run dist`
- **Função**: Gera a build de produção para o Desktop (Windows/Linux/Mac).
- **O que faz**: Compila os arquivos web via Vite, compila o backend Node.js via TypeScript e, em seguida, executa o `electron-builder` para empacotar a aplicação em um instalador.
- **Saída**: A build finalizada ficará armazenada na pasta `dist/desktop`.

## 3. `npm run dist apk`
- **Função**: Gera a build do aplicativo móvel (APK para Android).
- **O que faz**: Sincroniza os arquivos web com o Capacitor, utiliza o Gradle para compilar o projeto Android (debug APK) e, por fim, copia o arquivo gerado para o diretório de destino.
- **Saída**: O APK final (`requiem.apk`) ficará armazenado na pasta `dist/mobile`.

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