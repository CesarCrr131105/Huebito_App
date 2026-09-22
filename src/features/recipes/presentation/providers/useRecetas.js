import { useState, useEffect, useCallback } from 'react';
import { recetasRepository as repository } from '../../data/repositories/recetasRepositoryInstance.js';
import { GetCategoriasUseCase } from '../../domain/usecases/getCategoriasUseCase.js';
import { GetRecetasPorCategoriaUseCase } from '../../domain/usecases/getRecetasPorCategoriaUseCase.js';
import { GetRecetaPorIdUseCase } from '../../domain/usecases/getRecetaPorIdUseCase.js';
import { GetRecetaAleatoriaUseCase } from '../../domain/usecases/getRecetaAleatoriaUseCase.js';

const getCategoriasUC = new GetCategoriasUseCase(repository);
const getRecetasPorCategoriaUC = new GetRecetasPorCategoriaUseCase(repository);
const getRecetaPorIdUC = new GetRecetaPorIdUseCase(repository);
const getRecetaAleatoriaUC = new GetRecetaAleatoriaUseCase(repository);

export function useRecetasPorCategoria(categoria) {
  const [recetas, setRecetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getRecetasPorCategoriaUC.call(categoria)
      .then((data) => { if (!cancelled) { setRecetas(data); setError(null); } })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [categoria]);

  return { recetas, loading, error };
}

export function useCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategoriasUC.call().then((data) => {
      setCategorias(data);
      setLoading(false);
    });
  }, []);

  return { categorias, loading };
}

export function useRecetaPorId(id) {
  const [receta, setReceta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getRecetaPorIdUC.call(id).then((data) => {
      setReceta(data);
      setLoading(false);
    });
  }, [id]);

  return { receta, loading };
}

export function useRecetaAleatoria() {
  const [loading, setLoading] = useState(false);

  const girar = useCallback(async (categoria, excluirId) => {
    setLoading(true);
    try {
      const receta = await getRecetaAleatoriaUC.call(categoria, { excluirId });
      return receta;
    } finally {
      setLoading(false);
    }
  }, []);

  return { girar, loading };
}