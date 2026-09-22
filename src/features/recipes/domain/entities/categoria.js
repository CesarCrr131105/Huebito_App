export const CategoriaSlug = {
  desayunos: 'desayunos',
  almuerzos: 'almuerzos',
  bebidas: 'bebidas',
};

CategoriaSlug.values = [CategoriaSlug.desayunos, CategoriaSlug.almuerzos, CategoriaSlug.bebidas];

// Etiqueta visible de cada categoría, para tabs y botones.
CategoriaSlug.labels = {
  [CategoriaSlug.desayunos]: 'Desayunos',
  [CategoriaSlug.almuerzos]: 'Almuerzos',
  [CategoriaSlug.bebidas]: 'Bebidas',
};

// Título que muestra la ruleta según la categoría que se esté girando.
CategoriaSlug.preguntas = {
  [CategoriaSlug.desayunos]: '¿Qué desayuno hoy?',
  [CategoriaSlug.almuerzos]: '¿Qué almuerzo hoy?',
  [CategoriaSlug.bebidas]: '¿Qué tomo hoy?',
};

CategoriaSlug.fromStorage = (value) => {
  const found = CategoriaSlug.values.find((c) => c === value);
  if (!found) throw new Error(`Categoría desconocida: ${value}`);
  return found;
};

export class Categoria {
  constructor({ id, nombre, slug }) {
    this.id = id;
    this.nombre = nombre;
    this.slug = slug;
  }
}
