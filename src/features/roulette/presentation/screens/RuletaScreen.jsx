import React, { useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../../../core/theme/ThemeProvider';
import { AppTopBar } from '../../../../core/widgets/AppTopBar';
import { AppPrimaryButton } from '../../../../core/widgets/AppPrimaryButton';
import { RuletaWheel, SEGMENTOS_RULETA } from '../widgets/RuletaWheel';
import { useRecetasPorCategoria, useRecetaAleatoria } from '../../../recipes/presentation/providers/useRecetas';
import { CategoriaSlug } from '../../../recipes/domain/entities/categoria';
import { AppRoutes } from '../../../../core/router/appRoutes';
import { Dices } from 'lucide-react';

export function RuletaScreen() {
  const { categoria: categoriaParam } = useParams();
  const navigate = useNavigate();
  const { colors } = useTheme();

  const categoria = CategoriaSlug.fromStorage(categoriaParam) || CategoriaSlug.desayunos;
  const titulo = CategoriaSlug.preguntas[categoria];

  const { recetas, loading: loadingRecetas, error } = useRecetasPorCategoria(categoria);
  const { girar, loading: spinning } = useRecetaAleatoria();

  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [ultimoGanadorId, setUltimoGanadorId] = useState(null);
  const animRef = useRef(null);

  const handleGirar = useCallback(async () => {
    if (isSpinning || recetas.length === 0) return;
    setIsSpinning(true);

    const ganador = await girar(categoria, ultimoGanadorId);
    if (!ganador) {
      setIsSpinning(false);
      return;
    }

    // La rueda tiene SEGMENTOS_RULETA gajos, no uno por receta, así que el
    // ganador se mapea al gajo que le toca por módulo. El puntero siempre cae
    // sobre un gajo real y la receta mostrada es la que salió del sorteo.
    const indiceEncontrado = recetas.findIndex((r) => r.id === ganador.id);
    const segmentos = Math.min(Math.max(recetas.length, 2), SEGMENTOS_RULETA);
    const segmentIndex = (indiceEncontrado === -1 ? 0 : indiceEncontrado) % segmentos;
    const sweep = (2 * Math.PI) / segmentos;
    const anguloSegmento = (segmentIndex + 0.5) * sweep;

    const TWO_PI = 2 * Math.PI;
    let anguloObjetivo = (-Math.PI / 2 - anguloSegmento) % TWO_PI;
    if (anguloObjetivo < 0) anguloObjetivo += TWO_PI;

    let rotacionActual = rotation % TWO_PI;
    if (rotacionActual < 0) rotacionActual += TWO_PI;

    let delta = anguloObjetivo - rotacionActual;
    if (delta <= 0) delta += TWO_PI;

    const vueltasCompletas = 5;
    const destino = rotation + vueltasCompletas * TWO_PI + delta;

    const start = performance.now();
    const duration = 4200;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const animate = (now) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(t);
      const current = rotation + (destino - rotation) * eased;
      setRotation(current);

      if (t < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setRotation(destino);
        setUltimoGanadorId(ganador.id);
        setIsSpinning(false);
        // Navegar al resultado
        navigate(AppRoutes.rouletteResult(categoria), { state: { receta: ganador } });
      }
    };

    animRef.current = requestAnimationFrame(animate);
  }, [isSpinning, recetas, categoria, ultimoGanadorId, rotation, girar, navigate]);

  if (loadingRecetas) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || recetas.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-surface">
        <AppTopBar title={titulo} onBack={() => navigate(-1)} />
        <div className="flex-1 flex flex-col items-center justify-center px-5 text-center">
          <p className="text-on-surface-variant font-body">
            {error || 'No hay recetas disponibles para esta categoría.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface overflow-x-hidden">
      <AppTopBar title={titulo} onBack={() => navigate(-1)} />
      <div className="flex-1 flex flex-col items-center px-5">
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          <RuletaWheel recetas={recetas} rotation={rotation} />
          <p className="mt-14 text-center text-on-surface-variant font-body text-sm">
            {isSpinning ? 'Girando...' : 'Presiona girar para descubrir tu receta'}
          </p>
        </div>
        <div className="w-full pb-6">
          <AppPrimaryButton
            label="Girar"
            icon={Dices}
            loading={isSpinning}
            onPressed={handleGirar}
          />
        </div>
      </div>
    </div>
  );
}