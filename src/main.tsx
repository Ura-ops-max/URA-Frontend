import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { NuqsAdapter } from 'nuqs/adapters/react';

import './index.css';
import App from './App.tsx';
import QueryProvider from './context/query-provider.tsx';
import { Toaster } from 'sonner';
import PaylukInit from '@/components/shared/PaylukInit.tsx';

// After a new deploy, a tab opened earlier may ask for a page file that no
// longer exists. Reload once to pick up the new build (guarded against loops).
window.addEventListener('vite:preloadError', (event) => {
  const KEY = 'ura.reloadedForNewBuild';
  try {
    if (sessionStorage.getItem(KEY)) return;
    sessionStorage.setItem(KEY, '1');
  } catch {
    /* storage blocked: still try one reload */
  }
  event.preventDefault();
  window.location.reload();
});
// A successful load clears the guard so the next deploy can reload again.
window.addEventListener('load', () => {
  setTimeout(() => {
    try {
      sessionStorage.removeItem('ura.reloadedForNewBuild');
    } catch {
      /* ignore */
    }
  }, 10_000);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <NuqsAdapter>
        <PaylukInit />
        <App />
      </NuqsAdapter>
      <Toaster />
    </QueryProvider>
  </StrictMode>,
);
