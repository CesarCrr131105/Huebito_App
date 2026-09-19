import React from 'react';
import { useTheme } from '../theme/ThemeProvider';

export function StatBlock({ items }) {
  const { colors } = useTheme();
  return (
    <div>
      <div className="h-px w-full" style={{ backgroundColor: colors.outline }} />
      <div className="flex py-3">
        {items.map((item, i) => (
          <React.Fragment key={item.label}>
            {i > 0 && (
              <div className="w-px mx-2 self-stretch" style={{ backgroundColor: colors.outline }} />
            )}
            <div className="flex-1 text-center">
              <p className="text-[12px] font-medium font-body tracking-wider text-on-surface-variant uppercase">
                {item.label}
              </p>
              <p className="text-[14px] font-normal font-body text-on-surface mt-1">
                {item.value}
              </p>
            </div>
          </React.Fragment>
        ))}
      </div>
      <div className="h-px w-full" style={{ backgroundColor: colors.outline }} />
    </div>
  );
}