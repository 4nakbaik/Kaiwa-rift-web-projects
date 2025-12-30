import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
// Devtools di-disable untuk user experience yang bersih
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Local Imports
import App from './App';
import { queryClient } from './lib/queryClient';
import './index.css';

// Validasi Root Element (Best Practice TypeScript)
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('FATAL ERROR: Root element not found. Check index.html');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      
      {/* DevTools disembunyikan sesuai permintaan */}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  </React.StrictMode>,
);