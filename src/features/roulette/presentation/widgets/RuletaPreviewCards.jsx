import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../../../../core/theme/ThemeProvider';
import { RecipeImagePlaceholder } from '../../../../core/widgets/RecipeImagePlaceholder';

const CARD_WIDTH = 54;
const CARD_HEIGHT = 76; // imagen + etiqueta

const FALL_DURATION_S = 7; // velocidad de caída (lenta a propósito)
const DROPS_PER_COLUMN = 2; // tarjetas cayendo, en cascada, por columna

function truncarNombre(nombre) {
  if (!nombre) return '';
  return nombre.length > 13 ? `${nombre.slice(0, 12)}…` : nombre;
}

export function RuletaPreviewCards({ recetas = [], size = 220, margin = 60 }) {
  const { colors } = useTheme();
  const height = size + 16;

  // Dos columnas horizontales (izquierda y derecha de la ruleta), cada una
  // con un par de tarjetas cayendo en cascada, desfasadas en el tiempo.
  const drops = useMemo(() => {
    if (recetas.length === 0) return [];
    const left = -margin * 0.55;
    const right = size - CARD_WIDTH + margin * 0.55;
    const list = [];
    ['left', 'right'].forEach((lado, ladoIdx) => {
      for (let d = 0; d < DROPS_PER_COLUMN; d++) {
        list.push({
          key: `${lado}-${d}`,
          x: lado === 'left' ? left : right,
          delay: (d * FALL_DURATION_S) / DROPS_PER_COLUMN,
          startIndex: (ladoIdx * DROPS_PER_COLUMN + d) % recetas.length,
        });
      }
    });
    return list;
  }, [recetas.length, size, margin]);

  const [indices, setIndices] = useState(() => drops.map((d) => d.startIndex));

  useEffect(() => {
    setIndices(drops.map((d) => d.startIndex));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drops.length, recetas]);

  if (drops.length === 0) return null;

  const avanzar = (dropPos) => {
    setIndices((current) => {
      const next = [...current];
      next[dropPos] = (next[dropPos] + drops.length) % recetas.length;
      return next;
    });
  };

  return (
    <>
      {drops.map((drop, i) => {
        const receta = recetas[indices[i]];
        return (
          <div
            key={drop.key}
            onAnimationIteration={() => avanzar(i)}
            className="absolute"
            style={{
              left: drop.x,
              top: -CARD_HEIGHT,
              width: CARD_WIDTH,
              animationName: 'ruleta-fall',
              animationDuration: `${FALL_DURATION_S}s`,
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              animationDelay: `${drop.delay}s`,
              animationFillMode: 'both',
              '--fall-distance': `${height + CARD_HEIGHT * 2}px`,
            }}
          >
            <div
              className="overflow-hidden rounded-[13px]"
              style={{
                aspectRatio: '1 / 1',
                border: `2px solid ${colors.primary}`,
                boxShadow: `0 10px 22px -8px ${colors.primary}80, 0 4px 10px -4px rgba(35,23,23,0.3)`,
              }}
            >
              <RecipeImagePlaceholder
                categoria={receta?.categoriaSlug}
                imagenUrl={receta?.imagenUrl}
                borderRadius="0px"
              />
            </div>
            <p
              className="mt-1 text-[8.5px] leading-tight font-semibold font-body text-center truncate px-0.5"
              style={{ color: colors.onSurface }}
            >
              {truncarNombre(receta?.nombre)}
            </p>
          </div>
        );
      })}
    </>
  );
}
