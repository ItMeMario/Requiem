import { ipcMain, shell } from 'electron';
import crypto from 'crypto';
import http from 'http';
import url from 'url';

export function setupAuthHandlersIpc() {
  // Native Auth (Electron Loopback)
  ipcMain.handle('google-sign-in', async (event, clientId: string) => {
    return new Promise((resolve, reject) => {
      const port = 57233;
      const redirectUri = `http://127.0.0.1:${port}/callback`;
      const nonce = crypto.randomBytes(16).toString('hex');
      const state = crypto.randomBytes(8).toString('hex');

      let server: http.Server | null = null;
      let timeoutId: NodeJS.Timeout | null = null;

      const cleanup = () => {
        if (server) {
          server.close();
          server = null;
        }
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      };

      // Set a 3-minute timeout
      timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error("Login timeout. Please try again."));
      }, 180000);

      server = http.createServer((req, res) => {
        const parsedUrl = url.parse(req.url || '', true);
        const pathname = parsedUrl.pathname;

        if (pathname === '/callback') {
          // Serve JS to extract the hash/fragment and redirect
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Autenticando no Requiem...</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                  background-color: #0a0a0f;
                  color: #d1d1d6;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  height: 100vh;
                  margin: 0;
                }
                .spinner {
                  border: 4px solid rgba(255, 255, 255, 0.1);
                  width: 36px;
                  height: 36px;
                  border-radius: 50%;
                  border-left-color: #00ffff;
                  animation: spin 1s linear infinite;
                  margin-bottom: 20px;
                }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
              </style>
            </head>
            <body>
              <div class="spinner"></div>
              <p>Processando credenciais. Aguarde...</p>
              <script>
                if (window.location.hash) {
                  const params = new URLSearchParams(window.location.hash.substring(1));
                  window.location.href = '/token?' + params.toString();
                } else {
                  document.body.innerHTML = '<p>Erro: Nenhuma credencial recebida de volta do Google.</p>';
                }
              </script>
            </body>
            </html>
          `);
        } else if (pathname === '/token') {
          const idToken = parsedUrl.query.id_token as string;
          
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          if (idToken) {
            res.end(`
              <!DOCTYPE html>
              <html>
              <head>
                <title>Sucesso!</title>
                <style>
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    background-color: #0a0a0f;
                    color: #d1d1d6;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                    text-align: center;
                  }
                  h1 { color: #00ffff; font-weight: 300; }
                </style>
              </head>
              <body>
                <h1>Conectado com Sucesso!</h1>
                <p>O Requiem foi autenticado. Você já pode fechar esta aba e retornar ao aplicativo desktop.</p>
              </body>
              </html>
            `);
            resolve(idToken);
          } else {
            res.end(`
              <!DOCTYPE html>
              <html>
              <head>
                <title>Erro</title>
                <style>
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    background-color: #0a0a0f;
                    color: #d1d1d6;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                  }
                </style>
              </head>
              <body>
                <p>Falha ao obter token. Tente novamente.</p>
              </body>
              </html>
            `);
            reject(new Error("No id_token received."));
          }
          cleanup();
        } else {
          res.writeHead(404);
          res.end();
        }
      });

      server.listen(port, '127.0.0.1', () => {
        // Construct the Google OAuth URL
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
          `client_id=${encodeURIComponent(clientId)}` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}` +
          `&response_type=token%20id_token` +
          `&scope=openid%20profile%20email` +
          `&nonce=${encodeURIComponent(nonce)}` +
          `&state=${encodeURIComponent(state)}` +
          `&prompt=select_account`;

        shell.openExternal(authUrl);
      });
    });
  });
}
