import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppTopBar } from '../../../../core/widgets/AppTopBar';
import { RecipeCard } from '../../../../core/widgets/RecipeCard';
import { useFavoritos } from '../providers/useFavoritos';
import { AppRoutes } from '../../../../core/router/appRoutes';

export function FavoritosScreen() {
  const navigate = useNavigate();
  const { favoritos, loading } = useFavoritos();

  return (
    <div className="min-h-screen bg-surface pb-6">
      <AppTopBar title="Favoritos" onBack={() => navigate(-1)} />
      {loading ? (
        <div className="pt-8 flex justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : favoritos.length === 0 ? (
        <div className="px-5 pt-8 text-center">
          <p className="text-on-surface-variant font-body">Aquí aparecerán tus recetas favoritas</p>
        </div>
      ) : (
        <div className="px-5 pt-6 grid grid-cols-2 gap-4">
          {favoritos.map((receta) => (
            <RecipeCard
              key={receta.id}
              receta={receta}
              width="100%"
              onTap={() => navigate(AppRoutes.recipeDetail(receta.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
