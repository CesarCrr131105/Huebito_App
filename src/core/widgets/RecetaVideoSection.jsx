import React, { useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { Film, PlayCircle, ExternalLink, X, WifiOff } from 'lucide-react';
import { AppPrimaryButton, AppButtonVariant } from './AppPrimaryButton';
import { AppIconButton } from './AppIconButton';
import { abrirEnlaceExterno } from '../platform/plataforma';
import { useConexion } from '../platform/useConexion';

/**
 * Convierte una URL de video "normal" (YouTube, youtu.be, Vimeo) en su
 * versión embebible para poder reproducirla dentro de un iframe.
 * Si no reconoce el formato, devuelve la URL tal cual (el iframe
 * intentará cargarla igual).
 */
function toEmbedUrl(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace('www.', '');

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const id = u.searchParams.get('v');
      if (id) return `https://www.youtube.com/embed/${id}`;
      const parts = u.pathname.split('/').filter(Boolean);
      if (parts[0] === 'shorts' && parts[1]) return `https://www.youtube.com/embed/${parts[1]}`;
      if (parts[0] === 'embed') return url;
    }
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1);
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (host === 'vimeo.com') {
      const id = u.pathname.split('/').filter(Boolean)[0];
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
    return url;
  } catch {
    return url;
  }
}

function VideoModal({ videoUrl, nombre, onClose }) {
  const { colors } = useTheme();

  const handleAbrirEnlace = () => {
    abrirEnlaceExterno(videoUrl);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-[20px] overflow-hidden"
        style={{ backgroundColor: colors.surface }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-sm font-semibold font-body text-on-surface truncate pr-2">
            {nombre}
          </p>
          <AppIconButton icon={X} onPressed={onClose} filled />
        </div>

        <div className="w-full aspect-video bg-black">
          <iframe
            src={toEmbedUrl(videoUrl)}
            title={`Video de ${nombre}`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <button
          onClick={handleAbrirEnlace}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-body font-medium"
          style={{ color: colors.primary }}
        >
          <ExternalLink size={16} />
          Abrir enlace directo
        </button>
      </div>
    </div>
  );
}

export function RecetaVideoSection({ videoUrl, nombre }) {
  const { colors } = useTheme();
  const [modalAbierto, setModalAbierto] = useState(false);
  const conectado = useConexion();

  const tieneVideo = !!videoUrl;
  const sinRed = tieneVideo && !conectado;

  const handleAbrirEnlace = () => {
    abrirEnlaceExterno(videoUrl);
  };

  const mensajePrincipal = !tieneVideo
    ? 'Video no disponible por el momento'
    : sinRed
    ? 'Necesitas conexión para ver el video'
    : 'Mira la preparación paso a paso';

  const mensajeSecundario = !tieneVideo
    ? 'Vuelve pronto para verlo aquí'
    : sinRed
    ? 'Conéctate a internet e inténtalo de nuevo'
    : 'Disponible dentro de la app o en el enlace original';

  return (
    <div className="mt-8">
      <h3 className="text-[18px] font-semibold font-body text-on-surface">Video de la receta</h3>

      <div
        className="mt-3 flex items-center gap-4 p-4 rounded-[20px]"
        style={{ backgroundColor: colors.surfaceContainer }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: tieneVideo && !sinRed ? colors.primary : colors.outline, opacity: tieneVideo && !sinRed ? 1 : 0.5 }}
        >
          {sinRed ? (
            <WifiOff size={22} color={colors.onPrimary} />
          ) : (
            <Film size={22} color={colors.onPrimary} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-body text-on-surface">{mensajePrincipal}</p>
          <p className="text-[12px] font-body text-on-surface-variant">{mensajeSecundario}</p>
        </div>
      </div>

      {tieneVideo && !sinRed && (
        <div className="mt-3 flex gap-3">
          <div className="flex-1">
            <AppPrimaryButton label="Ver en la app" icon={PlayCircle} onPressed={() => setModalAbierto(true)} />
          </div>
          <div className="flex-1">
            <AppPrimaryButton
              label="Abrir enlace"
              icon={ExternalLink}
              variant={AppButtonVariant.outlined}
              onPressed={handleAbrirEnlace}
            />
          </div>
        </div>
      )}

      {modalAbierto && (
        <VideoModal videoUrl={videoUrl} nombre={nombre} onClose={() => setModalAbierto(false)} />
      )}
    </div>
  );
}
