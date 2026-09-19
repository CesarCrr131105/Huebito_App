import React from 'react';
import { useTheme } from '../theme/ThemeProvider';

export function AppIconButton({ icon: Icon, onPressed, filled = false, color }) {
  const { colors } = useTheme();
  return (
    <button
      onClick={onPressed}
      className="flex items-center justify-center w-10 h-10 rounded-full transition-colors"
      style={{
        backgroundColor: filled ? colors.surfaceContainer : 'transparent',
        color: color || colors.onSurface,
      }}
    >
      <Icon size={22} strokeWidth={2} />
    </button>
  );
}