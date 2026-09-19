import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { RecetaDetailScreen } from './RecetaDetailScreen';
import { useRecetaPorId } from '../../../recipes/presentation/providers/useRecetas';

export function RecetaDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const { receta: loadedReceta, loading } = useRecetaPorId(id);
  const receta = location.state?.receta || loadedReceta;

  if (loading && !receta) {
    return <div className="min-h-screen flex items-center justify-center bg-surface">Cargando...</div>;
  }

  return <RecetaDetailScreen receta={receta} />;
}