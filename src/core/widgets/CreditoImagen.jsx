import React from 'react';
import { useTheme } from '../theme/ThemeProvider';

// Crédito de la foto. No es decorativo: las licencias CC BY y CC BY-SA exigen
// atribuir al autor y enlazar a la obra original, así que este componente es
// parte del cumplimiento de la licencia, no un detalle de diseño.
//
// Si la receta no tiene imagen propia (cae en el ícono de placeholder) no hay
// nada que atribuir y no se renderiza nada.
export function CreditoImagen({ autor, licencia, fuente }) {
  const { colors } = useTheme();

  if (!licencia) return null;

  const nombreAutor = (autor || '').trim() || 'autor no indicado';

  const texto = `Foto: ${nombreAutor} · ${licencia}`;

  return (
    <p className="mt-2 text-[11px] font-body leading-snug" style={{ color: colors.onSurfaceVariant }}>
      {fuente ? (
        <a href={fuente} target="_blank" rel="noopener noreferrer" className="underline">
          {texto}
        </a>
      ) : (
        texto
      )}
    </p>
  );
}
