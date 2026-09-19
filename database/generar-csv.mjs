// Regenera database/seed-csv/{categorias,recetas}.csv a partir de los
// archivos fuente en src/core/database/seed/*.js — pensado para el botón
// "Import data" (CSV) de una tabla en la consola de Neon, que por debajo
// usa COPY. Las columnas JSONB (ingredientes/preparacion) van como texto
// JSON dentro de la celda; COPY las parsea igual que un INSERT normal.
//
// Uso: node database/generar-csv.mjs

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

// Convierte un valor a una celda CSV válida (RFC 4180): null/undefined se
// dejan vacíos y sin comillas (COPY los lee como NULL); todo lo demás se
// envuelve entre comillas dobles, duplicando las comillas internas.
function celda(valor) {
  if (valor === null || valor === undefined) return '';
  const texto = typeof valor === 'object' ? JSON.stringify(valor) : String(valor);
  return `"${texto.replace(/"/g, '""')}"`;
}

function filaCSV(valores) {
  return valores.map(celda).join(',');
}

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

const categoriasCSV = [
  'id,nombre,slug',
  ...categorias.map((c) => filaCSV([c.id, c.nombre, c.slug])),
].join('\n') + '\n';

const recetasCSV = [
  'id,categoria_id,nombre,descripcion,ingredientes,preparacion,tiempo_minutos,dificultad,imagen_asset,bebida,acompanamiento,video_url',
  ...recetas.map((r) =>
    filaCSV([
      r.id,
      r.categoria_id,
      r.nombre,
      r.descripcion,
      r.ingredientes,
      r.preparacion,
      r.tiempo_minutos,
      r.dificultad,
      r.imagen_asset,
      r.bebida,
      r.acompanamiento,
      r.video_url,
    ])
  ),
].join('\n') + '\n';

const outDir = path.join(root, 'database/seed-csv');
await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, 'categorias.csv'), categoriasCSV, 'utf-8');
await writeFile(path.join(outDir, 'recetas.csv'), recetasCSV, 'utf-8');

console.log(`OK — categorias: ${categorias.length}, recetas: ${recetas.length}`);
