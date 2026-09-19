import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppRoutes } from './appRoutes';
import { useAuth } from '../../features/auth/presentation/providers/useAuth';

import { SplashScreen } from '../../features/splash/presentation/screens/SplashScreen';
import { LoginScreen } from '../../features/auth/presentation/screens/LoginScreen';
import { RegisterScreen } from '../../features/auth/presentation/screens/RegisterScreen';
import { HomeScreen } from '../../features/home/presentation/screens/HomeScreen';
import { RuletaScreen } from '../../features/roulette/presentation/screens/RuletaScreen';
import { RecetaDetailPage } from '../../features/recipe_detail/presentation/screens/RecetaDetailPage';
import { RecetaDetailScreen } from '../../features/recipe_detail/presentation/screens/RecetaDetailScreen';
import { FavoritosScreen } from '../../features/favorites/presentation/screens/FavoritosScreen';
import { HistorialScreen } from '../../features/history/presentation/screens/HistorialScreen';

function RequireAuth({ children }) {
  const { autenticado, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!autenticado) {
    return <Navigate to={AppRoutes.login} state={{ from: location }} replace />;
  }

  return children;
}

function AuthRedirect({ children }) {
  const { autenticado, loading } = useAuth();
  if (loading) return null;
  if (autenticado) return <Navigate to={AppRoutes.home} replace />;
  return children;
}

function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route path={AppRoutes.splash} element={<SplashScreen />} />
        <Route path={AppRoutes.login} element={<AuthRedirect><LoginScreen /></AuthRedirect>} />
        <Route path={AppRoutes.register} element={<AuthRedirect><RegisterScreen /></AuthRedirect>} />
        <Route path={AppRoutes.home} element={<RequireAuth><HomeScreen /></RequireAuth>} />
        <Route path="/roulette/:categoria" element={<RequireAuth><RuletaScreen /></RequireAuth>} />
        <Route path="/roulette/:categoria/result" element={<RequireAuth><RecetaDetailScreen mostrarVolverAGirar /></RequireAuth>} />
        <Route path="/recipe/:id" element={<RequireAuth><RecetaDetailPage /></RequireAuth>} />
        <Route path={AppRoutes.favorites} element={<RequireAuth><FavoritosScreen /></RequireAuth>} />
        <Route path={AppRoutes.history} element={<RequireAuth><HistorialScreen /></RequireAuth>} />
        <Route path="*" element={<Navigate to={AppRoutes.home} replace />} />
      </Routes>
    </HashRouter>
  );
}

export default AppRouter;