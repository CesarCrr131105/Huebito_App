import React from 'react';
import { AuthProvider } from './features/auth/presentation/providers/useAuth.jsx';
import AppRouter from './core/router/AppRouter.jsx';
import { BannerSinConexion } from './core/widgets/BannerSinConexion.jsx';

function App() {
  return (
    <AuthProvider>
      <BannerSinConexion />
      <AppRouter />
    </AuthProvider>
  );
}

export default App;