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
    imagenUrl = null,
    imagenAutor = null,
    imagenLicencia = null,
    imagenFuente = null,
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
    // URL lista para usar en un <img>: apunta al endpoint del backend cuando
    // la receta tiene imagen guardada en Neon, o a la ruta local si no.
    this.imagenUrl = imagenUrl;
    // Crédito de la foto. Las licencias CC BY y CC BY-SA obligan a atribuir
    // al autor, así que estos datos no son decorativos: hay que mostrarlos.
    this.imagenAutor = imagenAutor;
    this.imagenLicencia = imagenLicencia;
    this.imagenFuente = imagenFuente;
    this.bebida = bebida;
    this.acompanamiento = acompanamiento;
    this.videoUrl = videoUrl;
  }
}