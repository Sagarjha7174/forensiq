import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 2800,
            style: {
              borderRadius: '10px',
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.1)'
            },
            success: {
              iconTheme: {
                primary: '#0ea5a4',
                secondary: '#f0fdfa'
              }
            },
            error: {
              iconTheme: {
                primary: '#f43f5e',
                secondary: '#fff1f2'
              }
            }
          }}
        />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
