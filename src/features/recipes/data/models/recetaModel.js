import { Receta } from '../../domain/entities/receta.js';
import { CategoriaSlug } from '../../domain/entities/categoria.js';
import { Dificultad } from '../../domain/entities/dificultad.js';
import { DbSeparators } from '../../../../core/database/dbConstants.js';
import { API_BASE_URL } from '../../../../core/network/apiConfig.js';

// Las dos fuentes entregan estas listas en formatos distintos:
//   - localStorage: string con separador "|"  ("4 panes|2 paltas")
//   - API/Neon:     array JSONB real          (["4 panes", "2 paltas"])
// Normalizamos ambos a un array de strings.
function aLista(valor) {
  if (Array.isArray(valor)) return valor.filter(Boolean);
  if (typeof valor === 'string') return valor.split(DbSeparators.listItem).filter(Boolean);
  return [];
}

// El slug de categoría también viene distinto según el origen:
//   - localStorage: campo plano categoria_slug
//   - API:          objeto anidado categoria: { id, nombre, slug }
function aSlug(json) {
  return json.categoria_slug ?? json.categoriaSlug ?? json.categoria?.slug;
}

// La API marca con imagen_bytes las recetas que tienen foto guardada en la
// base. Para esas devolvemos la URL del endpoint que sirve el binario; para
// las que vienen del seed local queda la ruta de asset, que hoy no existe en
// disco y hace que el widget caiga en el ícono de placeholder.
function urlDeImagen(json) {
  const tieneBinario = (json.imagen_bytes ?? json.imagenBytes ?? null) !== null;
  if (tieneBinario && json.id != null) return `${API_BASE_URL}/recetas/${json.id}/imagen`;
  return json.imagen_asset ?? json.imagenAsset ?? null;
}

export class RecetaModel {
  static fromJson(json) {
    return new Receta({
      id: json.id,
      categoriaSlug: CategoriaSlug.fromStorage(aSlug(json)),
      nombre: json.nombre,
      descripcion: json.descripcion,
      ingredientes: aLista(json.ingredientes),
      preparacion: aLista(json.preparacion),
      tiempoMinutos: json.tiempo_minutos ?? json.tiempoMinutos,
      dificultad: Dificultad.fromStorage(json.dificultad),
      imagenAsset: json.imagen_asset ?? json.imagenAsset,
      imagenUrl: urlDeImagen(json),
      imagenAutor: json.imagen_autor ?? json.imagenAutor ?? null,
      imagenLicencia: json.imagen_licencia ?? json.imagenLicencia ?? null,
      imagenFuente: json.imagen_fuente ?? json.imagenFuente ?? null,
      bebida: json.bebida,
      acompanamiento: json.acompanamiento,
      videoUrl: json.video_url ?? json.videoUrl ?? null,
    });
  }
}
