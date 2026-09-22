// Fuente canónica del seed de recetas. Los datos reales viven divididos por
// categoría en ./recetas/<categoria>/parte-NN.js y se agregan aquí en un solo
// arreglo plano, que es lo que consumen appDatabase.js y los generadores de
// database/*.mjs (JSON, SQL y CSV para Neon).

import { recetasDesayunos } from './recetas/desayunos.js';
import { recetasAlmuerzos } from './recetas/almuerzos.js';
import { recetasBebidas } from './recetas/bebidas.js';

export const recetasSeedData = [
  ...recetasDesayunos,
  ...recetasAlmuerzos,
  ...recetasBebidas,
];
