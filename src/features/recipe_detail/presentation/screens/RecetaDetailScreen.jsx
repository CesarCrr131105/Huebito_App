import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../core/theme/ThemeProvider';
import { AppTopBar } from '../../../../core/widgets/AppTopBar';
import { AppIconButton } from '../../../../core/widgets/AppIconButton';
import { AppPrimaryButton, AppButtonVariant } from '../../../../core/widgets/AppPrimaryButton';
import { StatBlock } from '../../../../core/widgets/StatBlock';
import { RecipeImagePlaceholder } from '../../../../core/widgets/RecipeImagePlaceholder';
import { CreditoImagen } from '../../../../core/widgets/CreditoImagen';
import { RecetaVideoSection } from '../../../../core/widgets/RecetaVideoSection';
import { useFavoritos } from '../../../favorites/presentation/providers/useFavoritos';
import { useHistorial } from '../../../history/presentation/providers/useHistorial';
import { Dificultad } from '../../../recipes/domain/entities/dificultad';
import { AppRoutes } from '../../../../core/router/appRoutes';
import { Coffee, UtensilsCrossed, Share2, Heart, RotateCcw, Home } from 'lucide-react';

export function RecetaDetailScreen({ receta: propReceta, mostrarVolverAGirar = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { colors } = useTheme();
  const { toggle, esFavorito } = useFavoritos();
  const { registrarVisita } = useHistorial();

  const receta = propReceta || location.state?.receta;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (receta?.id) registrarVisita(receta.id);
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, [receta?.id]);

  if (!receta) return null;

  const esFav = esFavorito(receta.id);

  const handleShare = async () => {
    const text = `Prueba "${receta.nombre}" 🇵🇪 — la encontré en Huebito.`;
    if (navigator.share) {
      await navigator.share({ title: receta.nombre, text });
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <AppTopBar onBack={() => navigate(-1)} />
      <div
        className="px-5 pb-8 transition-all duration-500 ease-out"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(12px)',
        }}
      >
        <div className="w-full aspect-[1.3] rounded-[20px] overflow-hidden">
          <RecipeImagePlaceholder categoria={receta.categoriaSlug} imagenUrl={receta.imagenUrl} />
        </div>
        <CreditoImagen
          autor={receta.imagenAutor}
          licencia={receta.imagenLicencia}
          fuente={receta.imagenFuente}
        />

        <div className="receta-texto">
          <h1 className="mt-6 text-[27px] font-bold font-display text-on-surface">{receta.nombre}</h1>
          <p className="mt-2 text-sm font-body text-on-surface-variant leading-relaxed">
            {receta.descripcion}
          </p>
        </div>

        <div className="mt-6">
          <StatBlock
            items={[
              { label: 'Tiempo', value: `${receta.tiempoMinutos} min` },
              { label: 'Dificultad', value: Dificultad.getLabel(receta.dificultad) },
            ]}
          />
        </div>

        {(receta.bebida || receta.acompanamiento) && (
          <div className="mt-6 flex gap-4">
            {receta.bebida && (
              <InfoChip icon={Coffee} label="Bebida" value={receta.bebida} />
            )}
            {receta.acompanamiento && (
              <InfoChip icon={UtensilsCrossed} label="Acompañamiento" value={receta.acompanamiento} />
            )}
          </div>
        )}

        <div className="receta-texto">
          <h3 className="mt-8 text-[18px] font-semibold font-body text-on-surface">Ingredientes</h3>
          <ul className="mt-3 space-y-2">
            {receta.ingredientes.map((ing, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm font-body text-on-surface">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: colors.primary }} />
                {ing}
              </li>
            ))}
          </ul>

          <h3 className="mt-8 text-[18px] font-semibold font-body text-on-surface">Preparación</h3>
          <ol className="mt-3 space-y-3">
            {receta.preparacion.map((paso, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm font-body text-on-surface">
                <span
                  className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[12px] font-medium flex-shrink-0"
                  style={{ backgroundColor: colors.surfaceContainer }}
                >
                  {i + 1}
                </span>
                {paso}
              </li>
            ))}
          </ol>
        </div>

        <RecetaVideoSection videoUrl={receta.videoUrl} nombre={receta.nombre} />

        {mostrarVolverAGirar && (
          <div className="mt-8 flex flex-col gap-3">
            <AppPrimaryButton
              label="Volver a girar"
              icon={RotateCcw}
              onPressed={() => navigate(-1)}
            />
            <AppPrimaryButton
              label="Volver al inicio"
              icon={Home}
              variant={AppButtonVariant.outlined}
              onPressed={() => navigate(AppRoutes.home)}
            />
          </div>
        )}

        <div className="mt-4 flex gap-4">
          <div className="flex-1">
            <AppPrimaryButton
              label={esFav ? 'Guardado' : 'Guardar favorito'}
              icon={Heart}
              variant={AppButtonVariant.outlined}
              onPressed={() => toggle(receta.id)}
            />
          </div>
          <AppIconButton icon={Share2} onPressed={handleShare} filled />
        </div>
      </div>
    </div>
  );
}

function InfoChip({ icon: Icon, label, value }) {
  const { colors } = useTheme();
  return (
    <div
      className="flex-1 flex items-center gap-2 p-4 rounded-[20px]"
      style={{ backgroundColor: colors.surfaceContainer }}
    >
      <Icon size={20} style={{ color: colors.primary }} />
      <div className="min-w-0">
        <p className="text-[12px] font-medium font-body tracking-wider text-on-surface-variant uppercase">{label}</p>
        <p className="text-sm font-body text-on-surface truncate">{value}</p>
      </div>
    </div>
  );
}