import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Amplify } from 'aws-amplify';
import awsconfig from './amplifyconfiguration.json';
import { AppModule } from './app/app.module';

Amplify.configure(awsconfig);

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
