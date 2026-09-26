import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AppProvider } from './context/AppContext';
import './index.css';

// /ani is the scroll-driven SONARX story; lazy so the dashboard never loads GSAP.
const AniPage = lazy(() => import('./ani/AniPage'));

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {location.pathname.startsWith('/ani') ? (
      <Suspense fallback={null}>
        <AniPage />
      </Suspense>
    ) : (
      <AppProvider>
        <App />
      </AppProvider>
    )}
  </React.StrictMode>
);
