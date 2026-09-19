import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppTopBar } from '../../../../core/widgets/AppTopBar';
import { RecipeCard } from '../../../../core/widgets/RecipeCard';
import { useHistorial } from '../providers/useHistorial';
import { AppRoutes } from '../../../../core/router/appRoutes';

export function HistorialScreen() {
  const navigate = useNavigate();
  const { recientes, loading } = useHistorial();

  return (
    <div className="min-h-screen bg-surface pb-6">
      <AppTopBar title="Historial" onBack={() => navigate(-1)} />
      {loading ? (
        <div className="pt-8 flex justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : recientes.length === 0 ? (
        <div className="px-5 pt-8 text-center">
          <p className="text-on-surface-variant font-body">Aquí aparecerán las recetas vistas recientemente</p>
        </div>
      ) : (
        <div className="px-5 pt-6 grid grid-cols-2 gap-4">
          {recientes.map((receta) => (
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
