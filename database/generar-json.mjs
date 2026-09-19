// Regenera database/seed-json/{categorias,recetas}.json a partir de los
// archivos fuente en src/core/database/seed/*.js. No toca esos archivos
// fuente — solo lee de ahí y escribe el JSON de exportación para Neon.
//
// Uso: node database/generar-json.mjs

import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '..');

const { categoriasSeedData } = await import(
  pathToFileURL(path.join(root, 'src/core/database/seed/categoriasSeedData.js'))
);
const { recetasSeedData } = await import(
  pathToFileURL(path.join(root, 'src/core/database/seed/recetasSeedData.js'))
);

const categorias = categoriasSeedData.map((c, i) => ({
  id: i + 1,
  nombre: c.nombre,
  slug: c.slug,
}));

const slugToId = Object.fromEntries(categorias.map((c) => [c.slug, c.id]));

const recetas = recetasSeedData.map((r, i) => ({
  id: i + 1,
  categoria_id: slugToId[r.categoria_slug],
  nombre: r.nombre,
  descripcion: r.descripcion,
  ingredientes: r.ingredientes,
  preparacion: r.preparacion,
  tiempo_minutos: r.tiempo_minutos,
  dificultad: r.dificultad,
  imagen_asset: r.imagen_asset,
  bebida: r.bebida,
  acompanamiento: r.acompanamiento,
  video_url: r.video_url,
}));

const sinCategoria = recetas.filter((r) => !r.categoria_id);
if (sinCategoria.length > 0) {
  console.warn(
    `Aviso: ${sinCategoria.length} receta(s) con categoria_slug que no coincide con ninguna categoría:`,
    sinCategoria.map((r) => r.nombre)
  );
}

const outDir = path.join(root, 'database/seed-json');
await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, 'categorias.json'), JSON.stringify(categorias, null, 2) + '\n', 'utf-8');
await writeFile(path.join(outDir, 'recetas.json'), JSON.stringify(recetas, null, 2) + '\n', 'utf-8');

console.log(`OK — categorias: ${categorias.length}, recetas: ${recetas.length}`);
