import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoutes } from '../../../../core/router/appRoutes';
import { AppPrimaryButton } from '../../../../core/widgets/AppPrimaryButton';
import { useTheme } from '../../../../core/theme/ThemeProvider';
import { useAuth } from '../providers/useAuth';

export function LoginScreen({ mode = 'login' }) {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { continuarComoInvitado } = useAuth();
  const esLogin = mode === 'login';

  const handleGuestLogin = () => {
    continuarComoInvitado();
    navigate(AppRoutes.home, { replace: true });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5 py-10 relative overflow-hidden"
      style={{ backgroundColor: colors.surface }}
    >
      {/* Decoración de fondo */}
      <div
        className="absolute -top-24 -right-20 w-72 h-72 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: `${colors.primary}22` }}
      />
      <div
        className="absolute -bottom-28 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: `${colors.primary}17` }}
      />

      <div
        className="relative w-full max-w-[360px] rounded-[30px] px-7 py-10 flex flex-col items-center text-center"
        style={{
          backgroundColor: colors.surfaceContainer,
          border: `1px solid ${colors.outline}`,
          boxShadow: '0 24px 48px -24px rgba(35, 23, 23, 0.28)',
        }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-[36px] mb-5"
          style={{ backgroundColor: colors.primary }}
        >
          🥚
        </div>

        <h1
          className="text-[27px] font-bold font-display leading-tight"
          style={{ color: colors.onSurface }}
        >
          {esLogin ? 'Bienvenido' : 'Crear cuenta'}
        </h1>
        <p
          className="mt-2 mb-8 text-sm font-body leading-relaxed"
          style={{ color: colors.onSurfaceVariant }}
        >
          {esLogin
            ? 'Ingresa y descubre qué cocinar hoy con Huebito.'
            : 'Únete a Huebito y empieza a descubrir nuevas recetas.'}
        </p>

        <div className="w-full">
          <AppPrimaryButton
            label={esLogin ? 'Ingresar como invitado' : 'Registrarse'}
            onPressed={esLogin ? handleGuestLogin : () => navigate(AppRoutes.home, { replace: true })}
          />
        </div>

        <button
          onClick={() => navigate(esLogin ? AppRoutes.register : AppRoutes.login)}
          className="mt-6 text-sm font-body"
          style={{ color: colors.onSurfaceVariant }}
        >
          {esLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
          <span style={{ color: colors.primary, fontWeight: 600 }}>
            {esLogin ? 'Crear una' : 'Ingresar'}
          </span>
        </button>
      </div>
    </div>
  );
}
