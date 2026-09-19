import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { Loader2 } from 'lucide-react';

export const AppButtonVariant = {
  filled: 'filled',
  outlined: 'outlined',
};

export function AppPrimaryButton({ label, onPressed, icon: Icon, variant = AppButtonVariant.filled, loading = false }) {
  const { colors } = useTheme();
  const isEnabled = onPressed && !loading;

  const baseClasses = 'w-full h-[50px] rounded-lg font-body text-sm font-medium tracking-wider uppercase flex items-center justify-center gap-2 transition-opacity';
  
  const filledClasses = 'text-white';
  const outlinedClasses = 'border bg-transparent';

  return (
    <button
      onClick={isEnabled ? onPressed : undefined}
      disabled={!isEnabled}
      className={`${baseClasses} ${variant === AppButtonVariant.filled ? filledClasses : outlinedClasses}`}
      style={{
        backgroundColor: variant === AppButtonVariant.filled ? colors.primary : 'transparent',
        borderColor: variant === AppButtonVariant.outlined ? colors.outline : 'transparent',
        color: variant === AppButtonVariant.outlined ? colors.onSurface : colors.onPrimary,
        opacity: isEnabled ? 1 : 0.5,
      }}
    >
      {loading ? (
        <Loader2 size={20} className="animate-spin" />
      ) : (
        <>
          {Icon && <Icon size={18} />}
          {label}
        </>
      )}
    </button>
  );
}