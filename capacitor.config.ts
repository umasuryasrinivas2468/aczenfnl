import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wealthhorizon.app',
  appName: 'wealth-horizon-bloom',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Use your local IPv4 address for mobile testing
    url: 'http://192.168.1.7:8084',
    cleartext: true,
    allowNavigation: ['*']
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
