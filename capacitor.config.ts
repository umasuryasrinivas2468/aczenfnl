
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d3e274dbdbf04510b86b54765d204ad4',
  appName: 'wealth-horizon-bloom',
  webDir: 'dist',
  server: {
    url: 'https://d3e274db-dbf0-4510-b86b-54765d204ad4.lovableproject.com?forceHideBadge=true',
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
