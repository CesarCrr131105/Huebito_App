export class Receta {
  constructor({
    id,
    categoriaSlug,
    nombre,
    descripcion,
    ingredientes,
    preparacion,
    tiempoMinutos,
    dificultad,
    imagenAsset,
    bebida = null,
    acompanamiento = null,
    videoUrl = null,
  }) {
    this.id = id;
    this.categoriaSlug = categoriaSlug;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.ingredientes = ingredientes;
    this.preparacion = preparacion;
    this.tiempoMinutos = tiempoMinutos;
    this.dificultad = dificultad;
    this.imagenAsset = imagenAsset;
    this.bebida = bebida;
    this.acompanamiento = acompanamiento;
    this.videoUrl = videoUrl;
  }
}