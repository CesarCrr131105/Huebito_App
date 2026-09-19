import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../core/theme/ThemeProvider';
import { AppIconButton } from '../../../../core/widgets/AppIconButton';
import { AppPrimaryButton } from '../../../../core/widgets/AppPrimaryButton';
import { RecipeCard } from '../../../../core/widgets/RecipeCard';
import { useAuth } from '../../../auth/presentation/providers/useAuth';
import { useFavoritos } from '../../../favorites/presentation/providers/useFavoritos';
import { useHistorial } from '../../../history/presentation/providers/useHistorial';
import { CategoriaSlug } from '../../../recipes/domain/entities/categoria';
import { AppRoutes } from '../../../../core/router/appRoutes';
import { Dices, LogOut, Coffee, UtensilsCrossed } from 'lucide-react';

export function HomeScreen() {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { usuario, cerrarSesion } = useAuth();
  const { favoritos, loading: loadingFav } = useFavoritos();
  const { recientes, loading: loadingRec } = useHistorial();

  const handleLogout = async () => {
    await cerrarSesion();
    navigate(AppRoutes.login, { replace: true });
  };

  return (
    <div className="min-h-screen bg-surface pb-6">
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <h1 className="text-[20px] font-medium font-body text-on-surface">
          {usuario ? `Hola, ${usuario.nombre} 👋` : 'Hola 👋'}
        </h1>
        <AppIconButton icon={LogOut} onPressed={handleLogout} />
      </div>

      <div className="px-5 mt-2">
        <h2 className="text-[27px] font-bold font-display text-on-surface">¿Qué quieres cocinar hoy?</h2>
      </div>

      <div className="px-5 mt-6">
        <AppPrimaryButton
          label="Sorpréndeme"
          icon={Dices}
          onPressed={() => {
            const cat = Math.random() > 0.5 ? CategoriaSlug.desayunos : CategoriaSlug.almuerzos;
            navigate(AppRoutes.roulette(cat));
          }}
        />
      </div>

      <div className="px-5 mt-6 grid grid-cols-2 gap-4">
        <button
          onClick={() => navigate(AppRoutes.roulette(CategoriaSlug.desayunos))}
          className="flex flex-col items-center py-5 rounded-[20px]"
          style={{ backgroundColor: colors.surfaceContainer }}
        >
          <Coffee size={32} style={{ color: colors.primary }} />
          <span className="mt-2 text-[16px] font-medium font-body text-on-surface">Desayunos</span>
        </button>
        <button
          onClick={() => navigate(AppRoutes.roulette(CategoriaSlug.almuerzos))}
          className="flex flex-col items-center py-5 rounded-[20px]"
          style={{ backgroundColor: colors.surfaceContainer }}
        >
          <UtensilsCrossed size={32} style={{ color: colors.primary }} />
          <span className="mt-2 text-[16px] font-medium font-body text-on-surface">Almuerzos</span>
        </button>
      </div>

      <Section
        title="Recetas favoritas"
        onVerTodas={() => navigate(AppRoutes.favorites)}
        recetas={favoritos}
        loading={loadingFav}
        emptyLabel="Aún no tienes favoritos"
        navigate={navigate}
      />

      <Section
        title="Últimos vistos"
        onVerTodas={() => navigate(AppRoutes.history)}
        recetas={recientes}
        loading={loadingRec}
        emptyLabel="Todavía no giraste la ruleta"
        navigate={navigate}
      />
    </div>
  );
}

function Section({ title, onVerTodas, recetas, loading, emptyLabel, navigate }) {
  const { colors } = useTheme();
  return (
    <div className="px-5 mt-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[18px] font-semibold font-body text-on-surface">{title}</h3>
        <button
          onClick={onVerTodas}
          className="text-[12px] font-medium font-body tracking-wider"
          style={{ color: colors.primary }}
        >
          Ver todas
        </button>
      </div>

      {loading && recetas.length === 0 ? (
        <div className="h-[170px] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : recetas.length === 0 ? (
        <div className="h-[60px] flex items-center justify-center">
          <p className="text-sm font-body text-on-surface-variant">{emptyLabel}</p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
          {recetas.map((receta) => (
            <RecipeCard
              key={receta.id}
              receta={receta}
              onTap={() => navigate(AppRoutes.recipeDetail(receta.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}