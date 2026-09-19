import React from 'react';
import { WifiOff } from 'lucide-react';
import { useTheme } from '../theme/ThemeProvider';
import { useConexion } from '../platform/useConexion';

// Aviso flotante que aparece en la parte superior cuando el dispositivo
// pierde la conexión a internet, y desaparece solo al recuperarla.
export function BannerSinConexion() {
  const { colors } = useTheme();
  const conectado = useConexion();

  if (conectado) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] pt-safe flex items-center justify-center gap-2 py-2 px-4 text-sm font-body font-medium"
      style={{ backgroundColor: colors.primary, color: colors.onPrimary }}
      role="status"
    >
      <WifiOff size={16} />
      Sin conexión a internet
    </div>
  );
}
