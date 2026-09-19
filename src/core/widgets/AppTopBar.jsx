import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { AppIconButton } from './AppIconButton';
import { ArrowLeft } from 'lucide-react';

export function AppTopBar({ title, onBack, actions = [] }) {
  const { colors } = useTheme();
  return (
    <div className="h-14 flex items-center px-5">
      <div className="w-10">
        {onBack && <AppIconButton icon={ArrowLeft} onPressed={onBack} />}
      </div>
      <div className="flex-1 text-center">
        {title && (
          <h1 className="text-[20px] font-medium font-body truncate" style={{ color: colors.onSurface }}>
            {title}
          </h1>
        )}
      </div>
      <div className="w-10 flex justify-end">
        {actions.length > 0 ? (
          <div className="flex gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}