import { DbTables, DbSeparators } from './dbConstants.js';
import { categoriasSeedData } from './seed/categoriasSeedData.js';
import { recetasSeedData } from './seed/recetasSeedData.js';

const DB_KEY = 'huebito_db_v1';

class AppDatabase {
  constructor() {
    this._data = null;
  }

  get data() {
    if (!this._data) {
      const raw = localStorage.getItem(DB_KEY);
      const storedData = raw ? JSON.parse(raw) : null;
      this._data = storedData ? this._repair(storedData) : this._init();
    }
    return this._data;
  }

  _repair(storedData) {
    const recetasActuales = storedData[DbTables.recetas];
    const yaTieneCategoriaSlug = recetasActuales?.length > 0 && !!recetasActuales[0].categoria_slug;
    const yaTieneVideoUrl = recetasActuales?.length > 0
      && Object.prototype.hasOwnProperty.call(recetasActuales[0], 'video_url');
    const yaTieneRutaAbsoluta = recetasActuales?.length > 0
      && String(recetasActuales[0].imagen_asset || '').startsWith('/');
    if (yaTieneCategoriaSlug && yaTieneVideoUrl && yaTieneRutaAbsoluta) return storedData;

    const categorias = storedData[DbTables.categorias]?.length > 0
      ? storedData[DbTables.categorias]
      : categoriasSeedData.map((categoria, index) => ({ id: index + 1, ...categoria }));
    const categoriaIds = Object.fromEntries(categorias.map((categoria) => [categoria.slug, categoria.id]));
    const recetas = recetasSeedData.map((receta, index) => ({
      id: index + 1,
      categoria_id: categoriaIds[receta.categoria_slug],
      categoria_slug: receta.categoria_slug,
      nombre: receta.nombre,
      descripcion: receta.descripcion,
      ingredientes: receta.ingredientes.join(DbSeparators.listItem),
      preparacion: receta.preparacion.join(DbSeparators.listItem),
      tiempo_minutos: receta.tiempo_minutos,
      dificultad: receta.dificultad,
      imagen_asset: receta.imagen_asset,
      bebida: receta.bebida,
      acompanamiento: receta.acompanamiento,
      video_url: receta.video_url ?? null,
    }));
    const repairedData = {
      [DbTables.usuarios]: storedData[DbTables.usuarios] || [],
      [DbTables.categorias]: categorias,
      [DbTables.recetas]: recetas,
      [DbTables.favoritos]: storedData[DbTables.favoritos] || [],
      [DbTables.historial]: storedData[DbTables.historial] || [],
    };
    this._persist(repairedData);
    return repairedData;
  }

  _init() {
    const db = {
      [DbTables.usuarios]: [],
      [DbTables.categorias]: categoriasSeedData.map((c, i) => ({ id: i + 1, ...c })),
      [DbTables.recetas]: [],
      [DbTables.favoritos]: [],
      [DbTables.historial]: [],
    };

    const categoriaIds = {};
    db[DbTables.categorias].forEach((c) => {
      categoriaIds[c.slug] = c.id;
    });

    db[DbTables.recetas] = recetasSeedData.map((r, i) => ({
      id: i + 1,
      categoria_id: categoriaIds[r.categoria_slug],
      categoria_slug: r.categoria_slug,
      nombre: r.nombre,
      descripcion: r.descripcion,
      ingredientes: r.ingredientes.join(DbSeparators.listItem),
      preparacion: r.preparacion.join(DbSeparators.listItem),
      tiempo_minutos: r.tiempo_minutos,
      dificultad: r.dificultad,
      imagen_asset: r.imagen_asset,
      bebida: r.bebida,
      acompanamiento: r.acompanamiento,
      video_url: r.video_url ?? null,
    }));

    this._persist(db);
    return db;
  }

  _persist(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  }

  getTable(name) {
    return this.data[name] || [];
  }

  insert(name, row) {
    const table = this.data[name];
    const id = table.length > 0 ? Math.max(...table.map((r) => r.id)) + 1 : 1;
    const newRow = { ...row, id };
    table.push(newRow);
    this._persist(this.data);
    return id;
  }

  update(name, id, changes) {
    const table = this.data[name];
    const idx = table.findIndex((r) => r.id === id);
    if (idx !== -1) {
      table[idx] = { ...table[idx], ...changes };
      this._persist(this.data);
    }
  }

  delete(name, id) {
    const table = this.data[name];
    const idx = table.findIndex((r) => r.id === id);
    if (idx !== -1) {
      table.splice(idx, 1);
      this._persist(this.data);
    }
  }

  query(name, predicate) {
    const table = this.getTable(name);
    return predicate ? table.filter(predicate) : table;
  }

  reset() {
    localStorage.removeItem(DB_KEY);
    this._data = null;
  }
}

export const appDatabase = new AppDatabase();