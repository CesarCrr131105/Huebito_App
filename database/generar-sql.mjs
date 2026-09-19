// Regenera database/seed-sql/insertar-datos.sql a partir de los archivos
// fuente en src/core/database/seed/*.js — sentencias INSERT listas para
// pegar y ejecutar directo en el SQL Editor de Neon (después de correr
// schema.sql). No requiere instalar psql ni usar el botón de import CSV.
//
// Uso: node database/generar-sql.mjs

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

// Convierte un valor JS a su literal SQL: null -> NULL, arrays -> literal
// JSONB, strings -> comillas simples duplicando las internas, números tal cual.
function literal(valor) {
  if (valor === null || valor === undefined) return 'NULL';
  if (typeof valor === 'number') return String(valor);
  if (Array.isArray(valor)) {
    const json = JSON.stringify(valor).replace(/'/g, "''");
    return `'${json}'::jsonb`;
  }
  return `'${String(valor).replace(/'/g, "''")}'`;
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

const lineas = [];

lineas.push('-- Generado por database/generar-sql.mjs — no editar a mano.');
lineas.push('-- Ejecutar en el SQL Editor de Neon DESPUÉS de correr schema.sql.');
lineas.push('');
lineas.push('-- ===== categorias =====');
for (const c of categorias) {
  lineas.push(
    `INSERT INTO categorias (id, nombre, slug) VALUES (${literal(c.id)}, ${literal(c.nombre)}, ${literal(c.slug)}) ON CONFLICT (id) DO NOTHING;`
  );
}

lineas.push('');
lineas.push('-- ===== recetas =====');
for (const r of recetas) {
  const valores = [
    literal(r.id),
    literal(r.categoria_id),
    literal(r.nombre),
    literal(r.descripcion),
    literal(r.ingredientes),
    literal(r.preparacion),
    literal(r.tiempo_minutos),
    literal(r.dificultad),
    literal(r.imagen_asset),
    literal(r.bebida),
    literal(r.acompanamiento),
    literal(r.video_url),
  ].join(', ');
  lineas.push(
    `INSERT INTO recetas (id, categoria_id, nombre, descripcion, ingredientes, preparacion, tiempo_minutos, dificultad, imagen_asset, bebida, acompanamiento, video_url) VALUES (${valores}) ON CONFLICT (id) DO NOTHING;`
  );
}

lineas.push('');
lineas.push('-- Sincroniza las secuencias de SERIAL con los ids fijados arriba,');
lineas.push('-- para que el próximo INSERT sin id explícito no choque con estos.');
lineas.push("SELECT setval('categorias_id_seq', (SELECT MAX(id) FROM categorias));");
lineas.push("SELECT setval('recetas_id_seq', (SELECT MAX(id) FROM recetas));");
lineas.push('');

const outDir = path.join(root, 'database/seed-sql');
await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, 'insertar-datos.sql'), lineas.join('\n'), 'utf-8');

console.log(`OK — categorias: ${categorias.length}, recetas: ${recetas.length}`);
