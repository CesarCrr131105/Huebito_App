import { useCallback, useState, useEffect } from 'react';
import { recetasRepository as repository } from '../../../recipes/data/repositories/recetasRepositoryInstance.js';
import { GetRecetaPorIdUseCase } from '../../../recipes/domain/usecases/getRecetaPorIdUseCase.js';

const HISTORY_KEY = 'huebito_history';
const getRecetaPorIdUC = new GetRecetaPorIdUseCase(repository);

function readHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

export function useHistorial() {
  const [ids, setIds] = useState(readHistory);
  const [recientes, setRecientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const registrarVisita = useCallback((id) => {
    setIds((current) => {
      const next = [id, ...current.filter((item) => item !== id)].slice(0, 20);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (ids.length === 0) {
      setRecientes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all(ids.map((id) => getRecetaPorIdUC.call(id)))
      .then((recetas) => {
        if (!cancelled) setRecientes(recetas.filter(Boolean));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [ids]);

  return { recientes, loading, registrarVisita, ids };
}
