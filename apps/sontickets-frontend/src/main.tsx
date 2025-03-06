import '@fontsource/poppins';
import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  BrowserRouter,
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';
import theme from './config/theme';
import 'react-toastify/dist/ReactToastify.css';
import Router from './router';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import './config/i18n/i18n';

import * as Sentry from '@sentry/react';
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const NODE_ENV = import.meta.env.VITE_NODE_ENV;

Sentry.init({
  dsn: SENTRY_DSN,
  environment: NODE_ENV == 'DEV' ? 'development' : 'production',
  integrations: [
    new Sentry.BrowserTracing({
      // See docs for support of different versions of variation of react router
      // https://docs.sentry.io/platforms/javascript/guides/react/configuration/integrations/react-router/
      routingInstrumentation: Sentry.reactRouterV6Instrumentation(
        React.useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes
      ),
    }),
    Sentry.replayIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

declare global {
  interface Window {
    dataLayer: any[];
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ChakraProvider theme={theme}>
        <AuthProvider>
          <Router />
        </AuthProvider>
      </ChakraProvider>
      <ToastContainer />
    </BrowserRouter>
  </React.StrictMode>
);
