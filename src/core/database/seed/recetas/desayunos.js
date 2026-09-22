// Agregador de la categoría "desayunos". Los datos viven en ./desayunos/parte-NN.js

import { parte as p1 } from './desayunos/parte-01.js';
import { parte as p2 } from './desayunos/parte-02.js';
import { parte as p3 } from './desayunos/parte-03.js';
import { parte as p4 } from './desayunos/parte-04.js';
import { parte as p5 } from './desayunos/parte-05.js';
import { parte as p6 } from './desayunos/parte-06.js';

export const recetasDesayunos = [...p1, ...p2, ...p3, ...p4, ...p5, ...p6];
