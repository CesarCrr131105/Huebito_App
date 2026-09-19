import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from './core/theme/ThemeProvider.jsx';
import App from './App.jsx';
import { inicializarPlataforma } from './core/platform/plataforma.js';

// Fuentes locales (solo subset latino) en vez del CDN de Google Fonts:
// menos peticiones externas y arranque más rápido en la app empaquetada.
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import '@fontsource/libre-baskerville/latin-400.css';
import '@fontsource/libre-baskerville/latin-700.css';

import './core/theme/index.css';

inicializarPlataforma();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);