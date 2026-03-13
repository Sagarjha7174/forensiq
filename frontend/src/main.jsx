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
              borderRadius: '14px',
              background: 'rgba(255,255,255,0.88)',
              color: '#0f2744',
              border: '1px solid rgba(255,255,255,0.55)',
              backdropFilter: 'blur(12px)'
            },
            success: {
              iconTheme: {
                primary: '#0ea5a4',
                secondary: '#ecfeff'
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
