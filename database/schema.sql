-- Esquema PostgreSQL para Neon — Ruleta de Desayunos y Almuerzos
-- Corresponde al modelo descrito en modelo_base_datos_ruleta.md
-- Orden de creación respeta las foreign keys (categorias antes que recetas, etc.)

CREATE TABLE IF NOT EXISTS categorias (
  id     SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  slug   TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS recetas (
  id              SERIAL PRIMARY KEY,
  categoria_id    INTEGER NOT NULL REFERENCES categorias(id),
  nombre          TEXT NOT NULL,
  descripcion     TEXT,
  ingredientes    JSONB NOT NULL DEFAULT '[]',
  preparacion     JSONB NOT NULL DEFAULT '[]',
  tiempo_minutos  INTEGER,
  dificultad      TEXT,
  imagen_asset    TEXT,
  bebida          TEXT,
  acompanamiento  TEXT,
  video_url       TEXT
);

CREATE TABLE IF NOT EXISTS usuarios (
  id             SERIAL PRIMARY KEY,
  nombre         TEXT NOT NULL,
  email          TEXT NOT NULL UNIQUE,
  foto_url       TEXT,
  google_id      TEXT UNIQUE,
  fecha_registro TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS favoritos (
  id             SERIAL PRIMARY KEY,
  usuario_id     INTEGER NOT NULL REFERENCES usuarios(id),
  receta_id      INTEGER NOT NULL REFERENCES recetas(id),
  fecha_guardado TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (usuario_id, receta_id)
);

CREATE TABLE IF NOT EXISTS historial (
  id         SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  receta_id  INTEGER NOT NULL REFERENCES recetas(id),
  fecha      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recetas_categoria_id ON recetas(categoria_id);
CREATE INDEX IF NOT EXISTS idx_favoritos_usuario_id ON favoritos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_historial_usuario_id ON historial(usuario_id);
