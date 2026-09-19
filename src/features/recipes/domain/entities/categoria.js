export const CategoriaSlug = {
  desayunos: 'desayunos',
  almuerzos: 'almuerzos',
};

CategoriaSlug.values = [CategoriaSlug.desayunos, CategoriaSlug.almuerzos];

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