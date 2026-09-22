// Agregador de la categoría "bebidas". Los datos viven en ./bebidas/parte-NN.js

import { parte as p1 } from './bebidas/parte-01.js';
import { parte as p2 } from './bebidas/parte-02.js';
import { parte as p3 } from './bebidas/parte-03.js';
import { parte as p4 } from './bebidas/parte-04.js';
import { parte as p5 } from './bebidas/parte-05.js';
import { parte as p6 } from './bebidas/parte-06.js';

export const recetasBebidas = [...p1, ...p2, ...p3, ...p4, ...p5, ...p6];
