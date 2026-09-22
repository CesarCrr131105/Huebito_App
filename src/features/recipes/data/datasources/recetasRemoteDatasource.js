import { apiGet } from '../../../../core/network/httpClient.js';
import { API_MAX_LIMIT } from '../../../../core/network/apiConfig.js';

// Lee del backend NestJS, que a su vez consulta Neon. Devuelve las filas tal
// como llegan de la API; normalizarlas al formato que esperan las entidades es
// responsabilidad de RecetaModel/CategoriaModel, igual que con el datasource local.
export class RecetasRemoteDatasource {
  async getCategorias({ signal } = {}) {
    // GET /categorias -> [{ id, nombre, slug }]
    return apiGet('/categorias', { signal });
  }

  // GET /recetas -> { items, total, page, limit }
  // El DTO topea limit en 100, así que con 150 recetas por categoría hay que
  // recorrer varias páginas hasta juntar el total que informa la propia API.
  async getRecetasByCategoria(categoriaId, { signal } = {}) {
    const acumuladas = [];
    let page = 1;
    let total = Infinity;

    while (acumuladas.length < total) {
      const respuesta = await apiGet('/recetas', {
        params: { categoriaId, limit: API_MAX_LIMIT, page },
        signal,
      });

      const items = respuesta?.items ?? [];
      total = respuesta?.total ?? items.length;
      acumuladas.push(...items);

      // Corte de seguridad: si una página vuelve vacía pero el total dice que
      // faltan filas, paramos igual para no quedarnos en un bucle infinito.
      if (items.length === 0) break;
      page += 1;
    }

    return acumuladas;
  }

  async getRecetaById(id, { signal } = {}) {
    try {
      return await apiGet(`/recetas/${id}`, { signal });
    } catch (error) {
      // Una receta inexistente (404) no es una caída del backend: devolvemos
      // null para que el repositorio no dispare el fallback al seed local.
      if (error?.status === 404) return null;
      throw error;
    }
  }
}
