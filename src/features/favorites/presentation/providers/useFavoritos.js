import { useCallback, useState, useEffect } from 'react';
import { recetasRepository as repository } from '../../../recipes/data/repositories/recetasRepositoryInstance.js';
import { GetRecetaPorIdUseCase } from '../../../recipes/domain/usecases/getRecetaPorIdUseCase.js';

const FAVORITES_KEY = 'huebito_favorites';
const getRecetaPorIdUC = new GetRecetaPorIdUseCase(repository);

function readFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
  } catch {
    return [];
  }
}

export function useFavoritos() {
  const [ids, setIds] = useState(readFavorites);
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);

  const toggle = useCallback((id) => {
    setIds((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (ids.length === 0) {
      setFavoritos([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all(ids.map((id) => getRecetaPorIdUC.call(id)))
      .then((recetas) => {
        if (!cancelled) setFavoritos(recetas.filter(Boolean));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [ids]);

  return {
    favoritos,
    loading,
    toggle,
    esFavorito: (id) => ids.includes(id),
  };
}
