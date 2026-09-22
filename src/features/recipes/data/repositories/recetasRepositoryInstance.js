import { RecetasRepositoryImpl } from './recetaRepositoryImpl.js';

// Instancia única compartida por todos los providers (recetas, favoritos,
// historial). Antes cada uno creaba la suya, así que cada uno mantenía su
// propia caché y volvía a pedirle al backend lo que otro ya había traído.
export const recetasRepository = new RecetasRepositoryImpl();
