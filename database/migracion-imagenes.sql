-- Agrega el almacenamiento de imágenes dentro de la propia tabla recetas.
-- Las columnas son nullable a propósito: no toda receta consigue una imagen
-- con licencia usable, y la app cae en el placeholder de ícono cuando falta.

ALTER TABLE recetas
  ADD COLUMN IF NOT EXISTS imagen_datos     BYTEA,   -- el binario WebP ya redimensionado
  ADD COLUMN IF NOT EXISTS imagen_mime      TEXT,    -- 'image/webp'
  ADD COLUMN IF NOT EXISTS imagen_ancho     INTEGER,
  ADD COLUMN IF NOT EXISTS imagen_alto      INTEGER,
  ADD COLUMN IF NOT EXISTS imagen_bytes     INTEGER, -- tamaño, para diagnóstico
  ADD COLUMN IF NOT EXISTS imagen_fuente    TEXT,    -- URL de la página de origen
  ADD COLUMN IF NOT EXISTS imagen_autor     TEXT,    -- requerido por CC BY / BY-SA
  ADD COLUMN IF NOT EXISTS imagen_licencia  TEXT,    -- 'CC BY-SA 4.0', 'CC0', etc.
  ADD COLUMN IF NOT EXISTS imagen_query     TEXT;    -- con qué término se encontró

-- Índice parcial para poder listar rápido qué recetas ya tienen imagen.
CREATE INDEX IF NOT EXISTS idx_recetas_con_imagen
  ON recetas ((imagen_datos IS NOT NULL));
