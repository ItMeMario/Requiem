import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mario.requiem',
  appName: 'Requiem',
  webDir: 'dist/web',
  server: {
    androidScheme: 'https'
  },
  android: {
    backgroundColor: '#0a0a0f'
  }
};

export default config;
