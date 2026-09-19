import { RecetasRepository } from '../../domain/repositories/recetasRepository.js';
import { RecetasLocalDatasource } from '../datasources/recetasLocalDatasource.js';
import { CategoriaModel } from '../models/categoriaModel.js';
import { RecetaModel } from '../models/recetaModel.js';
import { appDatabase } from '../../../../core/database/appDatabase.js';
import { DbTables } from '../../../../core/database/dbConstants.js';

export class RecetasRepositoryImpl extends RecetasRepository {
  constructor() {
    super();
    this._datasource = new RecetasLocalDatasource();
  }

  async getCategorias() {
    const rows = await this._datasource.getCategorias();
    return rows.map(CategoriaModel.fromJson);
  }

  async getByCategoria(categoria) {
    const catRows = await this._datasource.getCategorias();
    const categoriaRow = catRows.find((c) => c.slug === categoria);
    if (!categoriaRow) return [];
    const rows = await this._datasource.getRecetasByCategoria(categoriaRow.id);
    return rows.map(RecetaModel.fromJson);
  }

  async getById(id) {
    const row = await this._datasource.getRecetaById(id);
    return row ? RecetaModel.fromJson(row) : null;
  }

  async getAleatoria(categoria, { excluirId } = {}) {
    const catRows = await this._datasource.getCategorias();
    const categoriaRow = catRows.find((c) => c.slug === categoria);
    if (!categoriaRow) throw new Error('Categoría no encontrada');
    const row = await this._datasource.getAleatoria(categoriaRow.id, { excluirId });
    return row ? RecetaModel.fromJson(row) : null;
  }
}