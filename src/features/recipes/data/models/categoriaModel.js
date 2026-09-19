import { Categoria, CategoriaSlug } from '../../domain/entities/categoria.js';

export class CategoriaModel {
  static fromJson(json) {
    return new Categoria({
      id: json.id,
      nombre: json.nombre,
      slug: CategoriaSlug.fromStorage(json.slug),
    });
  }
}