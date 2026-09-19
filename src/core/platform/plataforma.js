import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

// Punto único para saber si el código corre dentro de la app nativa
// (Android/iOS empaquetados con Capacitor) o en un navegador normal.
// El resto de la app debe consultar esto en vez de mirar window.Capacitor
// directamente, así queda todo centralizado si cambia la estrategia.
export function esNativo() {
  return Capacitor.isNativePlatform();
}

export function obtenerPlataforma() {
  return Capacitor.getPlatform(); // 'web' | 'android' | 'ios'
}

// Abre un enlace externo (videos, redes sociales, etc.) usando el navegador
// in-app de Capacitor cuando estamos en la app nativa, o window.open cuando
// estamos en un navegador de escritorio/móvil normal.
export async function abrirEnlaceExterno(url) {
  if (!url) return;

  if (esNativo()) {
    try {
      await Browser.open({ url });
      return;
    } catch {
      // Si falla el navegador in-app, seguimos con el fallback de abajo.
    }
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}

// Registra el manejo del botón "Atrás" físico de Android: si hay historial
// de navegación retrocede, si no, deja que el sistema decida (normalmente
// minimizar/cerrar la app). Devuelve una función para des-suscribirse.
export function registrarBotonAtras(onNoHayHistorial) {
  if (!esNativo()) return () => {};

  const listenerPromise = CapacitorApp.addListener('backButton', () => {
    if (window.history.length > 1) {
      window.history.back();
    } else if (typeof onNoHayHistorial === 'function') {
      onNoHayHistorial();
    } else {
      CapacitorApp.exitApp();
    }
  });

  return () => {
    listenerPromise.then((listener) => listener.remove());
  };
}

// Inicializa lo que solo tiene sentido dentro de la app nativa: barra de
// estado y splash screen. En web no hace nada.
export async function inicializarPlataforma() {
  if (!esNativo()) return;

  try {
    await StatusBar.setStyle({ style: Style.Default });
    if (obtenerPlataforma() === 'android') {
      await StatusBar.setOverlaysWebView({ overlay: true });
    }
  } catch {
    // Algunos dispositivos/plugins pueden no soportar todas las opciones.
  }

  try {
    await SplashScreen.hide();
  } catch {
    // Si el plugin de splash no está disponible, no bloqueamos el arranque.
  }
}
