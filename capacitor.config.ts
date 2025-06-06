import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d3e274dbdbf04510b86b54765d204ad4',
  appName: 'wealth-horizon-bloom',
  webDir: 'dist',
  server: {
    androidScheme: 'wealthhorizon',
    url: 'http://192.168.1.2:8080/', 
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
