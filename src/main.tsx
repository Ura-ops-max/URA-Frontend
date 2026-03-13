import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { NuqsAdapter } from 'nuqs/adapters/react';

import './index.css';
import App from './App.tsx';
import QueryProvider from './context/query-provider.tsx';
import { Toaster } from 'sonner';
import PaylukInit from "@/components/shared/PaylukInit.tsx";

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
