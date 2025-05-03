import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wealth.horizon.bloom',
  appName: 'wealth-horizon-bloom',
  webDir: 'dist',
  server: {
    url: 'http://192.168.1.6:8080',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
    }
  }
};

export default config;
