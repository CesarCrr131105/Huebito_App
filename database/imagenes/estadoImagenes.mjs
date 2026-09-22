// Informe del estado de las imágenes guardadas en la base: cobertura por
// categoría, espacio ocupado, reparto de licencias y qué recetas siguen sin
// foto. Útil después de correr buscarImagenes.mjs.
//
// Uso:
//   node database/imagenes/estadoImagenes.mjs
//   node database/imagenes/estadoImagenes.mjs --faltantes   # lista las que faltan
//   node database/imagenes/estadoImagenes.mjs --nc          # lista las de licencia NC

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const root = path.resolve(import.meta.dirname, '..', '..');
const verFaltantes = process.argv.includes('--faltantes');
const verNc = process.argv.includes('--nc');

async function obtenerConnectionString() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const contenido = await readFile(path.resolve(root, '..', 'Huebito_API', '.env'), 'utf-8');
  const linea = contenido.split(/\r?\n/).find((l) => l.trimStart().startsWith('DATABASE_URL='));
  return linea.slice(linea.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '');
}

const pool = new Pool({ connectionString: await obtenerConnectionString() });
pool.on('error', () => {});

try {
  const porCategoria = await pool.query(
    `SELECT c.slug, COUNT(*)::int total, COUNT(r.imagen_datos)::int con
       FROM recetas r JOIN categorias c ON c.id = r.categoria_id
      GROUP BY c.slug ORDER BY c.slug`
  );

  console.log('Cobertura de imágenes');
  console.log('─'.repeat(46));
  for (const f of porCategoria.rows) {
    const pct = f.total ? Math.round((f.con / f.total) * 100) : 0;
    console.log(`  ${f.slug.padEnd(11)} ${String(f.con).padStart(3)}/${f.total}   ${String(pct).padStart(3)}%`);
  }

  const totales = await pool.query(
    `SELECT COUNT(*)::int total, COUNT(imagen_datos)::int con,
            COALESCE(SUM(imagen_bytes), 0)::bigint bytes,
            COALESCE(AVG(imagen_bytes), 0)::int promedio
       FROM recetas`
  );
  const t = totales.rows[0];
  const pct = Math.round((t.con / t.total) * 100);
  console.log('─'.repeat(46));
  console.log(`  ${'TOTAL'.padEnd(11)} ${String(t.con).padStart(3)}/${t.total}   ${String(pct).padStart(3)}%`);
  console.log(`\n  Espacio en la base: ${(Number(t.bytes) / 1024 / 1024).toFixed(1)} MB`);
  console.log(`  Promedio por foto:  ${Math.round(t.promedio / 1024)} KB`);

  const licencias = await pool.query(
    `SELECT imagen_licencia lic, COUNT(*)::int n
       FROM recetas WHERE imagen_datos IS NOT NULL
      GROUP BY imagen_licencia ORDER BY n DESC`
  );
  console.log('\nLicencias');
  console.log('─'.repeat(46));
  for (const f of licencias.rows) {
    console.log(`  ${String(f.n).padStart(3)}  ${f.lic}`);
  }

  // Las licencias NC impiden el uso comercial: conviene tenerlas a la vista.
  const nc = await pool.query(
    `SELECT COUNT(*)::int n FROM recetas
      WHERE imagen_datos IS NOT NULL AND imagen_licencia ILIKE '%nc%'`
  );
  if (nc.rows[0].n > 0) {
    console.log(`\n  ${nc.rows[0].n} fotos con licencia NC: bloquean el uso comercial de la app.`);
    console.log('  Correr con --nc para listarlas.');
  }

  if (verNc) {
    const lista = await pool.query(
      `SELECT id, nombre, imagen_licencia FROM recetas
        WHERE imagen_datos IS NOT NULL AND imagen_licencia ILIKE '%nc%'
        ORDER BY nombre`
    );
    console.log('\nFotos con licencia NC');
    console.log('─'.repeat(46));
    for (const f of lista.rows) console.log(`  [${f.id}] ${f.nombre} — ${f.imagen_licencia}`);
  }

  if (verFaltantes) {
    const lista = await pool.query(
      `SELECT r.id, r.nombre, c.slug FROM recetas r JOIN categorias c ON c.id = r.categoria_id
        WHERE r.imagen_datos IS NULL ORDER BY c.slug, r.nombre`
    );
    console.log(`\nRecetas sin imagen (${lista.rowCount})`);
    console.log('─'.repeat(46));
    for (const f of lista.rows) console.log(`  [${f.slug}] ${f.nombre}`);
  }
} finally {
  await pool.end();
}
