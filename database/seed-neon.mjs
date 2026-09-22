// Aplica el schema y carga categorias + recetas directo en la base de Neon,
// leyendo los JSON ya generados por database/generar-json.mjs.
//
// Uso:
//   node database/seed-neon.mjs                 # lee DATABASE_URL del .env del backend
//   node database/seed-neon.mjs --reset         # borra recetas y categorias antes de insertar
//                                               (tambien borra las imagenes: ver nota abajo)
//   DATABASE_URL="postgres://..." node database/seed-neon.mjs
//
// Las credenciales NO se escriben aquí: salen de la variable de entorno
// DATABASE_URL o, si no está definida, del archivo .env de Huebito_API.

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const root = path.resolve(import.meta.dirname, '..');
const rutaEnvBackend = path.resolve(root, '..', 'Huebito_API', '.env');

async function obtenerConnectionString() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const contenido = await readFile(rutaEnvBackend, 'utf-8').catch(() => null);
  if (!contenido) {
    throw new Error(
      `No hay DATABASE_URL en el entorno y no se pudo leer ${rutaEnvBackend}. ` +
        'Define la variable o crea el .env del backend.'
    );
  }

  const linea = contenido.split(/\r?\n/).find((l) => l.trimStart().startsWith('DATABASE_URL='));
  if (!linea) throw new Error(`El archivo ${rutaEnvBackend} no define DATABASE_URL.`);

  const valor = linea.slice(linea.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '');
  if (!valor || valor === 'dsa') {
    throw new Error(`DATABASE_URL en ${rutaEnvBackend} está vacía o es un placeholder.`);
  }
  return valor;
}

const reset = process.argv.includes('--reset');

const connectionString = await obtenerConnectionString();
const pool = new Pool({ connectionString });

// Inserta en lotes: un INSERT con muchas filas es mucho más rápido que N
// INSERT sueltos contra una base remota.
async function insertarRecetasEnLotes(client, recetas, tamanoLote = 50) {
  const columnas = [
    'id',
    'categoria_id',
    'nombre',
    'descripcion',
    'ingredientes',
    'preparacion',
    'tiempo_minutos',
    'dificultad',
    'imagen_asset',
    'bebida',
    'acompanamiento',
    'video_url',
  ];

  let insertadas = 0;

  for (let i = 0; i < recetas.length; i += tamanoLote) {
    const lote = recetas.slice(i, i + tamanoLote);
    const valores = [];
    const marcadores = lote.map((receta) => {
      const base = valores.length;
      valores.push(
        receta.id,
        receta.categoria_id,
        receta.nombre,
        receta.descripcion,
        JSON.stringify(receta.ingredientes),
        JSON.stringify(receta.preparacion),
        receta.tiempo_minutos,
        receta.dificultad,
        receta.imagen_asset,
        receta.bebida,
        receta.acompanamiento,
        receta.video_url
      );
      // ingredientes y preparacion son JSONB: van con cast explícito.
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}::jsonb, $${base + 6}::jsonb, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, $${base + 11}, $${base + 12})`;
    });

    const resultado = await client.query(
      `INSERT INTO recetas (${columnas.join(', ')})
       VALUES ${marcadores.join(', ')}
       ON CONFLICT (id) DO UPDATE SET
         categoria_id   = EXCLUDED.categoria_id,
         nombre         = EXCLUDED.nombre,
         descripcion    = EXCLUDED.descripcion,
         ingredientes   = EXCLUDED.ingredientes,
         preparacion    = EXCLUDED.preparacion,
         tiempo_minutos = EXCLUDED.tiempo_minutos,
         dificultad     = EXCLUDED.dificultad,
         imagen_asset   = EXCLUDED.imagen_asset,
         bebida         = EXCLUDED.bebida,
         acompanamiento = EXCLUDED.acompanamiento,
         video_url      = EXCLUDED.video_url`,
      valores
    );

    insertadas += resultado.rowCount;
    process.stdout.write(`  recetas ${Math.min(i + tamanoLote, recetas.length)}/${recetas.length}\r`);
  }

  return insertadas;
}

const client = await pool.connect();

try {
  const [categorias, recetas, schema] = await Promise.all([
    readFile(path.join(root, 'database/seed-json/categorias.json'), 'utf-8').then(JSON.parse),
    readFile(path.join(root, 'database/seed-json/recetas.json'), 'utf-8').then(JSON.parse),
    readFile(path.join(root, 'database/schema.sql'), 'utf-8'),
  ]);

  const host = new URL(connectionString.replace(/^postgres(ql)?:/, 'http:')).host;
  console.log(`Conectado a ${host}`);

  console.log('Aplicando schema.sql (CREATE TABLE IF NOT EXISTS)...');
  await client.query(schema);

  await client.query('BEGIN');

  if (reset) {
    // OJO: --reset borra las filas completas, y con ellas las imágenes que
    // buscarImagenes.mjs guardó en imagen_datos. Habría que volver a correr
    // ese script después (tarda). Sin --reset, el upsert de abajo NO toca las
    // columnas imagen_*, así que las fotos se conservan.
    console.log('--reset: borrando historial, favoritos, recetas y categorias...');
    console.log('         ATENCION: esto tambien borra las imagenes guardadas.');
    await client.query('DELETE FROM historial');
    await client.query('DELETE FROM favoritos');
    await client.query('DELETE FROM recetas');
    await client.query('DELETE FROM categorias');
  }

  console.log(`Insertando ${categorias.length} categorias...`);
  for (const categoria of categorias) {
    await client.query(
      `INSERT INTO categorias (id, nombre, slug) VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre, slug = EXCLUDED.slug`,
      [categoria.id, categoria.nombre, categoria.slug]
    );
  }

  console.log(`Insertando ${recetas.length} recetas...`);
  await insertarRecetasEnLotes(client, recetas);
  process.stdout.write('\n');

  // Sincroniza los SERIAL con los ids que acabamos de fijar a mano.
  await client.query("SELECT setval('categorias_id_seq', (SELECT MAX(id) FROM categorias))");
  await client.query("SELECT setval('recetas_id_seq', (SELECT MAX(id) FROM recetas))");

  await client.query('COMMIT');

  const resumen = await client.query(
    `SELECT c.slug, COUNT(r.id)::int AS total
       FROM categorias c
       LEFT JOIN recetas r ON r.categoria_id = c.id
      GROUP BY c.slug
      ORDER BY c.slug`
  );

  console.log('\nListo. Contenido de la base:');
  for (const fila of resumen.rows) {
    console.log(`  ${fila.slug.padEnd(10)} ${String(fila.total).padStart(3)} recetas`);
  }
  const total = resumen.rows.reduce((suma, fila) => suma + fila.total, 0);
  console.log(`  ${'TOTAL'.padEnd(10)} ${String(total).padStart(3)} recetas`);
} catch (error) {
  await client.query('ROLLBACK').catch(() => {});
  console.error('\nFalló el seed:', error.message);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
