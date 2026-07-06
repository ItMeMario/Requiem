import type { CapacitorConfig } from '@capacitor/cli';
import * as fs from 'fs';
import * as path from 'path';

// Simple parser for environment files to retrieve VITE_GOOGLE_CLIENT_ID_WEB
let googleClientId = 'your_google_web_client_id.apps.googleusercontent.com';
const possibleEnvFiles = [
  '.env.development.local',
  '.env.development',
  '.env.local',
  '.env',
  '.env.production.local',
  '.env.production'
];

for (const envFile of possibleEnvFiles) {
  try {
    const envPath = path.resolve(__dirname, envFile);
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/VITE_GOOGLE_CLIENT_ID_WEB=(.*)/);
      if (match && match[1]) {
        const val = match[1].trim();
        if (val && !val.startsWith('your_')) {
          googleClientId = val;
          break; // Found a valid configured Client ID, use it
        }
      }
    }
  } catch (e) {
    // Ignore and try next file
  }
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
