import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { Dificultad } from '../../features/recipes/domain/entities/dificultad';

export function DificultadBadge({ dificultad }) {
  const { colors } = useTheme();
  const nivel = dificultad === Dificultad.facil ? 1 : dificultad === Dificultad.media ? 2 : 3;

  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-1.5 rounded-sm"
          style={{
            height: 6 + i * 3,
            backgroundColor: i < nivel ? colors.primary : colors.outline,
          }}
        />
      ))}
      <span className="text-[12px] font-medium font-body tracking-wider ml-1.5 text-on-surface-variant">
        {dificultad.label}
      </span>
    </div>
  );
}