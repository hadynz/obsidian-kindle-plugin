import * as Sentry from '@sentry/browser';
import { Integrations } from '@sentry/tracing';

const DSN = 'https://590b8641240b49bfba55e4662b0b0149@o46028.ingest.sentry.io/6073196';

declare const VERSION: string;
declare const PACKAGE_NAME: string;
declare const PRODUCTION: boolean;

Sentry.init({
  dsn: DSN,
  release: `${PACKAGE_NAME}@${VERSION}`,
  environment: PRODUCTION ? 'production' : 'dev',
  integrations: [new Integrations.BrowserTracing()],
  tracesSampleRate: 1.0,
});
