import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.accountbook.app',
  appName: 'account-book',
  webDir: 'dist',
  server: {
    url: 'https://account-book-virid.vercel.app/', 
    cleartext: true
  }
};

export default config;
