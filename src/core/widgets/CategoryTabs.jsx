import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { CategoriaSlug } from '../../features/recipes/domain/entities/categoria';

export function CategoryTabs({ value, onChanged }) {
  const tabs = [
    { slug: CategoriaSlug.desayunos, label: 'Desayunos' },
    { slug: CategoriaSlug.almuerzos, label: 'Almuerzos' },
  ];

  return (
    <div className="flex gap-6">
      {tabs.map((tab) => (
        <button
          key={tab.slug}
          onClick={() => onChanged(tab.slug)}
          className="flex flex-col items-start pb-1"
        >
          <span
            className={`text-[20px] font-medium font-body transition-colors duration-200 ${
              value === tab.slug ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            {tab.label}
          </span>
          <div
            className="h-0.5 rounded-full transition-all duration-200 mt-1"
            style={{
              width: value === tab.slug ? 32 : 0,
              backgroundColor: '#E27D19',
            }}
          />
        </button>
      ))}
    </div>
  );
}