import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Amplify } from 'aws-amplify';
import awsconfig from './amplifyconfiguration.json';
import { AppModule } from './app/app.module';

// Amplify Hosting regenerates amplifyconfiguration.json from the Amplify CLI backend
// config on every build, which has no knowledge of the Cognito custom domain
// (auth.whatwhenwherewho.com) set up outside the auth category. Force it here so
// Hosted UI / Google sign-in always redirects through the custom domain instead of
// the raw *.auth.us-east-1.amazoncognito.com domain.
const config: typeof awsconfig = {
  ...awsconfig,
  oauth: {
    ...awsconfig.oauth,
    domain: 'auth.whatwhenwherewho.com'
  }
};
Amplify.configure(config);

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
