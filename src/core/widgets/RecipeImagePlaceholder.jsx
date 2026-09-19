import React, { useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { Coffee, UtensilsCrossed } from 'lucide-react';
import { CategoriaSlug } from '../../features/recipes/domain/entities/categoria';

// Muestra la foto real de la receta (imagenAsset) cuando exista; si no viene,
// o si falla la carga, cae automáticamente en el ícono ilustrativo. Así queda
// lista para cuando se agreguen las fotos reales: solo hay que completar
// imagenAsset en los datos, sin tocar los componentes que la usan.
export function RecipeImagePlaceholder({ categoria, imagenAsset, borderRadius = '20px' }) {
  const { colors } = useTheme();
  const [imgError, setImgError] = useState(false);
  const Icon = categoria === CategoriaSlug.desayunos ? Coffee : UtensilsCrossed;

  if (imagenAsset && !imgError) {
    return (
      <img
        src={imagenAsset}
        alt=""
        className="w-full h-full object-cover block"
        style={{ borderRadius }}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{
        borderRadius,
        background: `linear-gradient(135deg, ${colors.primary}33, ${colors.primary}0D)`,
      }}
    >
      <div
        className="flex items-center justify-center rounded-full"
        style={{ width: '38%', aspectRatio: '1', backgroundColor: `${colors.primary}26` }}
      >
        <Icon className="w-[45%] h-[45%]" style={{ color: colors.primary }} />
      </div>
    </div>
  );
}
