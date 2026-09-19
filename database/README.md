# Exportación a Neon

Este directorio contiene lo necesario para llevar los datos actuales de
`src/core/database/seed/*.js` a una base de datos PostgreSQL en Neon,
siguiendo el proceso descrito en `modelo_base_datos_ruleta.md`.

No reemplaza los archivos `.js` originales — la app sigue funcionando con
ellos hasta que se conecte a una API/Neon. Estos archivos son solo la
exportación para importar.

## Contenido

- `schema.sql` — `CREATE TABLE` de las 5 tablas (`categorias`, `recetas`,
  `usuarios`, `favoritos`, `historial`), con sus PK/FK/UNIQUE.
- `seed-sql/insertar-datos.sql` — **sentencias `INSERT` listas para
  pegar y correr en el SQL Editor de Neon**, sin instalar nada. Es la
  forma más simple: copiar, pegar, ejecutar.
- `seed-json/categorias.json` / `seed-json/recetas.json` — para importar
  con un script (ver sección "Opción C — Con JSON + script" más abajo).
- `seed-csv/categorias.csv` / `seed-csv/recetas.csv` — **para el botón
  "Import data" de la consola de Neon**, que acepta CSV directamente por
  tabla. Las columnas `ingredientes` y `preparacion` (tipo `JSONB`) van
  como texto JSON dentro de la celda (ej. `["4 panes franceses", ...]`);
  Neon/Postgres lo interpreta igual que en un `INSERT` normal.

En ambos formatos, las recetas ya traen `categoria_id` resuelto (en vez
de `categoria_slug`) para calzar con la FK `recetas.categoria_id →
categorias.id`.

`usuarios`, `favoritos` e `historial` no tienen datos de ejemplo porque
se llenan en tiempo de uso (no hay semilla para ellas).

Si vuelves a cambiar `categoriasSeedData.js` o `recetasSeedData.js`,
regenera estos archivos con:

```bash
node database/generar-sql.mjs
node database/generar-json.mjs
node database/generar-csv.mjs
```

## Cómo importar en Neon

Paso 1, igual en los tres caminos: abre tu proyecto en
[console.neon.tech](https://console.neon.tech) → **SQL Editor**, pega y
ejecuta `schema.sql` completo. Esto crea las 5 tablas en orden correcto.

### Opción A — Con SQL directo (la más simple, recomendada)

1. Abre `seed-sql/insertar-datos.sql`, copia todo su contenido.
2. Pégalo en el mismo SQL Editor de Neon (puede ser justo debajo de
   `schema.sql`, o en una consulta nueva) y ejecútalo.
3. Ya incluye el `setval` de las secuencias al final, así que no hace
   falta ningún paso extra.

No requiere instalar `psql` ni usar el botón de import — solo copiar y
pegar.

### Opción B — Con CSV (vía la interfaz de Neon)

1. Ve a la pestaña **Tables**, abre la tabla `categorias` → botón
   **Import data** (o el ícono de subir archivo) → sube
   `seed-csv/categorias.csv`. Confirma que detecte la primera fila como
   encabezado.
2. Abre la tabla `recetas` → **Import data** → sube
   `seed-csv/recetas.csv`. Debe hacerse *después* de categorías, porque
   `categoria_id` es una FK que depende de que esas filas ya existan.
3. Como los `id` vienen fijados explícitamente en el CSV (1, 2, 3...),
   la secuencia interna de Postgres para `SERIAL` no se entera y el
   próximo `INSERT` sin id explícito podría chocar. Corre esto una vez
   en el SQL Editor después de importar:

   ```sql
   SELECT setval('categorias_id_seq', (SELECT MAX(id) FROM categorias));
   SELECT setval('recetas_id_seq', (SELECT MAX(id) FROM recetas));
   ```

### Opción C — Con JSON + script

Útil si prefieres hacerlo por código en vez de la interfaz, o para
automatizarlo. Recorre `seed-json/categorias.json` y
`seed-json/recetas.json` (en ese orden) insertando fila por fila con
`INSERT INTO ... VALUES (...)`.

Ejemplo mínimo de script de importación (no incluido aquí porque
requiere la connection string de Neon, que es un secreto):

```js
import { neon } from '@neondatabase/serverless';
import categorias from './seed-json/categorias.json' assert { type: 'json' };
import recetas from './seed-json/recetas.json' assert { type: 'json' };

const sql = neon(process.env.DATABASE_URL);

for (const c of categorias) {
  await sql`INSERT INTO categorias (id, nombre, slug)
            VALUES (${c.id}, ${c.nombre}, ${c.slug})
            ON CONFLICT (id) DO NOTHING`;
}

for (const r of recetas) {
  await sql`INSERT INTO recetas
            (id, categoria_id, nombre, descripcion, ingredientes, preparacion,
             tiempo_minutos, dificultad, imagen_asset, bebida, acompanamiento, video_url)
            VALUES (${r.id}, ${r.categoria_id}, ${r.nombre}, ${r.descripcion},
                    ${JSON.stringify(r.ingredientes)}, ${JSON.stringify(r.preparacion)},
                    ${r.tiempo_minutos}, ${r.dificultad}, ${r.imagen_asset},
                    ${r.bebida}, ${r.acompanamiento}, ${r.video_url})
            ON CONFLICT (id) DO NOTHING`;
}

// Para que el próximo INSERT sin id explícito no choque con los ids ya usados:
await sql`SELECT setval('categorias_id_seq', (SELECT MAX(id) FROM categorias))`;
await sql`SELECT setval('recetas_id_seq', (SELECT MAX(id) FROM recetas))`;
```

### Verificación (cualquiera de las tres opciones)

En el SQL Editor de Neon: `SELECT count(*) FROM categorias;` debe dar 2,
y `SELECT count(*) FROM recetas;` debe dar 38.
