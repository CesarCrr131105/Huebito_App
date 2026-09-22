// Agregador de la categoría "almuerzos". Los datos viven en ./almuerzos/parte-NN.js

import { parte as p1 } from './almuerzos/parte-01.js';
import { parte as p2 } from './almuerzos/parte-02.js';
import { parte as p3 } from './almuerzos/parte-03.js';
import { parte as p4 } from './almuerzos/parte-04.js';
import { parte as p5 } from './almuerzos/parte-05.js';
import { parte as p6 } from './almuerzos/parte-06.js';

export const recetasAlmuerzos = [...p1, ...p2, ...p3, ...p4, ...p5, ...p6];
