import React, { useEffect, useState } from 'react';
import { useTheme } from '../../../../core/theme/ThemeProvider';
import { RuletaPreviewCards } from './RuletaPreviewCards';

// La rueda dibuja un número fijo de gajos, no uno por receta: con 150 recetas
// por categoría los gajos quedarían como hilos ilegibles. El sorteo sigue
// siendo sobre TODAS las recetas; la rueda solo representa el giro, y el
// ganador se mapea a un gajo con el módulo de este número.
export const SEGMENTOS_RULETA = 12;

function calcularLayoutRueda() {
  if (typeof window === 'undefined') return { size: 220, margin: 60 };
  const disponible = window.innerWidth - 40; // aprox. padding lateral de la pantalla (px-5 a cada lado)
  // La rueda se achica más de lo estrictamente necesario para dejar un
  // margen real a los costados: ahí es donde flotan las tarjetas, y deben
  // quedar claramente fuera del círculo, no recortadas ni tapadas por él.
  const size = Math.round(Math.max(150, Math.min(230, disponible / 1.65)));
  const margin = Math.max(0, (disponible - size) / 2);
  return { size, margin };
}

function useResponsiveLayout(sizeProp) {
  const [layout, setLayout] = useState(() => (sizeProp ? { size: sizeProp, margin: sizeProp * 0.3 } : calcularLayoutRueda()));

  useEffect(() => {
    if (sizeProp) return undefined;
    const onResize = () => setLayout(calcularLayoutRueda());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [sizeProp]);

  return sizeProp ? { size: sizeProp, margin: sizeProp * 0.3 } : layout;
}

export function RuletaWheel({ recetas = [], segmentCount, rotation, size: sizeProp }) {
  const { colors } = useTheme();
  const { size, margin } = useResponsiveLayout(sizeProp);
  const count = Math.min(Math.max(recetas.length || segmentCount || 0, 2), SEGMENTOS_RULETA);
  const sweep = (2 * Math.PI) / count;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size + 16 }}>
      <RuletaPreviewCards recetas={recetas} size={size} margin={margin} />
      <svg
        width={size}
        height={size}
        viewBox={`-${size / 2} -${size / 2} ${size} ${size}`}
        style={{ transform: `rotate(${rotation}rad)` }}
        className="will-change-transform"
      >
        {Array.from({ length: count }).map((_, i) => {
          const startAngle = i * sweep;
          const endAngle = (i + 1) * sweep;
          const x1 = (size / 2 - 2) * Math.cos(startAngle);
          const y1 = (size / 2 - 2) * Math.sin(startAngle);
          const x2 = (size / 2 - 2) * Math.cos(endAngle);
          const y2 = (size / 2 - 2) * Math.sin(endAngle);
          const largeArc = sweep > Math.PI ? 1 : 0;

          return (
            <path
              key={i}
              d={`M 0 0 L ${x1} ${y1} A ${size / 2 - 2} ${size / 2 - 2} 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={i % 2 === 0 ? colors.surfaceContainer : colors.surface}
              stroke={colors.outline}
              strokeWidth="1.5"
            />
          );
        })}
        <circle
          cx="0"
          cy="0"
          r={size / 2 - 1.5}
          fill="none"
          stroke={colors.primary}
          strokeWidth="3"
        />
      </svg>

      {/* Hub central */}
      <div
        className="absolute flex items-center justify-center rounded-full text-[28px]"
        style={{ width: 64, height: 64, backgroundColor: colors.primary }}
      >
        🥚
      </div>

      {/* Puntero */}
      <div className="absolute top-0" style={{ transform: 'translateY(-2px)' }}>
        <svg width="22" height="18" viewBox="0 0 22 18">
          <path d="M0 0 L22 0 L11 18 Z" fill={colors.primary} />
        </svg>
      </div>
    </div>
  );
}
