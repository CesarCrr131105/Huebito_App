import { Receta } from '../../domain/entities/receta.js';
import { CategoriaSlug } from '../../domain/entities/categoria.js';
import { Dificultad } from '../../domain/entities/dificultad.js';
import { DbSeparators } from '../../../../core/database/dbConstants.js';

export class RecetaModel {
  static fromJson(json) {
    return new Receta({
      id: json.id,
      categoriaSlug: CategoriaSlug.fromStorage(json.categoria_slug || json.categoriaSlug),
      nombre: json.nombre,
      descripcion: json.descripcion,
      ingredientes: (json.ingredientes || '').split(DbSeparators.listItem).filter(Boolean),
      preparacion: (json.preparacion || '').split(DbSeparators.listItem).filter(Boolean),
      tiempoMinutos: json.tiempo_minutos ?? json.tiempoMinutos,
      dificultad: Dificultad.fromStorage(json.dificultad),
      imagenAsset: json.imagen_asset ?? json.imagenAsset,
      bebida: json.bebida,
      acompanamiento: json.acompanamiento,
      videoUrl: json.video_url ?? json.videoUrl ?? null,
    });
  }
}