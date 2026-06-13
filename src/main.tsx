import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'https://20605ba23be3149ba2c580ef3ee08979@o4511559401668608.ingest.us.sentry.io/4511559409598464', // mesmo DSN ou um separado
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 1.0,
  environment: 'production',
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);