import { useEffect, useState } from 'react';
import { Network } from '@capacitor/network';
import { esNativo } from './plataforma';

// Hook de estado de red. En la app nativa usa el plugin @capacitor/network
// (más confiable que los eventos del navegador dentro de un WebView); en
// web usa navigator.onLine + los eventos online/offline estándar.
export function useConexion() {
  const [conectado, setConectado] = useState(true);

  useEffect(() => {
    let listenerHandle;
    let cancelado = false;

    if (esNativo()) {
      Network.getStatus().then((estado) => {
        if (!cancelado) setConectado(estado.connected);
      });

      Network.addListener('networkStatusChange', (estado) => {
        setConectado(estado.connected);
      }).then((listener) => {
        listenerHandle = listener;
      });

      return () => {
        cancelado = true;
        listenerHandle?.remove();
      };
    }

    setConectado(navigator.onLine);
    const handleOnline = () => setConectado(true);
    const handleOffline = () => setConectado(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return conectado;
}
