import type { CapacitorConfig } from '@capacitor/cli';
import * as fs from 'fs';
import * as path from 'path';

// Simple parser for .env if it exists to retrieve VITE_GOOGLE_CLIENT_ID_WEB
let googleClientId = 'your_google_web_client_id.apps.googleusercontent.com';
try {
  const envPath = path.resolve(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/VITE_GOOGLE_CLIENT_ID_WEB=(.*)/);
    if (match && match[1]) {
      googleClientId = match[1].trim();
    }
  }
} catch (e) {
  console.warn('Could not read .env file for Capacitor config:', e);
}

const config: CapacitorConfig = {
  appId: 'com.mario.requiemapp',
  appName: 'Requiem',
  webDir: 'dist/web',
  server: {
    androidScheme: 'https'
  },
  android: {
    backgroundColor: '#0a0a0f'
  },
  plugins: {
    GoogleSignIn: {
      clientId: googleClientId
    }
  }
};

export default config;
