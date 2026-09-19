import { appDatabase } from '../../../../core/database/appDatabase.js';
import { DbTables } from '../../../../core/database/dbConstants.js';

export class RecetasLocalDatasource {
  async getCategorias() {
    return appDatabase.getTable(DbTables.categorias);
  }

  async getRecetasByCategoria(categoriaId) {
    return appDatabase.query(DbTables.recetas, (r) => r.categoria_id === categoriaId);
  }

  async getRecetaById(id) {
    const table = appDatabase.getTable(DbTables.recetas);
    // El id puede venir como string desde la URL (useParams) o como número
    // desde el resto de la app; comparamos como texto para que ambos calcen.
    return table.find((r) => String(r.id) === String(id)) || null;
  }

  async getAleatoria(categoriaId, { excluirId } = {}) {
    const recetas = await this.getRecetasByCategoria(categoriaId);
    const filtradas = excluirId ? recetas.filter((r) => r.id !== excluirId) : recetas;
    if (filtradas.length === 0) return recetas[0] || null;
    const idx = Math.floor(Math.random() * filtradas.length);
    return filtradas[idx];
  }
}