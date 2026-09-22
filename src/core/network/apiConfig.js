// URL base del backend NestJS. Se configura con VITE_API_URL en el .env del
// front; si no está definida cae en el puerto por defecto de desarrollo.
//
//   .env            -> VITE_API_URL="http://localhost:3000"
//   .env.production -> VITE_API_URL="https://api.tu-dominio.com"
//
// Ojo: Vite solo expone variables con prefijo VITE_ al código del navegador.
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '');

// Cuánto esperamos al backend antes de darlo por caído y usar el seed local.
// Corto a propósito: si la API no responde rápido, preferimos mostrar la app
// con datos locales antes que dejar al usuario mirando un spinner.
export const API_TIMEOUT_MS = 6000;

// El endpoint /recetas tiene @Max(100) en el DTO, así que 150 recetas por
// categoría no entran en una sola llamada y hay que paginar.
export const API_MAX_LIMIT = 100;
