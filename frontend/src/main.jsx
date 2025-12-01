import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AppProvider } from './state/AppContext';
import DevTopBanner from './components/DevTopBanner';
import DevBottomBanner from './components/DevBottomBanner';
import './styles.css';

const isDev = import.meta.env.MODE === 'development';

// Render React application with global providers
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        {isDev && <DevTopBanner />}
        <App />
        {isDev && <DevBottomBanner />}
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);
