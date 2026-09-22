import React from 'react';
import { DificultadBadge } from './DificultadBadge';
import { RecipeImagePlaceholder } from './RecipeImagePlaceholder';

export function RecipeCard({ receta, onTap, width = 170 }) {
  return (
    <button onClick={onTap} className="text-left flex-shrink-0" style={{ width }}>
      <div className="aspect-[1.25] rounded-[20px] overflow-hidden mb-2">
        <RecipeImagePlaceholder categoria={receta.categoriaSlug} imagenUrl={receta.imagenUrl} />
      </div>
      <h3 className="text-[16px] font-medium font-body truncate text-on-surface">
        {receta.nombre}
      </h3>
      <div className="mt-1">
        <DificultadBadge dificultad={receta.dificultad} />
      </div>
    </button>
  );
}